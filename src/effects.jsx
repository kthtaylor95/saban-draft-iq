import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------------------------------------------------------------------------
   Shared media-query hooks
   ------------------------------------------------------------------------- */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : false,
  );
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    mql.addEventListener("change", handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useCoarsePointer() {
  return useMediaQuery("(hover: none), (pointer: coarse)");
}

/* ---------------------------------------------------------------------------
   Card pointer tilt — desktop only, disabled on touch / reduced motion / flip
   ------------------------------------------------------------------------- */
export function useCardTilt(disabled) {
  const ref = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useCoarsePointer();
  const active = !disabled && !reducedMotion && !coarsePointer;

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (!active) {
      node.style.removeProperty("--rx");
      node.style.removeProperty("--ry");
      node.classList.remove("isTilting");
      return undefined;
    }

    const MAX = 1.6; // degrees — deliberately restrained
    function onMove(event) {
      if (event.pointerType === "touch") return;
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      node.classList.add("isTilting");
      node.style.setProperty("--rx", `${px * MAX * 2}deg`);
      node.style.setProperty("--ry", `${-py * MAX * 2}deg`);
    }
    function onLeave() {
      node.classList.remove("isTilting");
      node.style.setProperty("--rx", "0deg");
      node.style.setProperty("--ry", "0deg");
    }

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [active]);

  return ref;
}

/* ---------------------------------------------------------------------------
   Ambient atmosphere — layered stadium background behind all content
   ------------------------------------------------------------------------- */
export function Atmosphere() {
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useCoarsePointer();
  const emberCount = reducedMotion ? 0 : coarsePointer ? 7 : 14;

  const embers = useMemo(() => {
    return Array.from({ length: emberCount }, (_, i) => {
      const seed = (i + 1) * 12.9898;
      const rand = (n) => {
        const v = Math.sin(seed * (n + 1)) * 43758.5453;
        return v - Math.floor(v);
      };
      return {
        left: `${Math.round(rand(1) * 100)}%`,
        size: `${2 + Math.round(rand(2) * 4)}px`,
        duration: `${16 + Math.round(rand(3) * 18)}s`,
        delay: `${-Math.round(rand(4) * 24)}s`,
        drift: `${Math.round((rand(5) - 0.5) * 120)}px`,
      };
    });
  }, [emberCount]);

  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmoVignette" />
      <div className="atmoGlow atmoGlowLeft" />
      <div className="atmoGlow atmoGlowRight" />
      <div className="atmoGrain" />
      {!reducedMotion && <div className="atmoSweep" />}
      <div className="atmoEmbers">
        {embers.map((e, i) => (
          <span
            className="ember"
            key={i}
            style={{
              "--x": e.left,
              "--s": e.size,
              "--d": e.duration,
              "--delay": e.delay,
              "--drift": e.drift,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Broadcast streak banner
   ------------------------------------------------------------------------- */
export function StreakBanner({ kicker, title }) {
  return (
    <div className="streakBanner" role="status" aria-live="polite">
      <span className="streakBanner-kicker">{kicker}</span>
      <span className="streakBanner-title">{title}</span>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Celebration effects — sparks, confetti, fireworks, pulse
   Each returns pointer-events:none nodes that clean themselves up.
   ------------------------------------------------------------------------- */
const FX_COLORS = ["#f2c14e", "#c31a37", "#ffffff", "#e8c583"];

function seededParticles(count, id, spread, life) {
  return Array.from({ length: count }, (_, i) => {
    const seed = (id * 97 + i * 31) % 360;
    const angle = (seed / 360) * Math.PI * 2;
    const dist = spread * (0.45 + ((i * 7) % 11) / 18);
    return {
      dx: `${Math.round(Math.cos(angle) * dist)}px`,
      dy: `${Math.round(Math.sin(angle) * dist)}px`,
      size: `${5 + ((i * 5) % 6)}px`,
      color: FX_COLORS[i % FX_COLORS.length],
      life: `${life}ms`,
    };
  });
}

function Burst({ id, x, y, count, spread, life }) {
  const particles = useMemo(
    () => seededParticles(count, id, spread, life),
    [id, count, spread, life],
  );
  return (
    <div className="fxNode" style={{ left: x, top: y }}>
      {particles.map((p, i) => (
        <span
          className="fxParticle"
          key={i}
          style={{
            "--dx": p.dx,
            "--dy": p.dy,
            "--size": p.size,
            "--color": p.color,
            "--life": p.life,
          }}
        />
      ))}
    </div>
  );
}

function ConfettiField({ id, count, life }) {
  const strips = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const seed = (id * 53 + i * 17) % 100;
        return {
          x: `${seed}%`,
          color: FX_COLORS[i % FX_COLORS.length],
          delay: `${(i % 12) * 90}ms`,
          life: `${life + ((i * 37) % 900)}ms`,
        };
      }),
    [id, count, life],
  );
  return (
    <div className="fxNode" style={{ inset: 0 }}>
      {strips.map((s, i) => (
        <span
          className="fxConfetti"
          key={i}
          style={{
            "--x": s.x,
            "--color": s.color,
            "--delay": s.delay,
            "--life": s.life,
          }}
        />
      ))}
    </div>
  );
}

function CelebrationItem({ effect }) {
  const { id, type } = effect;
  switch (type) {
    case "spark":
      return <Burst id={id} x="50%" y="40%" count={12} spread={90} life={900} />;
    case "fireworks":
      return (
        <>
          <Burst id={id} x="18%" y="24%" count={16} spread={150} life={1600} />
          <Burst id={id + 1} x="82%" y="22%" count={16} spread={150} life={1800} />
          <Burst id={id + 2} x="50%" y="16%" count={14} spread={120} life={1500} />
          <ConfettiField id={id} count={40} life={2400} />
        </>
      );
    case "perfect":
      return (
        <>
          <div className="fxPulse" />
          <Burst id={id} x="16%" y="22%" count={22} spread={190} life={2200} />
          <Burst id={id + 1} x="84%" y="20%" count={22} spread={190} life={2400} />
          <Burst id={id + 2} x="50%" y="12%" count={18} spread={150} life={2000} />
          <ConfettiField id={id} count={70} life={3000} />
        </>
      );
    case "pulse":
      return <div className="fxPulse" />;
    default:
      return null;
  }
}

export function CelebrationLayer({ effects }) {
  if (!effects.length) return null;
  return (
    <div className="fxLayer" aria-hidden="true">
      {effects.map((effect) => (
        <CelebrationItem effect={effect} key={effect.id} />
      ))}
    </div>
  );
}

/* Hook that manages the active celebration list with self-cleanup. */
const FX_DURATION = { spark: 1100, fireworks: 2900, perfect: 3400, pulse: 1000 };

export function useCelebrations(enabled) {
  const [effects, setEffects] = useState([]);
  const idRef = useRef(1);
  const timersRef = useRef([]);

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    },
    [],
  );

  function fire(type) {
    if (!enabled) return;
    const id = idRef.current;
    idRef.current += 10; // leave room for multi-burst offsets
    setEffects((list) => [...list, { id, type }]);
    const timer = window.setTimeout(() => {
      setEffects((list) => list.filter((e) => e.id !== id));
      timersRef.current = timersRef.current.filter((t) => t !== timer);
    }, FX_DURATION[type] || 1500);
    timersRef.current.push(timer);
  }

  function clear() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setEffects([]);
  }

  return { effects, fire, clear };
}
