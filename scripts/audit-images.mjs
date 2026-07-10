import fs from "node:fs";
import path from "node:path";
import players from "../src/data/players.json" with { type: "json" };

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  values.forEach((value) => {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  });
  return [...repeated];
}

const expectedFiles = players.map((player) => ({
  player: player.name,
  file: player.image.replace(/^\//, "public/"),
}));

const existingImages = expectedFiles.filter(({ file }) => fs.existsSync(file));
const missingImages = expectedFiles.filter(({ file }) => !fs.existsSync(file));
const duplicateImagePaths = duplicates(players.map((player) => player.image));
const expectedFileSet = new Set(expectedFiles.map(({ file }) => path.normalize(file)));
const actualFiles = fs.existsSync("public/players")
  ? fs
      .readdirSync("public/players")
      .filter((file) => file.toLowerCase().endsWith(".jpg"))
      .map((file) => path.normalize(`public/players/${file}`))
  : [];
const unusedFiles = actualFiles.filter((file) => !expectedFileSet.has(file));

console.log("Saban Draft IQ image audit");
console.log(`Expected player images: ${expectedFiles.length}`);
console.log(`Existing images: ${existingImages.length}`);
existingImages.forEach(({ player, file }) => console.log(`  OK ${player}: ${file}`));
console.log(`Missing images: ${missingImages.length}`);
missingImages.forEach(({ player, file }) => console.log(`  MISSING ${player}: ${file}`));
console.log(`Unused image files: ${unusedFiles.length}`);
unusedFiles.forEach((file) => console.log(`  UNUSED ${file}`));
console.log(`Duplicate image paths: ${duplicateImagePaths.length}`);
duplicateImagePaths.forEach((file) => console.log(`  DUPLICATE ${file}`));
