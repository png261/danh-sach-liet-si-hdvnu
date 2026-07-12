import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_FILE = join(ROOT, "data", "martyrs_db.json");
const OUT_DIR = join(ROOT, "public", "data");

function normalizeString(str) {
  if (!str) return "";
  return str.normalize("NFC").trim();
}

function getSlug(cemeteryName) {
  const norm = normalizeString(cemeteryName).toLowerCase();
  if (norm.includes("tứ kỳ") || norm.includes("tu_ky") || norm.includes("tu-ky") || norm.includes("thị trấn")) {
    return "tu-ky";
  }
  if (norm.includes("minh đức") || norm.includes("minh_duc") || norm.includes("minh-duc")) {
    return "minh-duc";
  }
  if (norm.includes("quang khải") || norm.includes("quang_khai") || norm.includes("quang-khai")) {
    return "quang-khai";
  }
  if (norm.includes("quang phục") || norm.includes("quang_phuc") || norm.includes("quang-phuc")) {
    return "quang-phuc";
  }
  return "";
}

function run() {
  if (!existsSync(DATA_FILE)) {
    console.error(`Error: martyrs_db.json not found at ${DATA_FILE}`);
    process.exit(1);
  }

  // Create public/data if not exists
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUT_DIR}`);
  }

  const raw = readFileSync(DATA_FILE, "utf-8");
  const martyrs = JSON.parse(raw);

  // Group martyrs by slug
  const grouped = {
    "tu-ky": [],
    "minh-duc": [],
    "quang-khai": [],
    "quang-phuc": []
  };

  let unmappedCount = 0;

  for (const m of martyrs) {
    const slug = getSlug(m.cemetery);
    if (slug && grouped[slug] !== undefined) {
      grouped[slug].push(m);
    } else {
      console.warn(`Warning: Martyr ${m.name} has unmapped cemetery: "${m.cemetery}"`);
      unmappedCount++;
    }
  }

  // Write each group to static json files
  for (const [slug, list] of Object.entries(grouped)) {
    const outFile = join(OUT_DIR, `${slug}.json`);
    writeFileSync(outFile, JSON.stringify(list, null, 2), "utf-8");
    console.log(`Successfully wrote ${list.length} martyrs to ${outFile}`);
  }

  console.log("Partition completed successfully.");
  if (unmappedCount > 0) {
    console.warn(`Finished with ${unmappedCount} unmapped martyrs.`);
  }
}

run();
