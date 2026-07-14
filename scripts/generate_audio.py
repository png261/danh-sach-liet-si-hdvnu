import os
import sys
import json
import glob
import asyncio
import edge_tts
import requests
from pathlib import Path
from urllib.parse import quote

def load_env():
    env = {}
    env_path = Path(__file__).resolve().parent.parent / ".env.local"
    if not env_path.exists():
        print("❌ .env.local not found!")
        sys.exit(1)
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            env[key.strip()] = val.strip()
    return env

def get_physical_zone(martyr):
    return martyr.get("zone") or "A"

def compose_bio(martyr):
    name = martyr.get("name", "").strip()
    cemetery = martyr.get("cemetery", "").strip()
    grave_no = (martyr.get("grave_no") or "").strip()
    row_no = (martyr.get("row_no") or "").strip()
    zone = get_physical_zone(martyr)
    
    parts = [
        "Thông tin Anh hùng Liệt sĩ.",
        f"Họ và tên: {name}.",
        f"Nghĩa trang: {cemetery}.",
        f"Vị trí phần mộ: Mộ số {grave_no or 'Chưa rõ'}, hàng số {row_no or 'Chưa rõ'}, khu vực {zone}."
    ]
    
    if martyr.get("birth_year"):
        parts.append(f"Sinh năm: {martyr.get('birth_year').strip()}.")
    if martyr.get("hometown"):
        parts.append(f"Quê quán: {martyr.get('hometown').strip()}.")
    if martyr.get("enlistment_date"):
        parts.append(f"Nhập ngũ: {martyr.get('enlistment_date').strip()}.")
    if martyr.get("rank"):
        parts.append(f"Cấp bậc: {martyr.get('rank').strip()}.")
    if martyr.get("unit"):
        parts.append(f"Đơn vị: {martyr.get('unit').strip()}.")
    if martyr.get("death_date"):
        parts.append(f"Hy sinh ngày: {martyr.get('death_date').strip()}.")
    if martyr.get("relics"):
        parts.append(f"Di vật lưu giữ: {martyr.get('relics').strip()}.")
    if martyr.get("notes"):
        parts.append(f"Ghi chú: {martyr.get('notes').strip()}.")
        
    return " ".join(parts)

def make_safe_id(martyr_id):
    import unicodedata
    s = martyr_id.lower()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace('đ', 'd')
    s = s.replace(' ', '_')
    s = ''.join(c for c in s if c.isalnum() or c == '_')
    return s

def get_existing_audios(supabase_url, secret_key):
    url = f"{supabase_url}/storage/v1/object/list/assets"
    headers = {
        "apikey": secret_key,
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json"
    }
    data = {
        "prefix": "audios",
        "limit": 10000
    }
    try:
        r = requests.post(url, headers=headers, json=data, timeout=15)
        if r.status_code == 200:
            files = r.json()
            return {f["name"] for f in files if f.get("name")}
        else:
            print(f"⚠️ Warning: Could not list storage bucket files (HTTP {r.status_code}). Will fallback to individual checks.")
            return None
    except Exception as e:
        print(f"⚠️ Warning: Error listing storage bucket files ({str(e)}). Will fallback to individual checks.")
        return None

def check_exists(supabase_url, martyr_id, existing_audios=None):
    safe_id = make_safe_id(martyr_id)
    filename = f"{safe_id}.mp3"
    
    if existing_audios is not None:
        return filename in existing_audios
        
    url = f"{supabase_url}/storage/v1/object/public/assets/audios/{safe_id}.mp3"
    try:
        r = requests.head(url, timeout=5)
        return r.status_code == 200
    except Exception:
        return False

async def generate_and_upload(martyr, supabase_url, secret_key, temp_dir, semaphore, progress_counter, existing_audios, failed_ids):
    martyr_id = martyr.get("id")
    if not martyr_id:
        return True
        
    safe_id = make_safe_id(martyr_id)
    
    async with semaphore:
        # Check if already exists in Supabase Storage
        if check_exists(supabase_url, martyr_id, existing_audios):
            progress_counter["skipped"] += 1
            total_processed = progress_counter["skipped"] + progress_counter["success"] + progress_counter["failed"]
            if total_processed % 50 == 0 or total_processed == progress_counter["total"]:
                print(f"  ⚡ Progress: {total_processed}/{progress_counter['total']} processed...")
            return True
            
        # Compose text
        text = compose_bio(martyr)
        
        # Temp file path
        local_path = temp_dir / f"{safe_id}.mp3"
        
        max_retries = 3
        success = False
        
        for attempt in range(1, max_retries + 1):
            try:
                # Generate speech
                communicate = edge_tts.Communicate(text, "vi-VN-HoaiMyNeural", rate="-10%")
                await communicate.save(str(local_path))
                
                # Upload to Supabase Storage
                upload_url = f"{supabase_url}/storage/v1/object/assets/audios/{safe_id}.mp3"
                headers = {
                    "apikey": secret_key,
                    "Authorization": f"Bearer {secret_key}",
                    "Content-Type": "audio/mpeg",
                    "x-upsert": "true"
                }
                
                with open(local_path, "rb") as f:
                    r = requests.post(upload_url, headers=headers, data=f, timeout=30)
                    
                if r.status_code == 200:
                    success = True
                    progress_counter["success"] += 1
                    print(f"  ✅ [{progress_counter['success'] + progress_counter['skipped'] + progress_counter['failed']}/{progress_counter['total']}] Generated & Uploaded: {martyr_id} -> {safe_id}.mp3")
                    # Remove temp file
                    if local_path.exists():
                        local_path.unlink()
                    break
                else:
                    print(f"  ⚠️ Attempt {attempt}/{max_retries} failed to upload {martyr_id} (safe: {safe_id}): HTTP {r.status_code} - {r.text}")
            except Exception as e:
                print(f"  ⚠️ Attempt {attempt}/{max_retries} error for {martyr_id} (safe: {safe_id}): {str(e)}")
            
            if attempt < max_retries:
                # Exponential backoff
                await asyncio.sleep(2 * attempt)
                
        if not success:
            progress_counter["failed"] += 1
            failed_ids.append(martyr_id)
            print(f"  ❌ Failed to process {martyr_id} (safe: {safe_id}) after {max_retries} attempts.")
            return False
            
        return True

async def main():
    print("🚀 Starting TTS Generation & Supabase Upload Script...")
    
    env = load_env()
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    secret_key = env.get("SUPABASE_SECRET_KEY")
    
    if not supabase_url or not secret_key:
        print("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local")
        sys.exit(1)
        
    # Find all JSON data files
    root_dir = Path(__file__).resolve().parent.parent
    data_files = glob.glob(str(root_dir / "public" / "data" / "*.json"))
    
    all_martyrs = []
    for f_path in data_files:
        with open(f_path, "r", encoding="utf-8") as f:
            records = json.load(f)
            # Normalize records
            for r in records:
                r["cemetery"] = r.get("cemetery", "").encode('utf-8').decode('utf-8')
                r["name"] = r.get("name", "").encode('utf-8').decode('utf-8')
                r["hometown"] = r.get("hometown", "").encode('utf-8').decode('utf-8')
            all_martyrs.extend(records)
            
    print("🔍 Fetching list of already uploaded audio files from Supabase Storage...")
    existing_audios = get_existing_audios(supabase_url, secret_key)
    if existing_audios is not None:
        print(f"📂 Found {len(existing_audios)} audio files already uploaded.")
    else:
        print("⚠️ Proceeding with individual checks (will be slower)...")

    total_count = len(all_martyrs)
    print(f"📂 Found {len(data_files)} data files with {total_count} total martyrs.")
    
    temp_dir = root_dir / "scripts" / "temp_audios"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    # Use semaphore to limit concurrent tasks (max 5)
    semaphore = asyncio.Semaphore(5)
    
    # We will loop in passes to automatically retry any failed generations
    failed_martyrs = all_martyrs.copy()
    pass_num = 1
    max_passes = 3
    final_failed_ids = []
    
    while failed_martyrs and pass_num <= max_passes:
        if pass_num > 1:
            print(f"\n🔄 [Pass {pass_num}] Retrying {len(failed_martyrs)} failed audios after a brief cooldown...")
            await asyncio.sleep(5)
            # Re-fetch already uploaded files list from storage to avoid trying to upload files
            # that actually succeeded but returned timeouts in requests
            existing_audios = get_existing_audios(supabase_url, secret_key)
            if existing_audios is None:
                existing_audios = set()
        
        progress_counter = {
            "success": 0,
            "skipped": 0,
            "failed": 0,
            "total": len(failed_martyrs)
        }
        
        current_failed_ids = []
        
        tasks = [
            generate_and_upload(martyr, supabase_url, secret_key, temp_dir, semaphore, progress_counter, existing_audios, current_failed_ids)
            for martyr in failed_martyrs
        ]
        
        await asyncio.gather(*tasks)
        
        print(f"\n📊 Pass {pass_num} Completed:")
        print(f"   - Total checked in this pass: {progress_counter['total']}")
        print(f"   - New Success: {progress_counter['success']}")
        print(f"   - Skipped: {progress_counter['skipped']}")
        print(f"   - Failed: {progress_counter['failed']}")
        
        # Filter failed_martyrs for the next pass
        failed_martyrs = [m for m in failed_martyrs if m.get("id") in current_failed_ids]
        final_failed_ids = current_failed_ids
        pass_num += 1

    print("\n🎉 Audio Generation and Upload Process Completed!")
    print(f"   - Total records in dataset: {total_count}")
    print(f"   - Final Failed count: {len(final_failed_ids)}")
    
    # Save final failed IDs to scripts/failed-audio.json
    failed_path = root_dir / "scripts" / "failed-audio.json"
    try:
        with open(failed_path, "w", encoding="utf-8") as f:
            json.dump(final_failed_ids, f, ensure_ascii=False, indent=2)
        print(f"📝 Saved {len(final_failed_ids)} final failed martyr IDs to {failed_path}")
    except Exception as e:
        print(f"⚠️ Failed to save failure log to {failed_path}: {str(e)}")
        
    # Cleanup temp directory if empty
    try:
        if temp_dir.exists() and not any(temp_dir.iterdir()):
            temp_dir.rmdir()
    except Exception:
        pass

if __name__ == "__main__":
    asyncio.run(main())
