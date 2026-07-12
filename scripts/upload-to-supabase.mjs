// scripts/upload-to-supabase.mjs
// Run: node scripts/upload-to-supabase.mjs
// Uploads all martyr records from public/data/*.json to Supabase

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
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
const SUPABASE_KEY = env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FILES = ["tu-ky", "minh-duc", "quang-khai", "quang-phuc"];
const BATCH_SIZE = 100;

async function uploadFile(slug) {
  const filePath = join(ROOT, "public", "data", `${slug}.json`);
  const records = JSON.parse(readFileSync(filePath, "utf-8"));
  console.log(`\n📂 ${slug}: ${records.length} records`);

  // Normalize NFC for Vietnamese text
  const normalized = records.map((m) => ({
    ...m,
    cemetery: m.cemetery.normalize("NFC"),
    name: m.name?.normalize("NFC") ?? "",
    hometown: m.hometown?.normalize("NFC") ?? "",
  }));

  // Upload in batches
  let uploaded = 0;
  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const batch = normalized.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("martyrs")
      .upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(`  ❌ Batch ${i}-${i + BATCH_SIZE} failed:`, error.message);
    } else {
      uploaded += batch.length;
      process.stdout.write(`  ✓ ${uploaded}/${normalized.length}\r`);
    }
  }
  console.log(`  ✅ Done: ${uploaded}/${normalized.length} uploaded`);
}

async function main() {
  console.log("🚀 Uploading martyrs data to Supabase...");
  console.log(`   URL: ${SUPABASE_URL}`);

  for (const slug of FILES) {
    await uploadFile(slug);
  }

  // Verify total count
  const { count } = await supabase
    .from("martyrs")
    .select("*", { count: "exact", head: true });

  console.log(`\n✅ Total records in Supabase: ${count}`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
