"use client";

import React from "react";
import { PRSummary } from "../lib/types";

interface PRCardProps {
  pr: PRSummary;
  onRunCheck?: () => void;
  onTrySecretLeak?: () => void;
  isActive?: boolean;
}

export default function PRCard({ pr, onRunCheck, onTrySecretLeak, isActive = true }: PRCardProps) {
  const isSecretLeak = pr.hasSecretLeak;

  return (
    <div className={`glass-panel rounded-xl p-6 glow-brand border transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-50 scale-95 pointer-events-none"}`}>
      {/* Header Info */}
      <div className="flex items-start justify-between border-b border-card-border pb-4 mb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span>github.com</span>
            <span>/</span>
            <span className="text-slate-300 font-semibold">Kritika11052005</span>
            <span>/</span>
            <span className="text-slate-300 font-semibold">deploygate</span>
            <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] ml-2">Public</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-100 mt-2 flex items-center gap-2">
            <span className="text-slate-400 font-mono text-lg font-normal">{pr.id}</span>
            {pr.title}
          </h2>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-mono text-slate-400">{pr.openedTime}</span>
          <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded text-xs font-mono font-semibold mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open
          </span>
        </div>
      </div>

      {/* Branch & Author Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/30 p-3 rounded-lg border border-card-border/40">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Branch Pipeline</div>
          <div className="flex items-center space-x-2 mt-1.5">
            <span className="font-mono text-xs text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
              {pr.branch}
            </span>
            <span className="text-slate-500 text-xs">into</span>
            <span className="font-mono text-xs text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              main
            </span>
          </div>
        </div>
        <div className="bg-slate-900/30 p-3 rounded-lg border border-card-border/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Author</div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-5 h-5 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-[10px] font-mono text-brand font-bold uppercase">
                {pr.author[0]}
              </div>
              <span className="text-sm font-semibold text-slate-200">{pr.author}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Commit</div>
            <span className="font-mono text-xs text-slate-400 block mt-1">e1f82c4</span>
          </div>
        </div>
      </div>

      {/* Diff Stats */}
      <div className="mb-6">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Pull Request Diff Stats</div>
        <div className="flex items-center space-x-4 bg-slate-950/40 p-3.5 rounded-lg border border-card-border/80 font-mono text-sm">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="font-bold">+{pr.linesAdded}</span>
            <span className="text-slate-600">lines</span>
          </div>
          <div className="flex items-center space-x-1.5 text-risk-high">
            <span className="font-bold">-{pr.linesRemoved}</span>
            <span className="text-slate-600">lines</span>
          </div>
          <div className="text-slate-400">
            <span className="font-bold text-slate-200">{pr.filesChanged}</span> files changed
          </div>
          
          {/* GitHub diff blocks indicator */}
          <div className="hidden sm:flex space-x-0.5 ml-auto">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
            <span className="w-2.5 h-2.5 bg-slate-800 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Secret Leak Snippet (Optional branch) */}
      {isSecretLeak && pr.secretDiffSnippet && (
        <div className="mb-6 animate-pulse">
          <div className="text-xs font-semibold text-risk-high flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-risk-high animate-ping" />
            CRITICAL: Potential Credentials Leak Detected (pre-commit regex scanning)
          </div>
          <pre className="p-4 rounded-lg bg-red-950/10 border border-risk-high/30 font-mono text-xs text-red-300 overflow-x-auto leading-relaxed">
            <code>{pr.secretDiffSnippet}</code>
          </pre>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-card-border/40">
        {!isSecretLeak ? (
          <>
            {onRunCheck && (
              <button
                onClick={onRunCheck}
                className="flex-1 bg-brand hover:bg-brand/90 text-slate-100 font-semibold py-3 px-5 rounded-lg transition-all duration-150 active:scale-[0.98] glow-brand text-sm tracking-wide cursor-pointer text-center"
              >
                Run DeployGate Check
              </button>
            )}
            {onTrySecretLeak && (
              <button
                onClick={onTrySecretLeak}
                className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-slate-200 border border-card-border font-medium py-3 px-5 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm cursor-pointer text-center"
              >
                Try Secret Leak PR
              </button>
            )}
          </>
        ) : (
          <>
            {onRunCheck && (
              <button
                onClick={onRunCheck}
                className="flex-1 bg-risk-high hover:bg-risk-high/90 text-slate-100 font-semibold py-3 px-5 rounded-lg transition-all duration-150 active:scale-[0.98] shadow-[0_0_15px_rgba(229,72,77,0.3)] text-sm tracking-wide cursor-pointer text-center"
              >
                Scan Credentials Leak
              </button>
            )}
            {onTrySecretLeak && (
              <button
                onClick={onTrySecretLeak}
                className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-slate-200 border border-card-border font-medium py-3 px-5 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm cursor-pointer text-center"
              >
                Reset to Standard PR
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
