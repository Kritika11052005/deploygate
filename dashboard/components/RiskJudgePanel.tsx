"use client";

import React, { useEffect, useState } from "react";
import { RiskAssessment } from "../lib/types";

interface RiskJudgePanelProps {
  assessment: RiskAssessment;
  isActive?: boolean;
}

export default function RiskJudgePanel({ assessment, isActive = true }: RiskJudgePanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [displayedAssessment, setDisplayedAssessment] = useState<RiskAssessment>(assessment);

  // Trigger brief analyzing state when assessment changes
  useEffect(() => {
    if (isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
        setDisplayedAssessment(assessment);
      }, 700); // ~0.7s analyzing beat
      return () => clearTimeout(timer);
    }
  }, [assessment, isActive]);

  const { risk, score, top_factors } = displayedAssessment;

  // Determine colors based on risk state
  let riskColorClass = "text-risk-high border-risk-high/30 bg-risk-high/10 glow-high";
  let scoreBarColor = "bg-risk-high shadow-[0_0_12px_rgba(229,72,77,0.5)]";

  if (risk === "Medium") {
    riskColorClass = "text-risk-medium border-risk-medium/30 bg-risk-medium/10 glow-medium";
    scoreBarColor = "bg-risk-medium shadow-[0_0_12px_rgba(245,166,35,0.5)]";
  } else if (risk === "Low") {
    riskColorClass = "text-risk-low border-risk-low/30 bg-risk-low/10 glow-low";
    scoreBarColor = "bg-risk-low shadow-[0_0_12px_rgba(47,177,112,0.5)]";
  }

  return (
    <div className={`glass-panel rounded-xl p-6 transition-all duration-300 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-card-border/60 pb-3 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>🧠</span> Risk Judge Classifier
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Layer 2: LightGBM ML classifier models security and operational failure probabilities.
          </p>
        </div>
        <span className="font-mono text-[10px] text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded border border-card-border">
          STEP 2 // RISK JUDGE
        </span>
      </div>

      {isAnalyzing ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
          <div className="text-sm font-mono text-slate-400 uppercase tracking-widest animate-pulse">
            SHAP Engine Recalculating...
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Verdict Score Ring / Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Verdict Badge */}
            <div className="md:col-span-1 flex flex-col items-center justify-center p-4 rounded-lg bg-slate-950/30 border border-card-border/50 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">DEPLOY VERDICT</span>
              <span className={`text-xl font-bold px-3 py-1 rounded-md border font-mono mt-2 tracking-wide ${riskColorClass}`}>
                {risk.toUpperCase()} RISK
              </span>
              <span className="text-xs text-slate-400 mt-2 font-mono">
                {risk === "High" ? "Deployment Blocked" : risk === "Medium" ? "Remediation Required" : "Safe to Deploy"}
              </span>
            </div>

            {/* Score Metrics */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex justify-between items-end font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block">RISK PROBABILITY SCORE</span>
                  <span className="text-4xl font-extrabold text-slate-100 tabular-nums">
                    {score.toFixed(2)}
                  </span>
                  <span className="text-slate-500 text-sm ml-1">/ 1.00</span>
                </div>
                <div className="text-right text-xs text-slate-400">
                  Threshold limit: <span className="font-bold text-risk-medium">0.50</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-card-border/50">
                <div
                  className={`h-full rounded-full transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${scoreBarColor}`}
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* SHAP Explanation Bar Chart */}
          <div className="bg-slate-950/20 p-4 rounded-lg border border-card-border/40">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-300 font-mono">SHAP Feature Attribution (Top Risk Drivers)</span>
              <span className="text-[10px] text-slate-500 font-mono">VALUES SHOW ATTR %</span>
            </div>

            <div className="space-y-4">
              {top_factors.map((factor, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{factor.feature}</span>
                    <span className={`font-semibold ${risk === "High" ? "text-risk-high" : "text-risk-low"}`}>
                      +{factor.contribution_pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-sm overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${risk === "High" ? "bg-risk-high/70" : "bg-risk-low/70"
                        }`}
                      style={{ width: `${factor.contribution_pct * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Pedigree Caption */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-card-border/40 pt-4 text-xs">
            <span className="text-slate-400 font-mono">
              ⚡ <strong className="text-slate-300">LightGBM + SHAP.</strong> Deterministic — no LLM makes this call.
            </span>
            {risk === "High" && (
              <span className="text-risk-high/80 font-mono mt-1 sm:mt-0 font-medium">
                ⚠️ 91% similar to a past deploy that caused a 47-minute outage.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
