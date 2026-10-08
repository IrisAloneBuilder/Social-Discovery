export default function SpotLight() {
  return (
    <svg
      className="spot-light"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    >
      <defs>
        <linearGradient id="holo-beam" x1="75%" y1="90%" x2="30%" y2="30%">
          <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.12" />
          <stop offset="40%" stop-color="#00e5ff" stop-opacity="0.04" />
          <stop offset="100%" stop-color="#00e5ff" stop-opacity="0" />
        </linearGradient>

        <radialGradient id="wall-splash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.08" />
          <stop offset="70%" stop-color="#00e5ff" stop-opacity="0.02" />
          <stop offset="100%" stop-color="#00e5ff" stop-opacity="0" />
        </radialGradient>
      </defs>

      <ellipse
        cx="700"
        cy="450"
        rx="800"
        ry="500"
        fill="url(#wall-splash)"
        style={{ mixBlendMode: "screen" }}
      />

      <polygon
        points="1400,950 1550,950 900,0 0,0 0,600"
        fill="url(#holo-beam)"
        style={{ mixBlendMode: "screen" }}
      />
    </svg>
  );
}
