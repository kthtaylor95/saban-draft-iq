import assert from "node:assert/strict";
import players from "../src/data/players.json" with { type: "json" };
import {
  canAdvanceFromResult,
  canSubmitAnswer,
  createQuestionQueue,
  INTERACTION_STATES,
  isAnswerEntryState,
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

console.log("Roster verification");
console.log(`Total players: ${players.length}`);
console.log(`Unique IDs: ${new Set(ids).size}`);
console.log(`Unique names: ${new Set(names).size}`);
console.log(`Duplicate IDs: ${duplicates(ids).join(", ") || "None"}`);
console.log(`Duplicate names: ${duplicates(names).join(", ") || "None"}`);
console.log(`Players seen across 1,000 simulated rounds: ${appeared.size}/30`);
console.log("All dataset and game-round tests passed.");
