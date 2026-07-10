import { useEffect, useRef, useState } from "react";

export function GameTilt({ children, disabled = false }) {
  const cardRef = useRef(null);
  const [tiltAllowed, setTiltAllowed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 760px) and (prefers-reduced-motion: no-preference)",
    );
    const updateTiltAvailability = () => setTiltAllowed(media.matches);
    updateTiltAvailability();
    media.addEventListener("change", updateTiltAvailability);
    return () => media.removeEventListener("change", updateTiltAvailability);
  }, []);

  function resetTilt() {
    cardRef.current?.style.setProperty("--tilt-lift", "0px");
  }

  function handlePointerMove(event) {
    if (!tiltAllowed || disabled || event.pointerType !== "mouse") return;
    cardRef.current?.style.setProperty("--tilt-lift", "-3px");
  }

  return (
    <div
      className="gameTilt"
      data-tilt-disabled={disabled || !tiltAllowed}
      onPointerLeave={resetTilt}
      onPointerMove={handlePointerMove}
      ref={cardRef}
    >
      {children}
    </div>
  );
}
