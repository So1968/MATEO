import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function LogPoseOverlay() {
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const commandDeck = document.querySelector(".commandDeck");
    const sectionIntro = document.querySelector(".sectionIntro");

    if (!commandDeck || !sectionIntro) return undefined;

    let target = document.querySelector(".logPoseSlot");
    if (!target) {
      target = document.createElement("div");
      target.className = "logPoseSlot";
      sectionIntro.insertAdjacentElement("afterend", target);
    }

    setSlot(target);

    return () => {
      if (target && target.childElementCount === 0) {
        target.remove();
      }
    };
  }, []);

  const panel = {
    width: "min(760px, 100%)",
    margin: "8px auto 12px",
    display: "grid",
    gridTemplateColumns: "92px repeat(3, minmax(0, 1fr))",
    gap: "7px",
    alignItems: "stretch"
  };

  const titleBox = {
    display: "grid",
    placeItems: "center",
    minHeight: "44px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 218, 129, 0.48)",
    background: "linear-gradient(145deg, rgba(255, 221, 139, 0.96), rgba(178, 111, 39, 0.92))",
    color: "#251404",
    fontWeight: 900,
    fontSize: "0.62rem",
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    textAlign: "center",
    padding: "7px"
  };

  const card = {
    minHeight: "44px",
    border: "1px solid rgba(255, 218, 129, 0.24)",
    borderRadius: "12px",
    padding: "7px 9px",
    background: "rgba(3, 24, 38, 0.58)",
    color: "#fff4cf",
    boxShadow: "0 6px 14px rgba(0, 0, 0, 0.14)",
    overflow: "hidden"
  };

  const label = {
    display: "block",
    color: "#ffdc85",
    fontSize: "0.50rem",
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    marginBottom: "2px"
  };

  const text = {
    display: "block",
    fontWeight: 800,
    fontSize: "0.72rem",
    lineHeight: 1.15
  };

  const content = (
    <aside aria-label="Log Pose de reprise" style={panel}>
      <div style={titleBox}>Log Pose</div>
      <article style={card}>
        <strong style={label}>Cap</strong>
        <span style={text}>Transformer le flou.</span>
      </article>
      <article style={card}>
        <strong style={label}>À protéger</strong>
        <span style={text}>Mémoire et décisions.</span>
      </article>
      <article style={card}>
        <strong style={label}>Prochaine manœuvre</strong>
        <span style={text}>Stabiliser la V1.</span>
      </article>
    </aside>
  );

  return slot ? createPortal(content, slot) : null;
}
