"use client";

import React from "react";

interface GateBannerProps {
  status: "blocked" | "secret_blocked" | "allowed" | "deployed";
  liveUrl?: string;
  onViewDashboard?: () => void;
  onRestartDemo?: () => void;
}

export default function GateBanner({ status, liveUrl, onViewDashboard, onRestartDemo }: GateBannerProps) {
  let containerClass = "";
  let title = "";
  let description = "";

  if (status === "blocked") {
    containerClass = "bg-risk-high/10 border-risk-high/30 text-risk-high glow-high";
    title = "🚫 Deploy Blocked";
    description =
      "Critical payments path lacks active on-call coverage during a high-risk Friday evening deployment window. Deployments are restricted until risk is remediated.";
  } else if (status === "secret_blocked") {
    containerClass = "bg-risk-high/10 border-risk-high/30 text-risk-high glow-high";
    title = "🔒 Secret Detected — Blocked";
    description =
      "No classifier gets a vote on a leaked credential. Pre-commit scanner flagged plain-text AWS access key patterns. This deploy was aborted before any model evaluation.";
  } else if (status === "allowed") {
    containerClass = "bg-risk-low/10 border-risk-low/30 text-risk-low glow-low";
    title = "✅ Deploy Allowed";
    description =
      "Risk profile lowered to 0.21. All gate constraints satisfied. Pipeline has unlocked deployment access.";
  } else if (status === "deployed") {
    containerClass = "bg-risk-low/10 border-risk-low/30 text-risk-low glow-low";
    title = "🚀 Deployed";
    description =
      "Continuous deployment finished successfully. Production traffic is now routed to the updated webhook stack.";
  }

  return (
    <div className={`glass-panel rounded-xl p-8 border transition-all duration-300 ${containerClass}`}>
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Large Type Verdict Header */}
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-sans uppercase">
          {title}
        </h2>
        
        {/* Plain Language Explanation */}
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>

        {/* Dynamic features based on state */}
        {status === "deployed" && liveUrl && (
          <div className="pt-2 animate-bounce">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 font-mono text-xs bg-slate-900 border border-risk-low/30 text-risk-low px-4 py-2 rounded-full hover:bg-slate-950 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-risk-low animate-ping" />
              <span>LIVE: {liveUrl}</span>
            </a>
          </div>
        )}

        {/* Pipelines Visual */}
        <div className="w-full max-w-md bg-slate-950/40 border border-card-border/50 rounded-lg p-4 mt-6">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">CI/CD Gate Pipeline Status</div>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-risk-low" />
              <span className="text-xs font-mono text-slate-300">risk-gate</span>
            </div>
            
            {/* Arrow connection */}
            <div className="flex-1 h-0.5 relative bg-slate-700">
              {status === "allowed" || status === "deployed" ? (
                <div className="absolute inset-0 bg-risk-low animate-pulse" />
              ) : (
                <div className="absolute inset-0 bg-risk-high" />
              )}
            </div>

            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded border ${
              status === "allowed" || status === "deployed" 
                ? "bg-slate-900/60 border-slate-700/50" 
                : "bg-slate-950 text-slate-600 border-slate-800"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                status === "deployed" 
                  ? "bg-risk-low animate-pulse" 
                  : status === "allowed" 
                  ? "bg-risk-low/50" 
                  : "bg-slate-700"
              }`} />
              <span className="text-xs font-mono">deploy</span>
            </div>
          </div>
        </div>

        {/* Post-Deployment Navigation Actions */}
        {status === "deployed" && (onViewDashboard || onRestartDemo) && (
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-card-border/40 w-full justify-center">
            {onViewDashboard && (
              <button
                onClick={onViewDashboard}
                className="bg-brand hover:bg-brand/90 text-slate-100 font-semibold py-2.5 px-6 rounded-lg transition-all duration-150 active:scale-[0.98] glow-brand text-sm cursor-pointer"
              >
                Proceed to Watchtower Dashboard
              </button>
            )}
            {onRestartDemo && (
              <button
                onClick={onRestartDemo}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-card-border py-2.5 px-6 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm cursor-pointer"
              >
                Restart Demo Walkthrough
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
