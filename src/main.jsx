import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { LogPoseOverlay } from "./LogPoseOverlay.jsx";

createRoot(document.getElementById("root")).render(
  <>
    <App />
    <LogPoseOverlay />
  </>
);
