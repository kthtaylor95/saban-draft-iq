import fs from "node:fs";
import https from "node:https";
import players from "../src/data/players.json" with { type: "json" };

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "SabanDraftIQ/1.0" } }, (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(body.slice(0, 160) || error.message));
          }
        });
      })
      .on("error", reject);
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function commonsSearchUrl(playerName) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `"${playerName}" Alabama`,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    format: "json",
    origin: "*",
  });
  return `https://commons.wikimedia.org/w/api.php?${params}`;
}

const missingPlayers = players.filter((player) => !fs.existsSync(`public${player.image}`));
const lines = [
  "# Wikimedia Commons Image Research",
  "",
  "This report only lists search candidates. Do not use an image unless it clearly shows the player in an Alabama uniform and has a usable license.",
  "",
];

for (const player of missingPlayers) {
  let data;
  try {
    data = await fetchJson(commonsSearchUrl(player.name));
  } catch (error) {
    await wait(1600);
    try {
      data = await fetchJson(commonsSearchUrl(player.name));
    } catch (retryError) {
      lines.push(`## ${player.name}`);
      lines.push("");
      lines.push(`Search failed: ${retryError.message}`);
      lines.push("");
      await wait(1600);
      continue;
    }
  }
  const pages = Object.values(data.query?.pages || {});
  lines.push(`## ${player.name}`);
  if (pages.length === 0) {
    lines.push("");
    lines.push("No Wikimedia Commons candidates found.");
    lines.push("");
    continue;
  }

  for (const page of pages) {
    const info = page.imageinfo?.[0];
    const meta = info?.extmetadata || {};
    lines.push(`- ${page.title}`);
    lines.push(`  - License: ${meta.LicenseShortName?.value || "Unknown"}`);
    lines.push(`  - Usage terms: ${meta.UsageTerms?.value || "Unknown"}`);
    lines.push(`  - URL: ${info?.url || "Unknown"}`);
  }
  lines.push("");
  await wait(1600);
}

fs.writeFileSync("PLAYER_IMAGE_RESEARCH.md", `${lines.join("\n")}\n`);
console.log(`Wrote PLAYER_IMAGE_RESEARCH.md for ${missingPlayers.length} missing players.`);
