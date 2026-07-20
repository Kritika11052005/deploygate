"use client";

import React, { useState } from "react";
import { AdvisorPlan } from "../lib/types";

interface ApprovalPanelProps {
  plan: AdvisorPlan;
  onApprove: (approvedIds: string[]) => void;
  onSkip: () => void;
  isActive?: boolean;
}

export default function ApprovalPanel({ plan, onApprove, onSkip, isActive = true }: ApprovalPanelProps) {
  // Pre-check "adv-2" (Move deploy window) by default as RECOMMENDED
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(["adv-2"]));

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getEffectTag = (item: typeof plan.items[0]) => {
    if (item.effectType === "Low") {
      return (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase bg-risk-low/10 text-risk-low border-risk-low/20">
          DROPS TO LOW
        </span>
      );
    }
    if (item.effectType === "Medium") {
      return (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase bg-risk-medium/10 text-risk-medium border-risk-medium/20">
          DROPS TO MEDIUM
        </span>
      );
    }
    return null;
  };

  const hasSelection = checkedIds.size > 0;

  return (
    <div className={`glass-panel rounded-xl p-6 transition-all duration-300 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-card-border/60 pb-3 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>✅</span> Review &amp; Approve Fixes
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Layer 4: Select which Advisor recommendations the Fixer Agent should execute.
          </p>
        </div>
        <span className="font-mono text-[10px] text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded border border-card-border">
          STEP 2.75 // APPROVAL
        </span>
      </div>

      {/* Recommendation rows with checkboxes */}
      <div className="space-y-3 mb-6">
        {plan.items.map((item) => {
          const isChecked = checkedIds.has(item.id);
          const isRecommended = item.id === "adv-2";

          return (
            <label
              key={item.id}
              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 select-none ${
                isChecked
                  ? isRecommended
                    ? "bg-brand/8 border-brand/40 shadow-[0_0_12px_rgba(124,108,240,0.08)]"
                    : "bg-slate-800/40 border-slate-600/50"
                  : "bg-slate-900/30 border-card-border/60 hover:border-card-border"
              }`}
            >
              {/* Custom Checkbox */}
              <div className="shrink-0">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    isChecked
                      ? "bg-brand border-brand"
                      : "bg-slate-900 border-slate-600 hover:border-slate-500"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleCheck(item.id);
                  }}
                >
                  {isChecked && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {isRecommended && (
                    <span className="text-[10px] font-mono font-bold bg-brand text-slate-100 px-1.5 py-0.5 rounded uppercase">
                      RECOMMENDED
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-200">{item.remediation}</span>
                </div>
                {item.runbook && (
                  <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-1">
                    <span>📖</span>
                    <span className="underline hover:text-slate-400 cursor-pointer">{item.runbook}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="shrink-0 flex items-center gap-2">
                {getEffectTag(item)}
              </div>
            </label>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={() => onApprove(Array.from(checkedIds))}
          disabled={!hasSelection}
          className={`flex-1 font-bold py-3 px-6 rounded-lg text-sm transition-all cursor-pointer border ${
            hasSelection
              ? "bg-brand hover:bg-brand/90 text-slate-100 border-brand/50 shadow-[0_4px_20px_rgba(124,108,240,0.25)]"
              : "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
          }`}
        >
          Approve &amp; Run Fixer Agent
        </button>
        <button
          onClick={onSkip}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-card-border font-semibold py-3 px-6 rounded-lg text-sm transition-all cursor-pointer"
        >
          Skip — Reject All Fixes
        </button>
      </div>

      {/* Caption */}
      <div className="text-[11px] font-mono text-slate-500 text-center">
        Fixer Agent executes only what&apos;s explicitly approved here — nothing runs without an operator command.
      </div>
    </div>
  );
}
