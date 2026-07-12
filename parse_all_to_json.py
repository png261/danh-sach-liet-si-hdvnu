import os
import re
import json
import pandas as pd

directory = "danh sách liệt sĩ các nghĩa trang"
files = [f for f in os.listdir(directory) if f.endswith('.xlsx')]

def clean_text(text):
    if not isinstance(text, str):
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def parse_info_block(info_str):
    if not isinstance(info_str, str) or not info_str.strip():
        return {}
    
    # Pre-process: replace 3 or more spaces with newlines to handle side-by-side text
    normalized_info = re.sub(r' {3,}', '\n', info_str)
    
    lines = [line.strip() for line in normalized_info.split('\n') if line.strip()]
    if not lines:
        return {}
    
    result = {
        "name": "",
        "birth_year": "",
        "enlistment_date": "",
        "hometown": "",
        "death_date": "",
        "rank": "",
        "unit": "",
        "raw_info": info_str
    }
    
    keywords = ["sinh năm", "năm sinh", "nhập ngũ", "quê quán", "nguyên quán", "hy sinh", "cấp bậc", "đơn vị"]
    
    # 1. Parse name
    first_line = lines[0]
    prefix_match = re.match(r'^(Liệt\s*sỹ|Liệt\s*sĩ|L\.Sĩ|L\.sỹ|LS)\s*:?\s*(.*)', first_line, re.IGNORECASE)
    
    if prefix_match:
        name_part = prefix_match.group(2).strip()
        if name_part:
            # Check if it contains keywords
            has_kw = any(re.search(r'\b' + kw + r'\b', name_part, re.IGNORECASE) for kw in keywords)
            if has_kw:
                # Name part has keywords, split it
                name_clean = re.split(r'\b(?:Cấp\s*bậc|Đơn\s*vị|Sinh\s*năm|Nhập\s*ngũ|Quê\s*quán|Nguyên\s*quán|Hy\s*sinh)\b', name_part, flags=re.IGNORECASE)[0]
                result["name"] = name_clean.strip("-,. ")
                lines_for_fields = lines
            else:
                result["name"] = name_part
                lines_for_fields = lines[1:]
        else:
            if len(lines) > 1:
                next_line = lines[1]
                is_field = any(next_line.lower().startswith(kw) or re.search(r'^' + kw + r'\b', next_line, re.IGNORECASE) for kw in keywords)
                if is_field:
                    result["name"] = "Chưa xác định danh tính"
                    lines_for_fields = lines[1:]
                else:
                    result["name"] = next_line
                    lines_for_fields = lines[2:]
            else:
                result["name"] = "Chưa xác định danh tính"
                lines_for_fields = []
    else:
        is_field = any(first_line.lower().startswith(kw) or re.search(r'^' + kw + r'\b', first_line, re.IGNORECASE) for kw in keywords)
        if is_field:
            result["name"] = "Chưa xác định danh tính"
            lines_for_fields = lines
        else:
            result["name"] = first_line
            lines_for_fields = lines[1:]
            
    # Clean name
    result["name"] = result["name"].strip("-,. ")
    if result["name"].lower() in ["chưa xác định được thông tin", "chưa xác định", "chưa xác định danh tính", ""]:
        result["name"] = "Chưa xác định danh tính"
        result["is_unknown"] = True
    else:
        result["is_unknown"] = False
        
    full_text = "\n".join(lines_for_fields)
    
    # Helper to extract a field and truncate it at other keywords
    def extract_field(patterns, full_text):
        for pattern in patterns:
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                val = match.group(match.lastindex).strip()
                val_clean = re.split(r'\b(?:Sinh\s*năm|Năm\s*sinh|Nhập\s*ngũ|nhập\s*ngũ|Quê\s*quán|Nguyên\s*quán|Hy\s*sinh|Cấp\s*bậc|Đơn\s*vị|Chức\s*vụ|CV)\b', val, flags=re.IGNORECASE)[0]
                val_clean = val_clean.strip("-,. ")
                if val_clean and not all(c in '- ' for c in val_clean):
                    return val_clean
        return ""
        
    result["birth_year"] = extract_field([r'(Sinh\s*năm|Năm\s*sinh)\s*:?\s*([^\n\r]+)'], full_text)
    result["enlistment_date"] = extract_field([r'(nhập\s*ngũ|Nhập\s*ngũ)\s*:?\s*([^\n\r]+)'], full_text)
    result["hometown"] = extract_field([r'(Quê\s*quán|Nguyên\s*quán)\s*:?\s*([^\n\r]+)'], full_text)
    result["death_date"] = extract_field([r'(Hy\s*sinh|ngày\s*hy\s*sinh|Hy\s*sinh\s*năm)\s*(năm)?\s*:?\s*([^\n\r]+)'], full_text)
    result["rank"] = extract_field([r'(Cấp\s*bậc)\s*:?\s*([^\n\r]+)'], full_text)
    result["unit"] = extract_field([r'(Đơn\s*vị)\s*:?\s*([^\n\r]+)'], full_text)
    
    # Handle multi-line hometown if it flows to next line
    if result["hometown"]:
        for i, line in enumerate(lines_for_fields):
            if "quê quán" in line.lower() or "nguyên quán" in line.lower():
                if i + 1 < len(lines_for_fields):
                    next_line = lines_for_fields[i+1]
                    if not any(kwd in next_line.lower() for kwd in keywords):
                        result["hometown"] += ", " + next_line
                break
                
    result["hometown"] = result["hometown"].strip("-,. ")
    
    # Clean up all string fields
    for k in ["birth_year", "enlistment_date", "hometown", "death_date", "rank", "unit"]:
        result[k] = clean_text(result[k])

    return result

all_martyrs = []

for f in files:
    path = os.path.join(directory, f)
    cemetery_default = "Nghĩa trang liệt sĩ " + os.path.splitext(f)[0]
    xls = pd.ExcelFile(path)
    
    for sheet in xls.sheet_names:
        if '84' in sheet:
            df = pd.read_excel(path, sheet_name=sheet, header=None)
            current_cemetery = cemetery_default
            
            for idx, row in df.iterrows():
                val0 = str(row.iloc[0]).strip()
                
                # Check for category changes
                if pd.notna(row.iloc[0]) and not val0.isdigit():
                    row_str = " ".join([str(val) for val in row if pd.notna(val)])
                    if "Nghĩa trang" in row_str or "nghĩa trang" in row_str:
                        for cell in row:
                            if pd.notna(cell) and ("Nghĩa trang" in str(cell) or "nghĩa trang" in str(cell)):
                                parsed_cem = clean_text(str(cell))
                                # Filter out the column header row labels
                                if "Tên nghĩa trang liệt sĩ" not in parsed_cem:
                                    current_cemetery = parsed_cem
                                    break
                
                if val0.isdigit():
                    grave_no = clean_text(str(row.iloc[2])) if pd.notna(row.iloc[2]) else ""
                    row_no = clean_text(str(row.iloc[3])) if pd.notna(row.iloc[3]) else ""
                    zone = clean_text(str(row.iloc[4])) if pd.notna(row.iloc[4]) else ""
                    lot = clean_text(str(row.iloc[5])) if pd.notna(row.iloc[5]) else ""
                    
                    info_cell = row.iloc[6] if len(row) > 6 else ""
                    
                    # Skip header index row
                    if grave_no == "3" and row_no == "4" and zone == "5" and lot == "6":
                        continue
                    
                    parsed = parse_info_block(info_cell)
                    if not parsed:
                        continue
                        
                    parsed["cemetery"] = current_cemetery
                    parsed["source_file"] = f
                    parsed["grave_no"] = grave_no
                    parsed["row_no"] = row_no
                    parsed["zone"] = zone
                    parsed["lot"] = lot
                    
                    parsed["relics"] = clean_text(str(row.iloc[7])) if len(row) > 7 and pd.notna(row.iloc[7]) else ""
                    parsed["gather_location"] = clean_text(str(row.iloc[9])) if len(row) > 9 and pd.notna(row.iloc[9]) else ""
                    parsed["gather_unit"] = clean_text(str(row.iloc[10])) if len(row) > 10 and pd.notna(row.iloc[10]) else ""
                    parsed["move_location"] = clean_text(str(row.iloc[11])) if len(row) > 11 and pd.notna(row.iloc[11]) else ""
                    parsed["move_person"] = clean_text(str(row.iloc[12])) if len(row) > 12 and pd.notna(row.iloc[12]) else ""
                    parsed["notes"] = clean_text(str(row.iloc[13])) if len(row) > 13 and pd.notna(row.iloc[13]) else ""
                    
                    parsed["id"] = f"{os.path.splitext(f)[0].lower()}_{idx}"
                    all_martyrs.append(parsed)

# Save to json file
output_path = "data/martyrs_db.json"
with open(output_path, 'w', encoding='utf-8') as f_out:
    json.dump(all_martyrs, f_out, ensure_ascii=False, indent=2)

print(f"Successfully parsed {len(all_martyrs)} martyrs and saved to {output_path}")
