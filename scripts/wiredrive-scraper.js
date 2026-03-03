/**
 * 🎬 Wiredrive Asset Scraper — paste this into the browser console
 * on your Wiredrive admin page (friendsandfamily.wiredrive.com/library/admin_list/)
 *
 * HOW TO USE:
 * 1. Log into Wiredrive admin → Library
 * 2. Set "Show all" in the dropdown (so all assets are visible, not just 50)
 *    or run this per-page if there are many pages
 * 3. Open DevTools (Cmd+Option+J on Mac)
 * 4. Paste this entire script and press Enter
 * 5. It will:
 *    a) Scrape every visible asset row
 *    b) Click each row to read the director from the detail panel
 *    c) Generate a manifest.json and download commands
 *    d) Download the manifest.json automatically
 *
 * Then use: npx tsx scripts/migrate-wiredrive.ts ./migration-data --manifest manifest.json
 */
(async function wiredriveExport() {
  const DELAY = 600; // ms between clicks (let the detail panel load)

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  console.log("🎬 Wiredrive Scraper — scanning assets...");

  // Find all asset rows in the table
  const rows = document.querySelectorAll("table tbody tr");
  if (!rows.length) {
    console.error("No asset rows found. Make sure you're on the Library admin list page.");
    return;
  }

  console.log(`Found ${rows.length} assets. Scraping metadata (this takes ~${Math.ceil(rows.length * DELAY / 1000)}s)...`);

  const assets = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.querySelectorAll("td");

    // Extract what we can from the table row
    const titleCell = cells[1] || cells[0];
    const titleLines = titleCell?.innerText?.trim().split("\n") || [];
    const wiredriveTitle = titleLines[0]?.trim() || "";
    const originalFilename = titleLines[1]?.trim() || "";

    const sizeText = cells[2]?.innerText?.trim() || "";
    const typeText = cells[3]?.innerText?.trim() || "";

    // Click the row to load detail panel
    row.click();
    await sleep(DELAY);

    // Read director from the detail panel
    const detailPanel = document.querySelector(".detail-panel, .sidebar, [class*='detail'], [class*='preview']");
    let director = "Unknown";
    let downloadUrl = "";

    // Try to find director in the detail panel
    const allText = document.body.innerText;
    const directorMatch = allText.match(/Director:\s*(.+)/);
    if (directorMatch) {
      director = directorMatch[1].trim();
    }

    // Try to find the download button/link
    const downloadBtn = document.querySelector("a[href*='download'], button:has-text('Download'), a.download-btn, [data-action='download']");
    if (downloadBtn && downloadBtn.href) {
      downloadUrl = downloadBtn.href;
    }

    // Parse title: "Brand | 'Title'" → { brand, title }
    let brand = null;
    let title = wiredriveTitle;
    const pipeMatch = wiredriveTitle.match(/^(.+?)\s*\|\s*"?([^"]+)"?\s*$/);
    if (pipeMatch) {
      brand = pipeMatch[1].trim();
      title = pipeMatch[2].trim();
    }

    assets.push({
      index: i + 1,
      wiredriveTitle,
      title,
      brand,
      originalFilename,
      director,
      size: sizeText,
      type: typeText,
      downloadUrl,
    });

    if ((i + 1) % 10 === 0) {
      console.log(`  Scraped ${i + 1}/${rows.length}...`);
    }
  }

  // Group by director
  const byDirector = {};
  for (const asset of assets) {
    if (!byDirector[asset.director]) {
      byDirector[asset.director] = [];
    }
    byDirector[asset.director].push(asset);
  }

  // Build manifest
  const manifest = {
    exportedAt: new Date().toISOString(),
    source: "friendsandfamily.wiredrive.com",
    totalAssets: assets.length,
    directors: byDirector,
  };

  // Pretty print summary
  console.log("\n📋 SCRAPE COMPLETE:");
  console.log(`   Total assets: ${assets.length}`);
  console.log(`   Directors found:`);
  for (const [dir, items] of Object.entries(byDirector)) {
    console.log(`     ${dir}: ${items.length} assets`);
  }

  // Download manifest.json
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wiredrive-manifest.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log("\n✅ manifest.json downloaded!");
  console.log("\nNEXT STEPS:");
  console.log("1. Download videos from Wiredrive per-director into folders:");
  console.log("   migration-data/");
  for (const dir of Object.keys(byDirector)) {
    console.log(`     ${dir}/`);
    const items = byDirector[dir].slice(0, 2);
    for (const item of items) {
      console.log(`       ${item.originalFilename}`);
    }
    if (byDirector[dir].length > 2) console.log(`       ... (${byDirector[dir].length} files total)`);
  }
  console.log("\n2. Run the migration script:");
  console.log("   npx tsx scripts/migrate-wiredrive.ts ./migration-data --manifest wiredrive-manifest.json");

  // Also store in window for inspection
  window.__wiredriveManifest = manifest;
  console.log("\n💡 Manifest also available at: window.__wiredriveManifest");

  return manifest;
})();
