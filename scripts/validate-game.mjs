import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import jailbreakRound from "../src/data/jailbreak-round.json" with { type: "json" };
import players from "../src/data/players.json" with { type: "json" };
import {
  canAnswerJailbreak,
  canAdvanceFromResult,
  canFinishJailbreak,
  canSubmitAnswer,
  createQuestionQueue,
  INTERACTION_STATES,
  isAnswerEntryState,
  isAcceptedJailbreakAnswer,
  JAILBREAK_STAGES,
} from "../src/game.js";

const expectedNames = [
  "Julio Jones",
  "Mark Ingram II",
  "Marcell Dareus",
  "Trent Richardson",
  "Dont'a Hightower",
  "C.J. Mosley",
  "Amari Cooper",
  "Derrick Henry",
  "Ryan Kelly",
  "Reuben Foster",
  "Jonathan Allen",
  "Marlon Humphrey",
  "O.J. Howard",
  "Minkah Fitzpatrick",
  "Da'Ron Payne",
  "Rashaan Evans",
  "Josh Jacobs",
  "Quinnen Williams",
  "Tua Tagovailoa",
  "Jerry Jeudy",
  "Henry Ruggs III",
  "Jedrick Wills Jr.",
  "Xavier McKinney",
  "Jaylen Waddle",
  "Patrick Surtain II",
  "DeVonta Smith",
  "Mac Jones",
  "Najee Harris",
  "Bryce Young",
  "Will Anderson Jr.",
];

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  values.forEach((value) => {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  });
  return [...repeated];
}

const ids = players.map((player) => player.id);
const names = players.map((player) => player.name);
const stylesheet = await readFile(
  new URL("../src/styles.css", import.meta.url),
  "utf8",
);
const localPreview = await readFile(
  new URL("../.local/bridge_8504.py", import.meta.url),
  "utf8",
);

for (const componentPath of [
  "src/components/Atmosphere.jsx",
  "src/components/CelebrationEffect.jsx",
  "src/components/GameTilt.jsx",
]) {
  const componentSource = await readFile(
    new URL(`../${componentPath}`, import.meta.url),
    "utf8",
  );
  assert.match(
    componentSource,
    /import React(?:,| from) /,
    `${componentPath} must import React so its JSX cannot crash as a blank production page.`,
  );
}

assert.equal(players.length, 30, "Dataset must contain exactly 30 players.");
assert.deepEqual(names, expectedNames, "Dataset names/order must match Version 1.");
assert.equal(new Set(names).size, 30, "Every player name must be unique.");
assert.equal(new Set(ids).size, 30, "Every player ID must be unique.");

for (const player of players) {
  assert.ok(player.id, `${player.name} is missing id.`);
  assert.ok(player.name, `${player.id} is missing name.`);
  assert.ok(player.draftedBy, `${player.name} is missing draftedBy.`);
  assert.ok(Array.isArray(player.acceptedAnswers), `${player.name} needs acceptedAnswers.`);
  assert.ok(player.acceptedAnswers.length >= 2, `${player.name} needs answer aliases.`);
  assert.ok(player.draftYear, `${player.name} is missing draftYear.`);
  assert.ok(player.draftRound, `${player.name} is missing draftRound.`);
  assert.ok(player.overallPick, `${player.name} is missing overallPick.`);
  assert.ok(player.difficulty, `${player.name} is missing difficulty.`);
}

const sampleRound = createQuestionQueue(players);
assert.equal(sampleRound.length, 5, "A round must contain 5 players.");
assert.equal(
  new Set(sampleRound.map((player) => player.id)).size,
  5,
  "No player may repeat during a game.",
);

const appeared = new Set();
for (let index = 0; index < 1000; index += 1) {
  const round = createQuestionQueue(players);
  assert.equal(round.length, 5, "Every simulated round must contain 5 players.");
  assert.equal(
    new Set(round.map((player) => player.id)).size,
    5,
    "No simulated round may repeat a player.",
  );
  round.forEach((player) => appeared.add(player.id));
}

assert.equal(
  appeared.size,
  30,
  `All 30 players should appear across 1,000 simulated rounds. Saw ${appeared.size}.`,
);

assert.equal(
  canSubmitAnswer({
    selectedTeam: "Falcons",
    feedback: null,
    isGameOver: false,
    isProcessing: false,
  }),
  true,
  "A fresh answer should be submittable.",
);
assert.equal(
  canSubmitAnswer({
    selectedTeam: "Falcons",
    feedback: { isCorrect: true },
    isGameOver: false,
    isProcessing: false,
  }),
  false,
  "Feedback state must prevent double scoring.",
);
assert.equal(
  canSubmitAnswer({
    selectedTeam: "Falcons",
    feedback: null,
    isGameOver: false,
    isProcessing: true,
  }),
  false,
  "Processing state must prevent repeated scoring clicks.",
);

assert.equal(
  isAnswerEntryState(INTERACTION_STATES.READY),
  true,
  "The ready state must accept an answer.",
);
assert.equal(
  isAnswerEntryState(INTERACTION_STATES.ANSWERING),
  true,
  "The answering state must accept an answer.",
);
assert.equal(
  isAnswerEntryState(INTERACTION_STATES.RESULT),
  false,
  "The result state must keep the answer locked.",
);
assert.equal(
  canAdvanceFromResult(INTERACTION_STATES.RESULT),
  true,
  "Only the result state may start the next-question flip.",
);
assert.equal(
  canAdvanceFromResult(INTERACTION_STATES.RESETTING),
  false,
  "The resetting state must prevent repeated next-question clicks.",
);

assert.equal(jailbreakRound.choices.length, 4, "The Jailbreak Round needs four choices.");
assert.equal(
  new Set(jailbreakRound.choices).size,
  4,
  "Every Jailbreak Round choice must be unique.",
);
assert.ok(
  jailbreakRound.choices.includes(jailbreakRound.acceptedAnswer),
  "The accepted Jailbreak Round answer must be one of the visible choices.",
);
assert.equal(
  jailbreakRound.isOfficialStatistic,
  false,
  "The comedic fallback must remain clearly marked as unofficial.",
);
assert.equal(
  jailbreakRound.enabled,
  true,
  "The configured Jailbreak Round should be enabled for the public game.",
);
assert.equal(
  isAcceptedJailbreakAnswer(jailbreakRound, jailbreakRound.acceptedAnswer),
  true,
  "The configured joke answer must be accepted.",
);
assert.equal(
  isAcceptedJailbreakAnswer(jailbreakRound, "14"),
  false,
  "A numbered joke choice must not be marked correct.",
);
assert.equal(
  jailbreakRound.acceptedAnswer,
  "83",
  "The configured Jailbreak Round answer must remain 83.",
);
assert.equal(
  canAnswerJailbreak({ stage: JAILBREAK_STAGES.READY, selectedAnswer: "" }),
  true,
  "The Jailbreak Round should accept one fresh answer.",
);
assert.equal(
  canAnswerJailbreak({
    stage: JAILBREAK_STAGES.REVEALING,
    selectedAnswer: jailbreakRound.acceptedAnswer,
  }),
  false,
  "The Jailbreak Round must reject duplicate answer taps.",
);
assert.equal(
  canFinishJailbreak(JAILBREAK_STAGES.RESULT),
  true,
  "The ending button should work only after the reveal finishes.",
);
assert.equal(
  canFinishJailbreak(JAILBREAK_STAGES.ENDING),
  false,
  "The ending button must not run twice.",
);

assert.match(
  stylesheet,
  /\.teamSearch input\s*\{[\s\S]*?color:\s*#fffdf8;[\s\S]*?-webkit-text-fill-color:\s*#fffdf8;/,
  "The production answer field must keep typed text visible on the dark surface.",
);
assert.match(
  stylesheet,
  /caret-color:\s*#e5c66f;/,
  "The production answer field must keep a visible caret.",
);
assert.match(
  await readFile(new URL("../src/main.jsx", import.meta.url), "utf8"),
  /WebkitTextFillColor:\s*"#fffdf8"/,
  "The production answer field must set an inline browser text-fill fallback.",
);
assert.match(
  localPreview,
  /\.answer input,\.answer input:focus \{\{[^}]*background:#20242b !important;[^}]*color:#fffdf8 !important;[^}]*-webkit-text-fill-color:#fffdf8 !important;/,
  "The local preview answer field must keep typed text visible on the dark surface.",
);
assert.match(
  localPreview,
  /forceAnswerTextVisibility\(this\);searchTeam\(this\.value\)/,
  "The local preview must reapply answer text visibility while the player types.",
);
assert.doesNotMatch(
  stylesheet,
  /\.gameFlipCard\s*\{[^}]*filter:/,
  "The production 3D flip container must not use a CSS filter that mirrors card faces.",
);
assert.doesNotMatch(
  localPreview,
  /\.flipCard \{\{[^}]*filter:/,
  "The local preview 3D flip container must not use a CSS filter that mirrors card faces.",
);
assert.match(
  stylesheet,
  /\.gameFace\s*\{[^}]*transform:\s*rotateY\(0deg\);/,
  "The production question face must be explicitly pinned to the front of the 3D card.",
);
assert.match(
  localPreview,
  /\.flipFace \{\{[^}]*transform:rotateY\(0deg\);/,
  "The local preview question face must be explicitly pinned to the front of the 3D card.",
);

console.log("Roster verification");
console.log(`Total players: ${players.length}`);
console.log(`Unique IDs: ${new Set(ids).size}`);
console.log(`Unique names: ${new Set(names).size}`);
console.log(`Duplicate IDs: ${duplicates(ids).join(", ") || "None"}`);
console.log(`Duplicate names: ${duplicates(names).join(", ") || "None"}`);
console.log(`Players seen across 1,000 simulated rounds: ${appeared.size}/30`);
console.log("Jailbreak Round configuration and transition guards passed.");
console.log("Answer input visibility regression checks passed.");
console.log("All dataset and game-round tests passed.");
