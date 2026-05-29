import React from "react";

export function LogPoseOverlay() {
  const box = {
    border: "1px solid rgba(255, 218, 129, 0.30)",
    borderRadius: "16px",
    padding: "10px 12px",
    background: "rgba(3, 24, 38, 0.86)",
    color: "#fff4cf",
    boxShadow: "0 10px 26px rgba(0, 0, 0, 0.24)"
  };

  const label = {
    display: "block",
    color: "#ffdc85",
    fontSize: "0.68rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: "4px"
  };

  return (
    <aside
      aria-label="Log Pose de reprise"
      style={{
        margin: "14px 0 16px",
        display: "grid",
        gridTemplateColumns: "130px repeat(3, minmax(0, 1fr))",
        gap: "8px"
      }}
    >
      <div
        style={{
          display: "grid",
          placeItems: "center",
          borderRadius: "16px",
          border: "1px solid rgba(255, 218, 129, 0.55)",
          background: "linear-gradient(145deg, rgba(255, 221, 139, 0.96), rgba(178, 111, 39, 0.94))",
          color: "#251404",
          fontWeight: 900,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textAlign: "center",
          padding: "10px"
        }}
      >
        Log Pose
      </div>
      <article style={box}>
        <strong style={label}>Cap</strong>
        <span style={{ fontWeight: 800 }}>Transformer le flou en prochaines actions.</span>
      </article>
      <article style={box}>
        <strong style={label}>À protéger</strong>
        <span style={{ fontWeight: 800 }}>Mémoire, documents, décisions et traces utiles.</span>
      </article>
      <article style={box}>
        <strong style={label}>Prochaine manœuvre</strong>
        <span style={{ fontWeight: 800 }}>Stabiliser la V1 démo sans élargir le périmètre.</span>
      </article>
    </aside>
  );
}
