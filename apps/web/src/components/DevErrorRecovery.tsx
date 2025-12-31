"use client";

import { useEffect } from "react";

const RECOVERY_PORT = 13001;
const RECOVERY_URL = `http://localhost:${RECOVERY_PORT}/recovery`;

const ERROR_PATTERNS = [
  /__webpack_modules__\[moduleId\] is not a function/,
  /Cannot find module '\.\/vendor-chunks\//,
  /ChunkLoadError/,
  /Loading chunk \d+ failed/,
  /Module not found/,
];

async function triggerRecovery() {
  console.log("🔧 Triggering dev server recovery...");
  try {
    await fetch(RECOVERY_URL, { method: "POST" });
    // Show user feedback
    if (typeof window !== "undefined") {
      const overlay = document.createElement("div");
      overlay.id = "recovery-overlay";
      overlay.innerHTML = `
        <div style="
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          color: white;
          font-family: system-ui, sans-serif;
        ">
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔧</div>
            <div style="font-size: 20px; font-weight: 600;">Recovering...</div>
            <div style="font-size: 14px; opacity: 0.7; margin-top: 8px;">
              Cache cleared. Restarting dev server...
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Reload after a delay to give server time to restart
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  } catch (err) {
    console.error("Failed to trigger recovery:", err);
  }
}

function checkError(message: string): boolean {
  return ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export function DevErrorRecovery() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") return;

    const handleError = (event: ErrorEvent) => {
      if (checkError(event.message)) {
        event.preventDefault();
        triggerRecovery();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason);
      if (checkError(message)) {
        event.preventDefault();
        triggerRecovery();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
