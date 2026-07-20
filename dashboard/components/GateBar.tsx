"use client";

import React from "react";

interface GateBarProps {
  status: "neutral" | "blocked" | "allowed" | "deployed";
}

export default function GateBar({ status }: GateBarProps) {
  // Determine color and angle of the physical gate bar
  let barColorClass = "bg-slate-600 shadow-[0_0_10px_rgba(71,85,105,0.4)]";
  let barAngleClass = "rotate-0"; // Horizontal
  let indicatorColorClass = "bg-slate-500";
  let indicatorLabel = "GATE STANDBY";

  if (status === "blocked") {
    barColorClass = "bg-risk-high shadow-[0_0_20px_rgba(229,72,77,0.6)]";
    barAngleClass = "rotate-3 translate-y-[2px]"; // Slams slightly down
    indicatorColorClass = "bg-risk-high animate-ping";
    indicatorLabel = "GATE CLOSED — DEPLOY BLOCKED";
  } else if (status === "allowed" || status === "deployed") {
    barColorClass = "bg-risk-low shadow-[0_0_20px_rgba(47,177,112,0.6)]";
    barAngleClass = "-rotate-45 -translate-y-12 translate-x-4"; // Swings open
    indicatorColorClass = "bg-risk-low";
    indicatorLabel = status === "deployed" ? "GATE OPEN — DEPLOYED" : "GATE OPEN — ALLOWED";
  } else if (status === "neutral") {
    barColorClass = "bg-brand shadow-[0_0_15px_rgba(124,108,240,0.5)] animate-pulse";
    barAngleClass = "rotate-0";
    indicatorColorClass = "bg-brand animate-pulse";
    indicatorLabel = "SENTINEL SCANNING...";
  }

  return (
    <div className="w-full bg-[#181B24] border-b border-card-border py-3 px-6 flex items-center justify-between relative overflow-hidden select-none">
      {/* Background glow strip */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/10 to-transparent pointer-events-none" />

      {/* Left Station Metadata */}
      <div className="flex items-center space-x-3 z-10">
        <div className="flex space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-risk-high opacity-70" />
          <span className="w-3 h-3 rounded-full bg-risk-medium opacity-70" />
          <span className="w-3 h-3 rounded-full bg-risk-low opacity-70" />
        </div>
        <div className="hidden sm:block text-xs font-mono text-slate-400">
          DEPLOYGATE // <span className="text-slate-200">SYS_V2.0.26</span>
        </div>
      </div>

      {/* Center Gate Visualizer */}
      <div className="flex-1 max-w-xl mx-8 relative flex items-center justify-center h-12 z-10">
        {/* Left post */}
        <div className="w-3 h-8 bg-slate-700 rounded-l border border-slate-500/30 flex flex-col justify-between p-1 z-30 shadow-[inset_0_1px_3px_rgba(255,255,255,0.1)]">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
        </div>

        {/* The Gate arm (Barrier Bar) */}
        <div className="flex-1 relative h-6 flex items-center px-0.5 z-20">
          <div className="absolute left-0 right-0 h-1.5 bg-slate-800/50 rounded-full border border-slate-700/30" />
          <div
            className={`h-2.5 rounded-full w-full transition-all duration-500 ease-out origin-left flex items-center overflow-hidden ${barColorClass} ${barAngleClass}`}
          >
            {/* Warning stripes on the gate arm */}
            <div className="w-full h-full bg-[linear-gradient(45deg,rgba(0,0,0,0.15)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-70" />
          </div>
        </div>

        {/* Right post */}
        <div className="w-3 h-8 bg-slate-700 rounded-r border border-slate-500/30 flex flex-col justify-between p-1 z-30 shadow-[inset_0_1px_3px_rgba(255,255,255,0.1)]">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
        </div>
      </div>

      {/* Right Gate Status LED Indicator */}
      <div className="flex items-center space-x-3 z-10">
        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">GATE STATE</div>
          <div className="text-xs font-bold font-mono text-slate-300 mt-0.5 tracking-wider">{indicatorLabel}</div>
        </div>
        <div className="relative w-3 h-3 flex items-center justify-center">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${indicatorColorClass}`} />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              status === "blocked"
                ? "bg-risk-high"
                : status === "allowed" || status === "deployed"
                ? "bg-risk-low"
                : status === "neutral"
                ? "bg-brand"
                : "bg-slate-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
