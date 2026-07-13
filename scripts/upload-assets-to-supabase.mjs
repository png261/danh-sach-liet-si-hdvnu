// scripts/upload-assets-to-supabase.mjs
// Run: node scripts/upload-assets-to-supabase.mjs
// Uploads all media assets from public/ to Supabase Storage bucket "assets"

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Load env manually (dotenv not needed for this script)
const envFile = readFileSync(join(ROOT, ".env.local"), "utf-8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim()))
);

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_SECRET = env["SUPABASE_SECRET_KEY"];
const BUCKET = "assets";

if (!SUPABASE_URL || !SUPABASE_SECRET) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);

const MIME = {
  ".webp": "image/webp",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".mp4":  "video/mp4",
  ".mp3":  "audio/mpeg",
};

// Files to skip (keep in repo)
const SKIP = new Set([
  "icon.png",
  "logo_svtn_og.png",
  "logo_doan_xa_og.png",
  "file.svg",
  "globe.svg",
  "next.svg",
  "vercel.svg",
  "window.svg",
  // skip intro_bg_video.mp4 - too large, user excluded already
]);

async function uploadFile(localPath, remoteName) {
  const ext = extname(localPath).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";
  const fileBuffer = readFileSync(localPath);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(remoteName, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error(`  ❌ ${remoteName}: ${error.message}`);
    return false;
  }
  const size = (statSync(localPath).size / 1024).toFixed(0);
  console.log(`  ✅ ${remoteName} (${size}KB)`);
  return true;
}

async function main() {
  console.log("🚀 Uploading assets to Supabase Storage...\n");

  const publicDir = join(ROOT, "public");
  const files = readdirSync(publicDir).filter(f => {
    const ext = extname(f).toLowerCase();
    return Object.keys(MIME).includes(ext) && !SKIP.has(f);
  });

  let ok = 0;
  for (const file of files) {
    const localPath = join(publicDir, file);
    if (statSync(localPath).isFile()) {
      const success = await uploadFile(localPath, file);
      if (success) ok++;
    }
  }

  console.log(`\n✅ Done: ${ok}/${files.length} files uploaded`);
  console.log(`\n🔗 CDN base URL:`);
  console.log(`   ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`);
}

main().catch(e => { console.error(e); process.exit(1); });
