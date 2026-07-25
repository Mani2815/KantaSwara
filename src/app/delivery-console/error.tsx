"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error safely to our monitoring system without exposing to UI
    console.error("Route error boundary caught an error:", error.digest);
  }, [error]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 bg-[var(--color-bg-base)]">
      <div className="flex max-w-md flex-col items-center text-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-4 flex items-center gap-2 rounded-lg bg-[#ff6600] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e65c00]"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
