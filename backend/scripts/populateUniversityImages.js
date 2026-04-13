const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const pool = require("../db/pool");

const wikiTitleOverrides = {
  // Add manual title overrides here when needed.
  // Example: "ETH Zurich": "ETH_Zurich"
};

async function fetchWikipediaImage(universityName) {
  const wikiTitle =
    wikiTitleOverrides[universityName] || universityName.replace(/ /g, "_");

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    wikiTitle
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "UniPath/1.0 (university image population script)",
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const thumb = data.thumbnail?.source;
    if (!thumb) return null;

    return thumb.replace(/\/\d+px-/, "/800px-");
  } catch {
    return null;
  }
}

function wikiPageUrl(universityName) {
  const wikiTitle =
    wikiTitleOverrides[universityName] || universityName.replace(/ /g, "_");
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (typeof fetch !== "function") {
    throw new Error(
      "Global fetch is not available in this Node runtime. Use Node 18+ or install node-fetch."
    );
  }

  const { rows } = await pool.query(
    `SELECT id, name, image_url
     FROM universities
     ORDER BY id ASC`
  );

  let updated = 0;
  let skipped = 0;
  let missed = 0;

  for (const university of rows) {
    if (university.image_url && String(university.image_url).trim()) {
      skipped += 1;
      continue;
    }

    const imageUrl = await fetchWikipediaImage(university.name);
    const pageUrl = wikiPageUrl(university.name);

    if (!imageUrl) {
      missed += 1;
      console.log(`[MISS] ${university.name} | ${pageUrl}`);
      await sleep(120);
      continue;
    }

    await pool.query("UPDATE universities SET image_url = $1 WHERE id = $2", [
      imageUrl,
      university.id,
    ]);

    updated += 1;
    console.log(`[OK] ${university.name} | ${pageUrl}`);
    await sleep(120);
  }

  console.log("\nDone populating university images.");
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already had image_url): ${skipped}`);
  console.log(`Missed (no wiki thumbnail): ${missed}`);
}

main()
  .catch((error) => {
    console.error("Image population script failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
