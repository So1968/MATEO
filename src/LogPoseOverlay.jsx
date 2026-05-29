import React from "react";

export function LogPoseOverlay() {
  const panel = {
    width: "min(920px, calc(100vw - 360px))",
    maxWidth: "920px",
    margin: "12px auto 18px",
    display: "grid",
    gridTemplateColumns: "110px repeat(3, minmax(0, 1fr))",
    gap: "8px",
    alignItems: "stretch"
  };

  const titleBox = {
    display: "grid",
    placeItems: "center",
    minHeight: "58px",
    borderRadius: "14px",
    border: "1px solid rgba(255, 218, 129, 0.55)",
    background: "linear-gradient(145deg, rgba(255, 221, 139, 0.96), rgba(178, 111, 39, 0.94))",
    color: "#251404",
    fontWeight: 900,
    fontSize: "0.72rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    textAlign: "center",
    padding: "8px"
  };

  const card = {
    minHeight: "58px",
    border: "1px solid rgba(255, 218, 129, 0.28)",
    borderRadius: "14px",
    padding: "8px 10px",
    background: "rgba(3, 24, 38, 0.72)",
    color: "#fff4cf",
    boxShadow: "0 8px 18px rgba(0, 0, 0, 0.18)",
    overflow: "hidden"
  };

  const label = {
    display: "block",
    color: "#ffdc85",
    fontSize: "0.58rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "3px"
  };

  const text = {
    display: "block",
    fontWeight: 800,
    fontSize: "0.82rem",
    lineHeight: 1.22
  };

  return (
    <aside aria-label="Log Pose de reprise" style={panel}>
      <div style={titleBox}>Log Pose</div>
      <article style={card}>
        <strong style={label}>Cap</strong>
        <span style={text}>Transformer le flou en actions.</span>
      </article>
      <article style={card}>
        <strong style={label}>À protéger</strong>
        <span style={text}>Mémoire, documents, décisions.</span>
      </article>
      <article style={card}>
        <strong style={label}>Prochaine manœuvre</strong>
        <span style={text}>Stabiliser la V1 démo.</span>
      </article>
    </aside>
  );
}
