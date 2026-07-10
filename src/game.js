export const QUESTION_TOTAL = 5;
export const POINTS_PER_CORRECT = 10;
export const INTERACTION_STATES = Object.freeze({
  ANSWERING: "answering",
  READY: "ready",
  RESETTING: "resetting",
  RESULT: "result",
  REVEALING: "revealing",
});

export const JAILBREAK_STAGES = Object.freeze({
  LOCKED: "locked",
  READY: "ready",
  REVEALING: "revealing",
  RESULT: "result",
  ENDING: "ending",
});

export function createQuestionQueue(sourcePlayers, count = QUESTION_TOTAL) {
  const shuffledPlayers = [...sourcePlayers];
  for (let index = shuffledPlayers.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledPlayers[index], shuffledPlayers[randomIndex]] = [
      shuffledPlayers[randomIndex],
      shuffledPlayers[index],
    ];
  }
  return shuffledPlayers.slice(0, count);
}

export function normalizeAnswer(answer) {
  return answer.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isAcceptedAnswer(player, answer) {
  const normalizedAnswer = normalizeAnswer(answer);
  return player.acceptedAnswers.some(
    (acceptedAnswer) => normalizeAnswer(acceptedAnswer) === normalizedAnswer,
  );
}

export function canSubmitAnswer({ selectedTeam, feedback, isGameOver, isProcessing }) {
  return Boolean(selectedTeam) && !feedback && !isGameOver && !isProcessing;
}

export function isAnswerEntryState(interactionState) {
  return (
    interactionState === INTERACTION_STATES.READY ||
    interactionState === INTERACTION_STATES.ANSWERING
  );
}

export function canAdvanceFromResult(interactionState) {
  return interactionState === INTERACTION_STATES.RESULT;
}

export function isAcceptedJailbreakAnswer(config, answer) {
  return answer.trim().toLowerCase() === config.acceptedAnswer.trim().toLowerCase();
}

export function canAnswerJailbreak({ stage, selectedAnswer }) {
  return stage === JAILBREAK_STAGES.READY && !selectedAnswer;
}

export function canFinishJailbreak(stage) {
  return stage === JAILBREAK_STAGES.RESULT;
}
