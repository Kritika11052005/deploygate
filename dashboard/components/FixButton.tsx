"use client";

import React from "react";

interface FixButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export default function FixButton({ onClick, isActive = true }: FixButtonProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 glass-panel rounded-xl border border-brand/35 glow-brand transition-all duration-300 ${
      isActive ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
    }`}>
      {/* Visual Indicator of Command Line / Terminal input */}
      <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-xl mb-4 animate-pulse">
        💬
      </div>
      
      <h3 className="text-base font-semibold text-slate-100 mb-2">Execute Automated Fixer Agent</h3>
      <p className="text-xs text-slate-400 text-center max-w-sm mb-5">
        Instruct the Fixer Agent to execute the recommended runbook fix, re-schedule the deployment, and re-evaluate the risk.
      </p>

      {/* Main /fix Button */}
      <button
        onClick={onClick}
        className="w-full max-w-md bg-brand hover:bg-brand/90 hover:scale-[1.01] active:scale-[0.99] text-slate-100 font-bold py-3.5 px-6 rounded-lg transition-all cursor-pointer flex items-center justify-between shadow-[0_4px_20px_rgba(124,108,240,0.35)] border border-brand/50"
      >
        <span className="font-mono text-sm tracking-wider">reply /fix</span>
        <span className="text-xs text-slate-200 font-normal">Move deploy window to Tue 10 AM</span>
        <span className="font-mono text-[10px] bg-slate-900/60 text-slate-400 px-2 py-0.5 rounded border border-card-border">
          ⏎ ENTER
        </span>
      </button>
      
      <div className="text-[10px] font-mono text-slate-500 mt-3 uppercase tracking-wider">
        LAYER 4 // AUTOMATED FIXER TRIGGER
      </div>
    </div>
  );
}
