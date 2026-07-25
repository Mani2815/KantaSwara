import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8 bg-[var(--color-bg-base)]">
      <div className="flex flex-col items-center gap-4 text-[var(--color-text-muted)]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6600]" />
        <p className="text-sm font-medium tracking-tight">Loading...</p>
      </div>
    </div>
  );
}
