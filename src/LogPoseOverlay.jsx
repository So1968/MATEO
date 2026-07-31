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
      padding: "0",
      margin: "-8px auto 10px"
    });

    setSlot(target);

    return () => {
      if (target && target.childElementCount === 0) {
        target.remove();
      }
    };
  }, []);

  const panel = {
    width: "min(560px, 88%)",
    minHeight: "42px",
    display: "grid",
    gridTemplateColumns: "74px repeat(3, minmax(0, 1fr))",
    gap: "5px",
    alignItems: "stretch",
    padding: "5px",
    borderRadius: "15px",
    border: "1px solid rgba(255, 218, 129, 0.22)",
    background: "rgba(5, 27, 43, 0.48)",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.14)"
  };

  const titleBox = {
    display: "grid",
    placeItems: "center",
    borderRadius: "11px",
    background: "linear-gradient(145deg, rgba(255, 221, 139, 0.95), rgba(178, 111, 39, 0.90))",
    color: "#251404",
    fontWeight: 900,
    fontSize: "0.50rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    textAlign: "center",
    padding: "5px 6px"
  };

  const card = {
    borderRadius: "11px",
    padding: "6px 7px",
    background: "rgba(255, 247, 220, 0.07)",
    color: "#fff4cf",
    overflow: "hidden"
  };

  const label = {
    display: "block",
    color: "#ffdc85",
    fontSize: "0.42rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "1px"
  };

  const text = {
    display: "block",
    fontWeight: 800,
    fontSize: "0.60rem",
    lineHeight: 1.08,
    whiteSpace: "normal"
  };

  const content = (
    <aside aria-label="Log Pose de reprise" style={panel}>
      <div style={titleBox}>Log Pose</div>
      <article style={card}>
        <strong style={label}>Cap</strong>
        <span style={text}>Prochain geste.</span>
      </article>
      <article style={card}>
        <strong style={label}>À protéger</strong>
        <span style={text}>Mémoire et décisions.</span>
      </article>
      <article style={card}>
        <strong style={label}>Manœuvre</strong>
        <span style={text}>Démo stable.</span>
      </article>
    </aside>
  );

  return slot ? createPortal(content, slot) : null;
}
