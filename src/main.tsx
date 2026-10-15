import { MotionConfig } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app";
import "@/styles/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root does not exist");
}

createRoot(root).render(
  <StrictMode>
    <NuqsAdapter>
      {/* Honour the OS "reduce motion" setting: transforms are skipped, fades remain. */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </NuqsAdapter>
  </StrictMode>
);
