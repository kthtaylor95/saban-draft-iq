import { useEffect } from "react";

const effectConfig = {
  answer: { count: 14, duration: 2200 },
  final: { count: 18, duration: 1800 },
  perfect: { count: 26, duration: 2400 },
  jailbreak: { count: 8, duration: 900 },
};

export function CelebrationEffect({ effect, effectId, onComplete }) {
  const config = effectConfig[effect];

  useEffect(() => {
    if (!config) return undefined;
    const timer = window.setTimeout(onComplete, config.duration);
    return () => window.clearTimeout(timer);
  }, [config, effectId, onComplete]);

  if (!config) return null;

  return (
    <div
      aria-hidden="true"
      className={`celebration celebration-${effect}`}
      key={effectId}
    >
      {Array.from({ length: config.count }, (_, index) => (
        <span key={index} style={{ "--particle-index": index }} />
      ))}
    </div>
  );
}
