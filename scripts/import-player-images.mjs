import fs from "node:fs";
import path from "node:path";
import players from "../src/data/players.json" with { type: "json" };

const dropFolder = "photo-drop";
const outputFolder = "public/players";

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isJpeg(file) {
  return [".jpg", ".jpeg"].includes(path.extname(file).toLowerCase());
}

fs.mkdirSync(dropFolder, { recursive: true });
fs.mkdirSync(outputFolder, { recursive: true });

const playerLookup = new Map();
for (const player of players) {
  playerLookup.set(normalize(player.id), player);
  playerLookup.set(normalize(player.name), player);
}

const files = fs.readdirSync(dropFolder).filter((file) => !file.startsWith("."));
const imported = [];
const skipped = [];

for (const file of files) {
  const sourcePath = path.join(dropFolder, file);
  if (!fs.statSync(sourcePath).isFile()) continue;

  if (!isJpeg(file)) {
    skipped.push(`${file} — not a JPG/JPEG file`);
    continue;
  }

  const basename = path.basename(file, path.extname(file));
  const player = playerLookup.get(normalize(basename));

  if (!player) {
    skipped.push(`${file} — filename does not match a Version 1 player`);
    continue;
  }

  const targetPath = path.join(outputFolder, `${player.id}.jpg`);
  fs.copyFileSync(sourcePath, targetPath);
  imported.push(`${file} -> ${targetPath}`);
}

console.log("Saban Draft IQ photo import");
console.log(`Drop folder: ${dropFolder}`);
console.log(`Imported: ${imported.length}`);
imported.forEach((line) => console.log(`  OK ${line}`));
console.log(`Skipped: ${skipped.length}`);
skipped.forEach((line) => console.log(`  SKIP ${line}`));
