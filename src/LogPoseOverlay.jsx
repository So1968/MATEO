import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function LogPoseOverlay() {
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const sectionIntro = document.querySelector(".sectionIntro");
    if (!sectionIntro) return undefined;

    let target = document.querySelector(".logPoseSlot");
    if (!target) {
      target = document.createElement("div");
      target.className = "logPoseSlot";
      sectionIntro.insertAdjacentElement("afterend", target);
    }

    Object.assign(target.style, {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box",
      padding: "0 18px",
      margin: "-2px 0 12px"
    });

    setSlot(target);

    return () => {
      if (target && target.childElementCount === 0) {
        target.remove();
      }
    };
  }, []);

  const panel = {
    width: "min(680px, 92%)",
    minHeight: "54px",
    display: "grid",
    gridTemplateColumns: "86px repeat(3, minmax(0, 1fr))",
    gap: "6px",
    alignItems: "stretch",
    padding: "6px",
    borderRadius: "18px",
    border: "1px solid rgba(255, 218, 129, 0.26)",
    background: "rgba(5, 27, 43, 0.58)",
    boxShadow: "0 8px 22px rgba(0, 0, 0, 0.16)"
  };

  const titleBox = {
    display: "grid",
    placeItems: "center",
    borderRadius: "13px",
    background: "linear-gradient(145deg, rgba(255, 221, 139, 0.96), rgba(178, 111, 39, 0.92))",
    color: "#251404",
    fontWeight: 900,
    fontSize: "0.58rem",
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    textAlign: "center",
    padding: "6px 8px"
  };

  const card = {
    borderRadius: "13px",
    padding: "7px 9px",
    background: "rgba(255, 247, 220, 0.08)",
    color: "#fff4cf",
    overflow: "hidden"
  };

  const label = {
    display: "block",
    color: "#ffdc85",
    fontSize: "0.48rem",
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    marginBottom: "2px"
  };

  const text = {
    display: "block",
    fontWeight: 800,
    fontSize: "0.68rem",
    lineHeight: 1.13,
    whiteSpace: "normal"
  };

  const content = (
    <aside aria-label="Log Pose de reprise" style={panel}>
      <div style={titleBox}>Log Pose</div>
      <article style={card}>
        <strong style={label}>Cap</strong>
        <span style={text}>Clarifier le prochain geste.</span>
      </article>
      <article style={card}>
        <strong style={label}>À protéger</strong>
        <span style={text}>Mémoire et décisions.</span>
      </article>
      <article style={card}>
        <strong style={label}>Manœuvre</strong>
        <span style={text}>Stabiliser la démo.</span>
      </article>
    </aside>
  );

  return slot ? createPortal(content, slot) : null;
}
