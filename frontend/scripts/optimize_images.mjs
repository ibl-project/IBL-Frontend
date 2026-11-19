/**
 * Image Optimization Script
 * Converts PNG/JPG images to WebP format using sharp.
 * Skips files that already have a .webp version or are too small to bother.
 *
 * Usage (run from frontend/): node scripts/optimize_images.mjs [--dry-run] [--quality 80] [--min-size 50]
 *   --dry-run    : Preview what would be converted without actually doing it
 *   --quality N  : WebP quality (1-100, default: 80)
 *   --min-size N : Minimum file size in KB to consider for conversion (default: 50)
 */

import { readdir, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const qualityIdx = args.indexOf("--quality");
const quality = qualityIdx !== -1 ? parseInt(args[qualityIdx + 1], 10) : 80;
const minSizeIdx = args.indexOf("--min-size");
const minSizeKB = minSizeIdx !== -1 ? parseInt(args[minSizeIdx + 1], 10) : 50;

const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

async function getAllFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function optimizeImages() {
  console.log("=== Image Optimization Script ===");
  console.log(`Mode: ${dryRun ? "DRY RUN (no files will be created)" : "LIVE"}`);
  console.log(`WebP Quality: ${quality}`);
  console.log(`Min file size: ${minSizeKB} KB`);
  console.log(`Scanning: ${PUBLIC_DIR}\n`);

  const allFiles = await getAllFiles(PUBLIC_DIR);
  const imageFiles = allFiles.filter((f) => SUPPORTED_EXTENSIONS.has(path.extname(f).toLowerCase()));

  console.log(`Found ${imageFiles.length} image(s) to evaluate.\n`);

  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let convertedCount = 0;
  let skippedCount = 0;
  const results = [];

  for (const filePath of imageFiles) {
    const ext = path.extname(filePath);
    const baseName = filePath.slice(0, -ext.length);
    const webpPath = baseName + ".webp";
    const relativePath = path.relative(PUBLIC_DIR, filePath);

    const fileStat = await stat(filePath);
    const fileSizeKB = Math.round(fileStat.size / 1024);

    // Check if webp already exists
    let webpExists = false;
    try {
      await stat(webpPath);
      webpExists = true;
    } catch {
      // doesn't exist
    }

    if (webpExists) {
      const webpStat = await stat(webpPath);
      const webpSizeKB = Math.round(webpStat.size / 1024);
      console.log(`SKIP (webp exists): ${relativePath} (${fileSizeKB} KB -> existing webp: ${webpSizeKB} KB)`);
      skippedCount++;
      continue;
    }

    if (fileSizeKB < minSizeKB) {
      console.log(`SKIP (too small): ${relativePath} (${fileSizeKB} KB < ${minSizeKB} KB threshold)`);
      skippedCount++;
      continue;
    }

    if (dryRun) {
      console.log(`WOULD CONVERT: ${relativePath} (${fileSizeKB} KB)`);
      convertedCount++;
      totalOriginalSize += fileSizeKB;
      continue;
    }

    try {
      const outputBuffer = await sharp(filePath).webp({ quality }).toBuffer();

      const newSizeKB = Math.round(outputBuffer.length / 1024);
      const savings = fileSizeKB - newSizeKB;
      const savingsPercent = ((savings / fileSizeKB) * 100).toFixed(1);

      // Only save if the WebP is actually smaller
      if (newSizeKB < fileSizeKB) {
        await sharp(filePath).webp({ quality }).toFile(webpPath);
        console.log(`CONVERTED: ${relativePath} (${fileSizeKB} KB -> ${newSizeKB} KB, saved ${savingsPercent}%)`);
        totalOriginalSize += fileSizeKB;
        totalNewSize += newSizeKB;
        convertedCount++;
        results.push({ file: relativePath, from: fileSizeKB, to: newSizeKB, savings });
      } else {
        console.log(`SKIP (no savings): ${relativePath} (${fileSizeKB} KB -> webp would be ${newSizeKB} KB)`);
        skippedCount++;
      }
    } catch (err) {
      console.error(`ERROR: ${relativePath} - ${err.message}`);
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Converted: ${convertedCount}`);
  console.log(`Skipped:   ${skippedCount}`);
  if (!dryRun && totalOriginalSize > 0) {
    const totalSaved = totalOriginalSize - totalNewSize;
    const totalSavedMB = (totalSaved / 1024).toFixed(2);
    console.log(
      `Total savings: ${totalSaved} KB (${totalSavedMB} MB), ${((totalSaved / totalOriginalSize) * 100).toFixed(1)}% reduction`,
    );
  }

  if (results.length > 0) {
    console.log("\n=== Results Table ===");
    console.log("File".padEnd(50) + "Original".padEnd(12) + "WebP".padEnd(12) + "Saved");
    console.log("-".repeat(86));
    for (const r of results) {
      console.log(r.file.padEnd(50) + `${r.from} KB`.padEnd(12) + `${r.to} KB`.padEnd(12) + `${r.savings} KB`);
    }
  }
}

optimizeImages().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
