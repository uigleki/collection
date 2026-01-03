import { useState } from "react";

export function DevTools() {
  const [isCrashed, setIsCrashed] = useState(false);

  if (!import.meta.env.DEV) return null;
  if (isCrashed) throw new Error("⚡️ Dev Test: Error Boundary Triggered");

  return (
    /* Test Crash Button - Left bottom corner */
    <button
      type="button"
      aria-label="Test crash for error boundary"
      onClick={() => setIsCrashed(true)}
      className="fixed bottom-4 left-4 px-3 py-1 bg-red-500 text-white text-xs rounded opacity-50 hover:opacity-100 transition-opacity z-50"
    >
      Test Crash
    </button>
  );
}
