export function Atmosphere({ variant = "game" }) {
  return (
    <div className={`atmosphere atmosphere-${variant}`} aria-hidden="true">
      <span className="atmosphereVignette" />
      <span className="atmosphereLight atmosphereLightLeft" />
      <span className="atmosphereLight atmosphereLightRight" />
      <span className="atmosphereSweep" />
      <span className="atmosphereGrain" />
      <span className="atmosphereParticles">
        {Array.from({ length: 12 }, (_, index) => (
          <i key={index} style={{ "--particle-index": index }} />
        ))}
      </span>
    </div>
  );
}
