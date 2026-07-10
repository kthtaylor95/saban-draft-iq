import React, { useEffect, useState } from "react";

/* The Jailbreak Round is a cosmetic bonus easter-egg. It does NOT affect the
   official score. Answer is 83. Copy is intentionally light and carries a
   "not a real stat" disclaimer; it avoids any real-player / arrest imagery. */

const JAILBREAK = {
  question:
    "Bonus legend: according to totally unofficial Crimson Tide bar math, how many Alabama players suited up on NFL rosters last season?",
  options: [61, 74, 83, 92],
  answer: 83,
  disclaimer:
    "Just for fun — not an official statistic, and not about any one player.",
};

export function JailbreakUnlock({ onDone, reducedMotion }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, reducedMotion ? 250 : 1700);
    return () => window.clearTimeout(timer);
  }, [onDone, reducedMotion]);

  return (
    <div className="jbUnlockOverlay" role="status" aria-label="Unlocking the Jailbreak Round">
      {!reducedMotion && <div className="jbBars" aria-hidden="true" />}
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <div className="jbLock" aria-hidden="true">🔓</div>
        <div className="jbUnlockText">Jailbreak Round</div>
      </div>
    </div>
  );
}

export function JailbreakRound({ onFinish, fireCelebration }) {
  const [phase, setPhase] = useState("ask"); // ask | revealing | result
  const [selected, setSelected] = useState(null);

  const flipClass =
    phase === "revealing" ? "isRevealing" : phase === "result" ? "isResult" : "";
  const isCorrect = selected === JAILBREAK.answer;

  function choose(value) {
    if (phase !== "ask") return;
    setSelected(value);
    setPhase("revealing");
    if (value === JAILBREAK.answer) fireCelebration("spark");
  }

  function onAnimationEnd(event) {
    if (
      event.target !== event.currentTarget ||
      !event.animationName.startsWith("answerCard")
    ) {
      return;
    }
    if (phase === "revealing") setPhase("result");
  }

  return (
    <section className="gameFlipScene jbScene">
      <div className={`gameFlipCard ${flipClass}`} onAnimationEnd={onAnimationEnd}>
        {/* Front — the bonus question */}
        <section
          aria-hidden={phase !== "ask"}
          className="gamePanel gameFace gameFront"
          inert={phase !== "ask"}
        >
          <div className="questionBlock">
            <div className="jbHeader">
              <span className="jbBadge">Jailbreak Round</span>
            </div>
            <p className="draftPrompt">🚨 Bonus · Off the record</p>
            <h2 className="jbQuestion">{JAILBREAK.question}</h2>
            <p className="jbDisclaimer">{JAILBREAK.disclaimer}</p>
          </div>
          <div className="answerPanel">
            <div className="answerChoices" role="group" aria-label="Pick a number">
              {JAILBREAK.options.map((value) => {
                const optionCorrect = phase !== "ask" && value === JAILBREAK.answer;
                const optionWrong =
                  phase !== "ask" && value === selected && !isCorrect;
                return (
                  <button
                    className={`choiceBtn ${optionCorrect ? "isCorrect" : ""} ${
                      optionWrong ? "isWrong" : ""
                    }`}
                    disabled={phase !== "ask"}
                    key={value}
                    onClick={() => choose(value)}
                    type="button"
                  >
                    {(optionCorrect || optionWrong) && (
                      <span className="choiceMark" aria-hidden="true">
                        {optionCorrect ? "✓" : "✕"}
                      </span>
                    )}
                    <span>{value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Back — the reveal, stays until the player continues */}
        <section
          aria-hidden={phase !== "result"}
          className={`gamePanel gameFace gameBack ${isCorrect ? "isCorrect" : "isWrong"}`}
          inert={phase !== "result"}
        >
          <div
            className={`result flipResult ${isCorrect ? "win" : "miss"}`}
            role="status"
            aria-live="polite"
          >
            <p className="resultLabel">{isCorrect ? "✓ Escape successful" : "✕ Denied"}</p>
            <p className="correctTeamLabel">The number was</p>
            <div className="jbAnswerBig">{JAILBREAK.answer}</div>
            <p className="factLine">
              {isCorrect
                ? "Freedom granted. You clearly know your Tide."
                : "The warden keeps the record. Better luck next breakout."}
            </p>
            <p className="jbDisclaimer">{JAILBREAK.disclaimer}</p>
            <button
              className="primaryButton resultNext"
              disabled={phase !== "result"}
              onClick={() => onFinish(isCorrect)}
              type="button"
            >
              Back to Results
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
