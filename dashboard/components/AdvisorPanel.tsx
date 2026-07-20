"use client";

import React from "react";
import { AdvisorPlan } from "../lib/types";

interface AdvisorPanelProps {
  plan: AdvisorPlan;
  isActive?: boolean;
}

export default function AdvisorPanel({ plan, isActive = true }: AdvisorPanelProps) {
  const getEffectColorClass = (effectType?: "Low" | "Medium" | "High") => {
    switch (effectType) {
      case "Low":
        return "bg-risk-low/10 text-risk-low border-risk-low/20";
      case "Medium":
        return "bg-risk-medium/10 text-risk-medium border-risk-medium/20";
      case "High":
        return "bg-risk-high/10 text-risk-high border-risk-high/20";
      default:
        return "bg-slate-800/40 text-slate-400 border-slate-700/50";
    }
  };

  return (
    <div className={`glass-panel rounded-xl p-6 transition-all duration-300 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-card-border/60 pb-3 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>🤖</span> Advisor Agent Remediation
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Layer 3: RAG-grounded LLM retrieves team runbooks to draft risk mitigation steps.
          </p>
        </div>
        <span className="font-mono text-[10px] text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded border border-card-border">
          STEP 2.5 // ADVISOR
        </span>
      </div>

      {/* Advisory list */}
      <div className="space-y-4 mb-6">
        {plan.items.map((item) => {
          const isTargetFix = item.id === "adv-2"; // Move deploy window to Tue 10 AM

          return (
            <div
              key={item.id}
              className={`p-4 rounded-lg border transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                isTargetFix
                  ? "bg-brand/5 border-brand/40 shadow-[0_0_12px_rgba(124,108,240,0.1)] hover:border-brand/60"
                  : "bg-slate-900/30 border-card-border/60 hover:border-card-border"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isTargetFix && (
                    <span className="text-[10px] font-mono font-bold bg-brand text-slate-100 px-1.5 py-0.25 rounded uppercase">
                      Recommended
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-200">{item.remediation}</span>
                </div>
                {item.runbook && (
                  <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <span>📖 Reference runbook:</span>
                    <span className="underline hover:text-slate-400 cursor-pointer">{item.runbook}</span>
                  </div>
                )}
              </div>

              {/* Impact / Action */}
              <div className="flex items-center gap-3 shrink-0">
                {item.effect && (
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded border uppercase ${getEffectColorClass(
                      item.effectType
                    )}`}
                  >
                    {item.effect}
                  </span>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* Caption footer */}
      <div className="border-t border-card-border/40 pt-4 text-xs font-mono text-slate-400">
        ✨ {plan.caption}
      </div>
    </div>
  );
}
