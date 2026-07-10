import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Atmosphere } from "./components/Atmosphere";
import { CelebrationEffect } from "./components/CelebrationEffect";
import { GameTilt } from "./components/GameTilt";
import jailbreakRound from "./data/jailbreak-round.json";
import players from "./data/players.json";
import {
  canAnswerJailbreak,
  canAdvanceFromResult,
  canFinishJailbreak,
  createQuestionQueue,
  canSubmitAnswer,
  INTERACTION_STATES,
  isAnswerEntryState,
  isAcceptedAnswer,
  isAcceptedJailbreakAnswer,
  JAILBREAK_STAGES,
  POINTS_PER_CORRECT,
  QUESTION_TOTAL,
} from "./game";
import "./styles.css";

const teamGroups = [
  {
    conference: "AFC",
    teams: [
      "Baltimore Ravens",
      "Buffalo Bills",
      "Cincinnati Bengals",
      "Cleveland Browns",
      "Denver Broncos",
      "Houston Texans",
      "Indianapolis Colts",
      "Jacksonville Jaguars",
      "Kansas City Chiefs",
      "Las Vegas Raiders",
      "Los Angeles Chargers",
      "Miami Dolphins",
      "New England Patriots",
      "New York Jets",
      "Pittsburgh Steelers",
      "Tennessee Titans",
    ],
  },
  {
    conference: "NFC",
    teams: [
      "Arizona Cardinals",
      "Atlanta Falcons",
      "Carolina Panthers",
      "Chicago Bears",
      "Dallas Cowboys",
      "Detroit Lions",
      "Green Bay Packers",
      "Los Angeles Rams",
      "Minnesota Vikings",
      "New Orleans Saints",
      "New York Giants",
      "Philadelphia Eagles",
      "San Francisco 49ers",
      "Seattle Seahawks",
      "Tampa Bay Buccaneers",
      "Washington Commanders",
    ],
  },
];

const teams = teamGroups.flatMap((group) => group.teams);
const DATA_VERSION = 2;
const teamVisuals = {
  "Arizona Cardinals": { abbr: "ARI", primary: "#97233f", secondary: "#ffb612" },
  "Atlanta Falcons": { abbr: "ATL", primary: "#a71930", secondary: "#000000" },
  "Baltimore Ravens": { abbr: "BAL", primary: "#241773", secondary: "#9e7c0c" },
  "Buffalo Bills": { abbr: "BUF", primary: "#00338d", secondary: "#c60c30" },
  "Carolina Panthers": { abbr: "CAR", primary: "#0085ca", secondary: "#101820" },
  "Chicago Bears": { abbr: "CHI", primary: "#0b162a", secondary: "#c83803" },
  "Cincinnati Bengals": { abbr: "CIN", primary: "#fb4f14", secondary: "#000000" },
  "Cleveland Browns": { abbr: "CLE", primary: "#311d00", secondary: "#ff3c00" },
  "Dallas Cowboys": { abbr: "DAL", primary: "#041e42", secondary: "#869397" },
  "Denver Broncos": { abbr: "DEN", primary: "#fb4f14", secondary: "#002244" },
  "Detroit Lions": { abbr: "DET", primary: "#0076b6", secondary: "#b0b7bc" },
  "Green Bay Packers": { abbr: "GB", primary: "#203731", secondary: "#ffb612" },
  "Houston Texans": { abbr: "HOU", primary: "#03202f", secondary: "#a71930" },
  "Indianapolis Colts": { abbr: "IND", primary: "#002c5f", secondary: "#a2aaad" },
  "Jacksonville Jaguars": { abbr: "JAX", primary: "#006778", secondary: "#d7a22a" },
  "Kansas City Chiefs": { abbr: "KC", primary: "#e31837", secondary: "#ffb81c" },
  "Las Vegas Raiders": { abbr: "LV", primary: "#000000", secondary: "#a5acaf" },
  "Los Angeles Chargers": { abbr: "LAC", primary: "#0080c6", secondary: "#ffc20e" },
  "Los Angeles Rams": { abbr: "LAR", primary: "#003594", secondary: "#ffd100" },
  "Miami Dolphins": { abbr: "MIA", primary: "#008e97", secondary: "#fc4c02" },
  "Minnesota Vikings": { abbr: "MIN", primary: "#4f2683", secondary: "#ffc62f" },
  "New England Patriots": { abbr: "NE", primary: "#002244", secondary: "#c60c30" },
  "New Orleans Saints": { abbr: "NO", primary: "#101820", secondary: "#d3bc8d" },
  "New York Giants": { abbr: "NYG", primary: "#0b2265", secondary: "#a71930" },
  "New York Jets": { abbr: "NYJ", primary: "#125740", secondary: "#ffffff" },
  "Philadelphia Eagles": { abbr: "PHI", primary: "#004c54", secondary: "#a5acaf" },
  "Pittsburgh Steelers": { abbr: "PIT", primary: "#101820", secondary: "#ffb612" },
  "San Francisco 49ers": { abbr: "SF", primary: "#aa0000", secondary: "#b3995d" },
  "Seattle Seahawks": { abbr: "SEA", primary: "#002244", secondary: "#69be28" },
  "Tampa Bay Buccaneers": { abbr: "TB", primary: "#d50a0a", secondary: "#34302b" },
  "Tennessee Titans": { abbr: "TEN", primary: "#0c2340", secondary: "#4b92db" },
  "Washington Commanders": { abbr: "WAS", primary: "#5a1414", secondary: "#ffb612" },
};
const playerFacts = {
  "julio-jones": "2x First-team All-SEC",
  "mark-ingram-ii": "Heisman Trophy winner",
  "marcell-dareus": "BCS National Championship Defensive MVP",
  "trent-richardson": "Doak Walker Award winner",
  "donta-hightower": "2x national champion at Alabama",
  "cj-mosley": "Butkus Award winner",
  "amari-cooper": "Biletnikoff Award winner",
  "derrick-henry": "Heisman Trophy winner",
  "ryan-kelly": "Rimington Trophy winner",
  "reuben-foster": "Butkus Award winner",
  "jonathan-allen": "Chuck Bednarik Award winner",
  "marlon-humphrey": "2x First-team All-Pro in the NFL",
  "oj-howard": "National Championship Offensive MVP",
  "minkah-fitzpatrick": "Jim Thorpe Award winner",
  "daron-payne": "National Championship Defensive MVP",
  "rashaan-evans": "2x national champion at Alabama",
  "josh-jacobs": "NFL rushing champion",
  "quinnen-williams": "Outland Trophy winner",
  "tua-tagovailoa": "National Championship Offensive MVP",
  "jerry-jeudy": "Biletnikoff Award winner",
  "henry-ruggs-iii": "First-round pick in 2020",
  "jedrick-wills-jr": "Protected Tua's blind side at Alabama",
  "xavier-mckinney": "First-team All-SEC",
  "jaylen-waddle": "SEC Freshman of the Year",
  "patrick-surtain-ii": "SEC Defensive Player of the Year",
  "devonta-smith": "Heisman Trophy winner",
  "mac-jones": "Davey O'Brien Award winner",
  "najee-harris": "Doak Walker Award winner",
  "bryce-young": "Heisman Trophy winner",
  "will-anderson-jr": "2x SEC Defensive Player of the Year",
};

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  return [...duplicates];
}

function DevVerificationPanel() {
  const ids = players.map((player) => player.id);
  const names = players.map((player) => player.name);

  if (!import.meta.env.DEV) return null;

  return (
    <details className="devPanel">
      <summary>Roster verification</summary>
      <ul>
        <li>Total players: {players.length}</li>
        <li>Unique IDs: {new Set(ids).size}</li>
        <li>Unique names: {new Set(names).size}</li>
        <li>Duplicate IDs: {findDuplicates(ids).join(", ") || "None"}</li>
        <li>Duplicate names: {findDuplicates(names).join(", ") || "None"}</li>
      </ul>
    </details>
  );
}

function getRank(score) {
  if (score === 50) return "GOAT 🐐";
  if (score >= 40) return "FIRST ROUND PICK";
  if (score >= 30) return "DAY TWO PICK";
  if (score >= 20) return "PRACTICE SQUAD";
  if (score >= 10) return "UNDRAFTED FREE AGENT";
  return "TRANSFERRED TO AUBURN";
}

function getStreakMessage(streak) {
  if (streak >= 8) return "TRUST THE PROCESS";
  if (streak >= 5) return "DYNASTY MODE";
  if (streak >= 3) return "ON FIRE";
  return "";
}

function readStoredNumber(key) {
  const value = Number(window.localStorage.getItem(key));
  return Number.isFinite(value) ? value : 0;
}

function readStoredBoolean(key, fallback = false) {
  const value = window.localStorage.getItem(key);
  if (value === null) return fallback;
  return value === "true";
}

function teamVisualFor(teamName) {
  if (teamVisuals[teamName]) return teamVisuals[teamName];
  if (teamName === "Oakland Raiders") return teamVisuals["Las Vegas Raiders"];
  if (teamName === "Washington Redskins") return teamVisuals["Washington Commanders"];
  return { abbr: "NFL", primary: "#2a2f36", secondary: "#7f8894" };
}

function DraftCard({ compact = false } = {}) {
  return (
    <div
      className={`draftCardAssetStage ${compact ? "compactDraftCardAssetStage" : ""}`}
      aria-label="Confidential mystery NFL Draft scouting card"
    >
      <img
        alt="Anonymous football player on a confidential mystery draft card"
        className="draftCardAsset"
        src="/assets/mystery-draft-card.jpg"
      />
    </div>
  );
}

function AnimatedFinalScore({ maxScore, score }) {
  const [visibleScore, setVisibleScore] = useState(0);

  useEffect(() => {
    if (score === 0) return undefined;
    const increment = Math.max(1, Math.ceil(score / 22));
    const timer = window.setInterval(() => {
      setVisibleScore((value) => {
        const next = Math.min(value + increment, score);
        if (next === score) window.clearInterval(timer);
        return next;
      });
    }, 28);
    return () => window.clearInterval(timer);
  }, [score]);

  return (
    <h1 aria-live="polite" className="animatedFinalScore">
      <span>{visibleScore}</span>
      <small>/ {maxScore}</small>
    </h1>
  );
}

function StreakBanner({ message }) {
  if (!message) return null;

  return (
    <aside className="streakBanner" role="status">
      <span>Streak moment</span>
      <strong>{message}</strong>
    </aside>
  );
}

function formatJailbreakCopy(template, score, maxScore) {
  return template
    .replace("{score}", String(score))
    .replace("{maxScore}", String(maxScore));
}

function JailbreakRound({
  celebration,
  celebrationId,
  isMuted,
  maxScore,
  onAnswer,
  onContinue,
  onFlipEnd,
  onToggleSound,
  onCelebrationComplete,
  score,
  selectedAnswer,
  stage,
}) {
  const isResult = stage === JAILBREAK_STAGES.RESULT;
  const isCorrect = selectedAnswer
    ? isAcceptedJailbreakAnswer(jailbreakRound, selectedAnswer)
    : false;
  const flipClass =
    stage === JAILBREAK_STAGES.REVEALING
      ? "isRevealing"
      : isResult
        ? "isResult"
        : "";

  return (
    <main className="pageShell resultsShell jailbreakPage">
      <Atmosphere variant="jailbreak" />
      <CelebrationEffect
        effect={celebration}
        effectId={celebrationId}
        onComplete={onCelebrationComplete}
      />
      <button
        aria-label={isMuted ? "Sound off" : "Sound on"}
        className="muteButton"
        data-muted={isMuted}
        onClick={onToggleSound}
        type="button"
      >
        {isMuted ? "Sound off" : "Sound on"}
      </button>

      <section className="jailbreakFlipScene" aria-label="Jailbreak bonus round">
        <div
          className={`jailbreakFlipCard ${flipClass}`}
          onAnimationEnd={onFlipEnd}
        >
          <section
            aria-hidden={stage !== JAILBREAK_STAGES.READY}
            className="jailbreakFace jailbreakFront"
            inert={stage !== JAILBREAK_STAGES.READY}
          >
            <div className="jailbreakLock" aria-hidden="true">
              <span />
            </div>
            <p className="jailbreakBadge">{jailbreakRound.subtitle}</p>
            <h1>{jailbreakRound.title}</h1>
            <p className="jailbreakQuestion">{jailbreakRound.question}</p>
            <div
              aria-label="Jailbreak Round answer choices"
              className="jailbreakChoices"
              role="group"
            >
              {jailbreakRound.choices.map((choice) => (
                <button
                  className="jailbreakChoice"
                  key={choice}
                  onClick={() => onAnswer(choice)}
                  type="button"
                >
                  {choice}
                </button>
              ))}
            </div>
            <p className="jailbreakScoreNote">
              {formatJailbreakCopy(jailbreakRound.scoreHoldTemplate, score, maxScore)}
            </p>
          </section>

          <section
            aria-hidden={!isResult}
            className={`jailbreakFace jailbreakBack ${isCorrect ? "isCorrect" : "isBelievable"}`}
            inert={!isResult}
          >
            <p className="jailbreakBadge">{jailbreakRound.title}</p>
            <p className="jailbreakResultLabel">
              {isCorrect ? jailbreakRound.correctHeading : jailbreakRound.incorrectHeading}
            </p>
            <p className="jailbreakSelected">
              <span>{jailbreakRound.selectedAnswerLabel}</span>
              <strong>{selectedAnswer}</strong>
            </p>
            <h2>
              {isCorrect
                ? jailbreakRound.correctMessage
                : jailbreakRound.incorrectMessage}
            </h2>
            <p className="jailbreakOfficialAnswer">
              {isCorrect
                ? jailbreakRound.correctDetail
                : jailbreakRound.incorrectDetail}
            </p>
            <p className="jailbreakDisclaimer">{jailbreakRound.disclaimer}</p>
            <p className="jailbreakScoreNote">
              {formatJailbreakCopy(jailbreakRound.scoreRevealTemplate, score, maxScore)}
            </p>
            <button
              className="primaryButton jailbreakContinue"
              disabled={!canFinishJailbreak(stage)}
              onClick={onContinue}
              type="button"
            >
              {jailbreakRound.continueLabel}
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}

function TeamSearch({
  currentPlayer,
  disabled,
  onSelect,
  onSubmit,
  resetKey,
  selectedTeam,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery("");
    setIsOpen(false);
    setActiveIndex(0);
  }, [resetKey]);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const filteredTeams = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return teams
      .filter((team) => team.toLowerCase().includes(normalizedQuery))
      .slice(0, 5);
  }, [query]);

  function chooseTeam(team) {
    onSelect(team);
    setQuery(team);
    setIsOpen(false);
    setActiveIndex(0);
  }

  return (
    <div className="teamSearch" ref={wrapperRef}>
      <label htmlFor="team-search">Answer</label>
      <input
        aria-autocomplete="list"
        aria-controls="team-suggestions"
        aria-expanded={isOpen}
        autoComplete="off"
        disabled={disabled}
        id="team-search"
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          setIsOpen(Boolean(value.trim()));
          setActiveIndex(0);
          onSelect(value);
        }}
        onFocus={() => setIsOpen(Boolean(query.trim()))}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (isOpen && filteredTeams[activeIndex]) {
              chooseTeam(filteredTeams[activeIndex]);
              return;
            }
            if (query.trim()) onSubmit();
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setIsOpen(Boolean(query.trim()));
            setActiveIndex((index) =>
              Math.min(index + 1, Math.max(filteredTeams.length - 1, 0)),
            );
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          }
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        placeholder="Type an NFL team..."
        style={{
          backgroundColor: "#20242b",
          caretColor: "#e5c66f",
          color: "#fffdf8",
          WebkitTextFillColor: "#fffdf8",
        }}
        value={query}
      />
      {!disabled && isOpen && (
        <div className="teamList" id="team-suggestions" role="listbox">
          {filteredTeams.map((team, index) => (
            <button
              aria-selected={index === activeIndex || team === selectedTeam}
              className={
                index === activeIndex || team === selectedTeam
                  ? "teamOption selected"
                  : "teamOption"
              }
              key={team}
              onClick={() => chooseTeam(team)}
              type="button"
            >
              {team}
            </button>
          ))}
          {filteredTeams.length === 0 && (
            <p className="emptyTeams">No team found. Try another spelling.</p>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  const [questionQueue, setQuestionQueue] = useState(() =>
    createQuestionQueue(players),
  );
  const [gameStatus, setGameStatus] = useState("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [missedPlayers, setMissedPlayers] = useState([]);
  const [bestScore, setBestScore] = useState(() => readStoredNumber("bestScore"));
  const [bestStreak, setBestStreak] = useState(() => readStoredNumber("bestStreak"));
  const [feedback, setFeedback] = useState(null);
  const [streakMessage, setStreakMessage] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(() => readStoredBoolean("sdiMuted"));
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareLabel, setShareLabel] = useState("Copy results");
  const [interactionState, setInteractionState] = useState(INTERACTION_STATES.READY);
  const [resetPhase, setResetPhase] = useState("idle");
  const [jailbreakStage, setJailbreakStage] = useState(JAILBREAK_STAGES.LOCKED);
  const [jailbreakAnswer, setJailbreakAnswer] = useState("");
  const [celebration, setCelebration] = useState(null);
  const [celebrationId, setCelebrationId] = useState(0);
  const [scorePulse, setScorePulse] = useState(0);
  const submissionLocked = useRef(false);
  const nextQuestionLocked = useRef(false);
  const jailbreakUnlockLocked = useRef(false);
  const jailbreakAnswerLocked = useRef(false);
  const jailbreakContinueLocked = useRef(false);

  const currentPlayer = questionQueue[currentIndex];
  const questionNumber = Math.min(currentIndex + 1, QUESTION_TOTAL);
  const maxScore = QUESTION_TOTAL * POINTS_PER_CORRECT;
  const progress = (answeredCount / QUESTION_TOTAL) * 100;
  const accuracy = answeredCount > 0 ? Math.round((score / maxScore) * 100) : 0;
  const rank = getRank(score);
  const shownBestScore = Math.min(bestScore, maxScore);
  const answerEntryIsActive = isAnswerEntryState(interactionState);
  const flipStateClass =
    interactionState === INTERACTION_STATES.REVEALING
      ? "isRevealing"
      : interactionState === INTERACTION_STATES.RESULT
        ? "isResult"
        : interactionState === INTERACTION_STATES.RESETTING && resetPhase === "hideBack"
          ? "isResettingBack"
          : interactionState === INTERACTION_STATES.RESETTING && resetPhase === "showFront"
            ? "isResettingFront"
            : "";

  const clearCelebration = useCallback(() => setCelebration(null), []);

  function triggerCelebration(type) {
    setCelebrationId((value) => value + 1);
    setCelebration(type);
  }

  useEffect(() => {
    const storedVersion = window.localStorage.getItem("sdiDataVersion");
    if (storedVersion !== String(DATA_VERSION)) {
      window.localStorage.removeItem("sdiSavedRound");
      window.localStorage.setItem("sdiDataVersion", String(DATA_VERSION));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sdiMuted", String(isMuted));
  }, [isMuted]);

  useEffect(() => {
    if (displayScore === score) return;
    const direction = displayScore < score ? 1 : -1;
    const timer = window.setInterval(() => {
      setDisplayScore((value) => {
        const nextValue = value + direction;
        if (
          (direction > 0 && nextValue >= score) ||
          (direction < 0 && nextValue <= score)
        ) {
          window.clearInterval(timer);
          return score;
        }
        return nextValue;
      });
    }, 28);
    return () => window.clearInterval(timer);
  }, [displayScore, score]);

  useEffect(() => {
    if (score > bestScore) {
      window.localStorage.setItem("bestScore", String(score));
      setBestScore(score);
    }
  }, [bestScore, score]);

  useEffect(() => {
    if (longestStreak > bestStreak) {
      window.localStorage.setItem("bestStreak", String(longestStreak));
      setBestStreak(longestStreak);
    }
  }, [bestStreak, longestStreak]);

  useEffect(() => {
    if (!streakMessage) return undefined;
    const timer = window.setTimeout(() => setStreakMessage(""), 1750);
    return () => window.clearTimeout(timer);
  }, [streakMessage]);

  function playTone(type) {
    if (isMuted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.frequency.value = type === "correct" ? 740 : 180;
    oscillator.type = type === "correct" ? "triangle" : "sawtooth";
    gain.gain.setValueAtTime(0.05, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.25);
  }

  function submitGuess() {
    if (
      submissionLocked.current ||
      !answerEntryIsActive ||
      !canSubmitAnswer({ selectedTeam, feedback, isGameOver, isProcessing })
    ) {
      return;
    }
    submissionLocked.current = true;
    setIsProcessing(true);
    setInteractionState(INTERACTION_STATES.REVEALING);

    const isCorrect = isAcceptedAnswer(currentPlayer, selectedTeam);
    const nextAnsweredCount = answeredCount + 1;
    const nextStreak = isCorrect ? currentStreak + 1 : 0;
    const nextLongestStreak = Math.max(longestStreak, nextStreak);
    const nextScore = isCorrect ? score + POINTS_PER_CORRECT : score;
    const nextStreakMessage = isCorrect ? getStreakMessage(nextStreak) : "";

    setFeedback({
      isCorrect,
      selectedTeam,
      correctTeam: currentPlayer.draftedBy,
      player: currentPlayer,
    });
    if (!isCorrect) {
      setMissedPlayers((playersMissed) => [
        ...playersMissed,
        {
          player: currentPlayer,
          guessedAnswer: selectedTeam,
        },
      ]);
    }
    setAnsweredCount(nextAnsweredCount);
    setCurrentStreak(nextStreak);
    setLongestStreak(nextLongestStreak);
    setScore(nextScore);
    setStreakMessage(nextStreakMessage);
    if (isCorrect) {
      setScorePulse((value) => value + 1);
      triggerCelebration(
        nextStreak === QUESTION_TOTAL ? "perfect" : "answer",
      );
    }
    playTone(isCorrect ? "correct" : "incorrect");
  }

  function selectTeam(team) {
    if (!answerEntryIsActive) return;
    setSelectedTeam(team);
    setInteractionState(
      team.trim() ? INTERACTION_STATES.ANSWERING : INTERACTION_STATES.READY,
    );
  }

  function nextQuestionNow() {
    if (
      nextQuestionLocked.current ||
      !feedback ||
      !canAdvanceFromResult(interactionState)
    ) {
      return;
    }
    nextQuestionLocked.current = true;
    setResetPhase("hideBack");
    setInteractionState(INTERACTION_STATES.RESETTING);
  }

  function finishFlipStage(event) {
    if (
      event.target !== event.currentTarget ||
      !event.animationName.startsWith("answerCard")
    ) {
      return;
    }

    if (interactionState === INTERACTION_STATES.REVEALING) {
      setInteractionState(INTERACTION_STATES.RESULT);
      return;
    }

    if (interactionState !== INTERACTION_STATES.RESETTING) return;

    if (resetPhase === "hideBack") {
      if (answeredCount < QUESTION_TOTAL) {
        setCurrentIndex((index) => index + 1);
      }
      setSelectedTeam("");
      setFeedback(null);
      setStreakMessage("");
      setResetPhase("showFront");
      return;
    }

    if (resetPhase === "showFront") {
      if (answeredCount >= QUESTION_TOTAL) {
        setIsGameOver(true);
        triggerCelebration(score === maxScore ? "perfect" : "final");
      }
      setInteractionState(INTERACTION_STATES.READY);
      setResetPhase("idle");
      setIsProcessing(false);
      submissionLocked.current = false;
      nextQuestionLocked.current = false;
    }
  }

  function resetGame() {
    setQuestionQueue(createQuestionQueue(players));
    setCurrentIndex(0);
    setSelectedTeam("");
    setScore(0);
    setDisplayScore(0);
    setAnsweredCount(0);
    setCurrentStreak(0);
    setLongestStreak(0);
    setMissedPlayers([]);
    setFeedback(null);
    setIsProcessing(false);
    setInteractionState(INTERACTION_STATES.READY);
    setResetPhase("idle");
    setStreakMessage("");
    setIsGameOver(false);
    setJailbreakStage(JAILBREAK_STAGES.LOCKED);
    setJailbreakAnswer("");
    setCelebration(null);
    setScorePulse(0);
    setShareLabel("Copy results");
    setGameStatus("playing");
    submissionLocked.current = false;
    nextQuestionLocked.current = false;
    jailbreakUnlockLocked.current = false;
    jailbreakAnswerLocked.current = false;
    jailbreakContinueLocked.current = false;
  }

  function startGame() {
    resetGame();
  }

  function unlockJailbreakRound() {
    if (
      jailbreakUnlockLocked.current ||
      jailbreakStage !== JAILBREAK_STAGES.LOCKED ||
      !jailbreakRound.enabled
    ) {
      return;
    }
    jailbreakUnlockLocked.current = true;
    setJailbreakAnswer("");
    setJailbreakStage(JAILBREAK_STAGES.READY);
    triggerCelebration("jailbreak");
  }

  function answerJailbreakRound(answer) {
    if (
      jailbreakAnswerLocked.current ||
      !canAnswerJailbreak({ stage: jailbreakStage, selectedAnswer: jailbreakAnswer })
    ) {
      return;
    }
    jailbreakAnswerLocked.current = true;
    setJailbreakAnswer(answer);
    setJailbreakStage(JAILBREAK_STAGES.REVEALING);
    playTone(isAcceptedJailbreakAnswer(jailbreakRound, answer) ? "correct" : "incorrect");
  }

  function finishJailbreakFlip(event) {
    if (
      event.target !== event.currentTarget ||
      event.animationName !== "jailbreakCardReveal" ||
      jailbreakStage !== JAILBREAK_STAGES.REVEALING
    ) {
      return;
    }
    setJailbreakStage(JAILBREAK_STAGES.RESULT);
  }

  function finishJailbreakRound() {
    if (
      jailbreakContinueLocked.current ||
      !canFinishJailbreak(jailbreakStage)
    ) {
      return;
    }
    jailbreakContinueLocked.current = true;
    setJailbreakStage(JAILBREAK_STAGES.ENDING);
    triggerCelebration("jailbreak");
  }

  async function copyResults(mode = "results") {
    const text =
      mode === "jailbreak"
        ? jailbreakRound.shareTemplate.replace("{score}", `${score}/${maxScore}`)
        : `I scored ${score}/${maxScore} on Saban Draft IQ.\n\n🏆 ${rank}\n\nCan you beat me?`;
    try {
      if (navigator.share) {
        await navigator.share({ text, title: "Saban Draft IQ" });
        setShareLabel("Shared");
      } else {
        await navigator.clipboard.writeText(text);
        setShareLabel("Result copied");
      }
      window.setTimeout(() => setShareLabel("Copy results"), 1600);
    } catch (error) {
      if (error?.name !== "AbortError") setShareLabel("Could not share");
    }
  }

  if (gameStatus === "start") {
    return (
      <main className="pageShell startShell">
        <Atmosphere variant="start" />
        <button
          aria-label={isMuted ? "Sound off" : "Sound on"}
          className="muteButton"
          data-muted={isMuted}
          onClick={() => setIsMuted((value) => !value)}
          type="button"
        >
          {isMuted ? "Sound off" : "Sound on"}
        </button>

        <section className="startCard">
          <p className="eyebrow">Saban Draft IQ</p>
          <h1>THE PICK IS IN</h1>
          <p className="startSubtitle">Can you remember where Alabama legends began their NFL careers?</p>
          <DraftCard />
          <div className="startFacts">
            <span>5 Random Players</span>
            <span>30 Player Pool</span>
            <span>50 Possible Points</span>
          </div>
          <p className="poolNote">Best Score: {shownBestScore} · Best Streak: {bestStreak}</p>
          <button className="primaryButton" onClick={startGame} type="button">
            BEGIN THE DRAFT
          </button>
        </section>
      </main>
    );
  }

  if (
    isGameOver &&
    [
      JAILBREAK_STAGES.READY,
      JAILBREAK_STAGES.REVEALING,
      JAILBREAK_STAGES.RESULT,
    ].includes(jailbreakStage)
  ) {
    return (
      <JailbreakRound
        celebration={celebration}
        celebrationId={celebrationId}
        isMuted={isMuted}
        maxScore={maxScore}
        onAnswer={answerJailbreakRound}
        onContinue={finishJailbreakRound}
        onFlipEnd={finishJailbreakFlip}
        onToggleSound={() => setIsMuted((value) => !value)}
        onCelebrationComplete={clearCelebration}
        score={score}
        selectedAnswer={jailbreakAnswer}
        stage={jailbreakStage}
      />
    );
  }

  if (isGameOver && jailbreakStage === JAILBREAK_STAGES.ENDING) {
    return (
      <main className="pageShell resultsShell finalEndingPage">
        <Atmosphere variant="final" />
        <CelebrationEffect
          effect={celebration}
          effectId={celebrationId}
          onComplete={clearCelebration}
        />
        <button
          aria-label={isMuted ? "Sound off" : "Sound on"}
          className="muteButton"
          data-muted={isMuted}
          onClick={() => setIsMuted((value) => !value)}
          type="button"
        >
          {isMuted ? "Sound off" : "Sound on"}
        </button>

        <section className="resultsCard finalEndingCard">
          <p className="eyebrow">{jailbreakRound.finalEyebrow}</p>
          <p className="finalScoreLabel">{jailbreakRound.finalScoreLabel}</p>
          <AnimatedFinalScore maxScore={maxScore} score={score} />
          <div className="rankBadge">{rank}</div>
          <h2>{jailbreakRound.finalTitle}</h2>
          <p className="finalEndingMessage">{jailbreakRound.finalSubtitle}</p>
          <div className="finalEndingActions">
            <button className="primaryButton" onClick={resetGame} type="button">
              {jailbreakRound.playAgainLabel}
            </button>
            <button
              className="secondaryButton"
              onClick={() => copyResults("jailbreak")}
              type="button"
            >
              {jailbreakRound.shareScoreLabel}
            </button>
          </div>
          <p className="copyStatus" aria-live="polite">{shareLabel}</p>
        </section>
      </main>
    );
  }

  if (isGameOver) {
    return (
      <main className="pageShell resultsShell">
        <Atmosphere variant={score === maxScore ? "perfect" : "final"} />
        <CelebrationEffect
          effect={celebration}
          effectId={celebrationId}
          onComplete={clearCelebration}
        />
        <button
          aria-label={isMuted ? "Sound off" : "Sound on"}
          className="muteButton"
          data-muted={isMuted}
          onClick={() => setIsMuted((value) => !value)}
          type="button"
        >
          {isMuted ? "Sound off" : "Sound on"}
        </button>

        <section className="resultsCard">
          <p className="eyebrow">Final score</p>
          <AnimatedFinalScore maxScore={maxScore} score={score} />
          <div className="rankBadge">{rank}</div>
          {score === maxScore && (
            <p className="perfectNote">Perfect Season<br />Flawless from kickoff to the final whistle.</p>
          )}
          <div className="resultsStats">
            <div>
              <span>Accuracy</span>
              <strong>{accuracy}%</strong>
            </div>
            <div>
              <span>Longest streak</span>
              <strong>{longestStreak}</strong>
            </div>
            <div>
              <span>Correct</span>
              <strong>{score / POINTS_PER_CORRECT} / {QUESTION_TOTAL}</strong>
            </div>
            <div>
              <span>Question pool</span>
              <strong>{players.length}</strong>
            </div>
          </div>

          {jailbreakRound.enabled && (
            <button
              className="primaryButton jailbreakUnlockButton"
              disabled={jailbreakStage !== JAILBREAK_STAGES.LOCKED}
              onClick={unlockJailbreakRound}
              type="button"
            >
              <span className="miniLock" aria-hidden="true" />
              {jailbreakRound.unlockLabel}
            </button>
          )}
          <button
            className="secondaryButton resultsShareButton"
            onClick={() => copyResults("results")}
            type="button"
          >
            Share Results
          </button>
          <p className="copyStatus">{shareLabel}</p>
          <button className="secondaryButton" onClick={resetGame} type="button">
            Play Again
          </button>
          <p className="bestLine">Best Score: {shownBestScore} · Best Streak: {bestStreak}</p>

          {missedPlayers.length > 0 && (
            <section className="missedSection" aria-labelledby="missed-heading">
              <p className="eyebrow" id="missed-heading">Players You Missed</p>
              <div className="missedGrid">
                {missedPlayers.map(({ player }) => (
                  <article className="missedCard" key={player.id}>
                    <DraftCard compact />
                    <div className="missedBody">
                      <h2>{player.name}</h2>
                      <dl>
                        <div>
                          <dt>Draft Team</dt>
                          <dd>{player.draftedBy}</dd>
                        </div>
                        <div>
                          <dt>Draft Year</dt>
                          <dd>{player.draftYear}</dd>
                        </div>
                        <div>
                          <dt>Pick</dt>
                          <dd>#{player.overallPick} Overall</dd>
                        </div>
                      </dl>
                      <p>{playerFacts[player.id]}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="pageShell">
      <Atmosphere />
      <CelebrationEffect
        effect={celebration}
        effectId={celebrationId}
        onComplete={clearCelebration}
      />
      <DevVerificationPanel />
      <button
        aria-label={isMuted ? "Sound off" : "Sound on"}
        className="muteButton"
        data-muted={isMuted}
        onClick={() => setIsMuted((value) => !value)}
        type="button"
      >
        {isMuted ? "Sound off" : "Sound on"}
      </button>

      <StreakBanner message={streakMessage} />
      <GameTilt disabled={!answerEntryIsActive || interactionState !== INTERACTION_STATES.READY}>
        <section
          className={`gameFlipScene ${feedback?.isCorrect === false ? "shake" : ""}`}
        >
          <div
            className={`gameFlipCard ${flipStateClass}`}
            onAnimationEnd={finishFlipStage}
          >
          <section
            aria-hidden={!answerEntryIsActive}
            className="gamePanel gameFace gameFront"
            inert={!answerEntryIsActive}
          >
            <div className="questionFrame" key={currentPlayer.id}>
              <div className="questionBlock">
                <p className="draftPrompt">WHO DRAFTED</p>
                <h1>{currentPlayer.name}</h1>
                <DraftCard />
                <div className="playerMeta">
                  <span>{currentPlayer.position}</span>
                  <span>{currentPlayer.draftYear} NFL Draft</span>
                </div>
                <h2>Who drafted {currentPlayer.name}?</h2>
              </div>
            </div>

            <div className="answerPanel">
              <TeamSearch
                currentPlayer={currentPlayer}
                disabled={!answerEntryIsActive}
                onSelect={selectTeam}
                onSubmit={submitGuess}
                resetKey={currentIndex}
                selectedTeam={selectedTeam}
              />

              <button
                className="primaryButton"
                disabled={!selectedTeam || !answerEntryIsActive || isProcessing}
                onClick={submitGuess}
                type="button"
              >
                MAKE YOUR PICK
              </button>
            </div>
          </section>

          <section
            aria-hidden={interactionState !== INTERACTION_STATES.RESULT}
            className={`gamePanel gameFace gameBack ${
              feedback?.isCorrect ? "isCorrect" : feedback ? "isWrong" : ""
            }`}
            inert={interactionState !== INTERACTION_STATES.RESULT}
          >
            {feedback && (
              <div
                aria-live="polite"
                className={`result flipResult ${feedback.isCorrect ? "win" : "miss"}`}
                role="status"
                style={{
                  "--team-primary": teamVisualFor(feedback.correctTeam).primary,
                  "--team-secondary": teamVisualFor(feedback.correctTeam).secondary,
                }}
              >
                {streakMessage && <div className="resultStreak">{streakMessage}</div>}
                <p className="resultLabel">
                  {feedback.isCorrect ? "✓ Correct" : "✕ Not quite"}
                </p>
                <h1>{feedback.player.name}</h1>
                <span className="teamRevealMark" aria-hidden="true">
                  {teamVisualFor(feedback.correctTeam).abbr}
                </span>
                <p className="correctTeamLabel">Correct team</p>
                <h2>{feedback.correctTeam}</h2>
                <div className="draftReveal">
                  <strong>#{feedback.player.overallPick} Overall</strong>
                  <strong>Round {feedback.player.draftRound}</strong>
                  <span>{feedback.player.draftYear} NFL Draft</span>
                </div>
                <div className="resultScoreLine">
                  <span>{feedback.isCorrect ? `+${POINTS_PER_CORRECT}` : "+0"}</span>
                  <small>Score {score} / {maxScore}</small>
                </div>
                <p className="factLine">{playerFacts[feedback.player.id]}</p>
                <button
                  className="primaryButton resultNext"
                  disabled={!canAdvanceFromResult(interactionState)}
                  onClick={nextQuestionNow}
                  type="button"
                >
                  NEXT QUESTION
                </button>
              </div>
            )}
          </section>
          </div>
        </section>
      </GameTilt>

      <section className="topBar" aria-label="Game scoreboard">
        <div>
          <span>Score</span>
          <strong className="scoreValue" key={scorePulse}>{displayScore}</strong>
        </div>
        <div>
          <span>Question</span>
          <strong>{questionNumber} / {QUESTION_TOTAL}</strong>
        </div>
        <div>
          <span>Streak</span>
          <strong>{currentStreak}</strong>
        </div>
      </section>

      <div className="progressTrack" aria-label="Round progress">
        <span style={{ width: `${progress}%` }} />
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
