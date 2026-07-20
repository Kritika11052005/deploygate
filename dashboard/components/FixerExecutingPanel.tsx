"use client";

import React from "react";

interface FixerDiff {
  id: string;
  label: string;
  diff: string;
}

interface FixerExecutingPanelProps {
  approvedIds: string[];
  onRerunRiskGate: () => void;
  isActive?: boolean;
}

// TODO: Wire this to a real GitHub API call in a later iteration.
// Each approved fix ID maps to a mock diff/commit block.
// Replace this mapping with actual PR-editing logic when integrating with GitHub.
const DIFF_MAP: Record<string, FixerDiff> = {
  "adv-1": {
    id: "adv-1",
    label: "Split PR at the payments/ service boundary",
    diff: `--- a/config/pr-split.yml
+++ b/config/pr-split.yml
@@ -1,3 +1,6 @@
-  scope: "monorepo/*"
+  scope: "payments/*"
+  split_strategy: "service_boundary"
+  child_prs:
+    - "payments/webhook-retry"
+    - "payments/billing-format"`,
  },
  "adv-2": {
    id: "adv-2",
    label: "Move deploy window to Tue 10:00 AM",
    diff: `--- a/config/deploy.yml
+++ b/config/deploy.yml
@@ -4,1 +4,1 @@
-  deploy_window: "Fri 17:52"
+  deploy_window: "Tue 10:00 AM"`,
  },
  "adv-3": {
    id: "adv-3",
    label: "Add a rollback step",
    diff: `--- a/.github/workflows/deploy.yml
+++ b/.github/workflows/deploy.yml
@@ -22,0 +23,4 @@
+    - name: Rollback on failure
+      if: failure()
+      run: |
+        ./scripts/rollback.sh --auto`,
  },
};

export default function FixerExecutingPanel({
  approvedIds,
  onRerunRiskGate,
  isActive = true,
}: FixerExecutingPanelProps) {
  const diffs = approvedIds
    .map((id) => DIFF_MAP[id])
    .filter(Boolean);

  return (
    <div
      className={`glass-panel rounded-xl p-6 transition-all duration-300 ${
        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-card-border/60 pb-3 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>⚡</span> Fixer Agent Executing
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Layer 4: Applying approved changes via fixed, auditable tool calls.
          </p>
        </div>
        <span className="font-mono text-[10px] text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded border border-card-border">
          STEP 2.85 // FIXER
        </span>
      </div>

      {/* Diff blocks — one per approved fix */}
      <div className="space-y-4 mb-5">
        {diffs.map((d) => (
          <div key={d.id} className="rounded-lg border border-card-border/60 overflow-hidden">
            {/* File header bar */}
            <div className="bg-slate-900/60 px-4 py-2 border-b border-card-border/40 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">{d.label}</span>
              <span className="text-[10px] font-mono text-risk-low bg-risk-low/10 border border-risk-low/20 px-1.5 py-0.5 rounded uppercase">
                APPLIED
              </span>
            </div>
            {/* Diff content */}
            <pre className="bg-slate-950/60 p-4 text-xs font-mono leading-relaxed overflow-x-auto">
              {d.diff.split("\n").map((line, i) => {
                let lineClass = "text-slate-400";
                if (line.startsWith("+") && !line.startsWith("+++")) {
                  lineClass = "text-risk-low bg-risk-low/5";
                } else if (line.startsWith("-") && !line.startsWith("---")) {
                  lineClass = "text-risk-high bg-risk-high/5";
                } else if (line.startsWith("@@")) {
                  lineClass = "text-brand/70";
                } else if (line.startsWith("---") || line.startsWith("+++")) {
                  lineClass = "text-slate-500";
                }
                return (
                  <div key={i} className={`px-1 ${lineClass}`}>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        ))}
      </div>

      {/* Status line */}
      <div className="bg-slate-950/40 border border-card-border/40 rounded-lg px-4 py-2.5 mb-5 flex items-center gap-2">
        <span className="text-risk-low text-sm">✓</span>
        <span className="text-xs font-mono text-slate-300">
          Committed to branch <span className="text-brand">feature/payment-webhook-retry</span> — awaiting re-scan
        </span>
      </div>

      {/* Primary button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onRerunRiskGate}
          className="w-full sm:w-auto bg-brand hover:bg-brand/90 text-slate-100 font-bold py-3 px-8 rounded-lg text-sm transition-all cursor-pointer border border-brand/50 shadow-[0_4px_20px_rgba(124,108,240,0.25)]"
        >
          Re-run Risk Gate
        </button>

        {/* Caption */}
        {/* TODO: This is mock data — no real commit is made yet.
            Wire this action to a real GitHub API call here in a later iteration. */}
        <span className="text-[11px] font-mono text-slate-500 text-center">
          This is mock data — no real commit is made yet. Wire this action to a real GitHub API call in a later iteration.
        </span>
      </div>
    </div>
  );
}
