"use client";

import React, { useEffect, useState } from "react";
import { SentinelResults } from "../lib/types";

interface SentinelPanelProps {
  results: SentinelResults;
  isActive?: boolean;
}

export default function SentinelPanel({ results, isActive = true }: SentinelPanelProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  // Trigger cascade fade-in micro-animations
  useEffect(() => {
    if (isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleCount(0);
      const timer1 = setTimeout(() => setVisibleCount(1), 100);
      const timer2 = setTimeout(() => setVisibleCount(2), 250);
      const timer3 = setTimeout(() => setVisibleCount(3), 400);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setVisibleCount(0);
    }
  }, [isActive, results]);

  const sentinels = [
    { key: "security", data: results.security, label: "Security Sentinel", icon: "🔒" },
    { key: "performance", data: results.performance, label: "Performance Sentinel", icon: "⚡" },
    { key: "metadata", data: results.metadata, label: "Metadata Sentinel", icon: "📁" }
  ];

  const getStatusClasses = (status: "success" | "warning" | "error") => {
    switch (status) {
      case "success":
        return {
          border: "border-risk-low/20 hover:border-risk-low/40",
          text: "text-risk-low",
          bg: "bg-risk-low/5",
          dot: "bg-risk-low",
          badge: "bg-risk-low/10 text-risk-low border-risk-low/20"
        };
      case "warning":
        return {
          border: "border-risk-medium/20 hover:border-risk-medium/40",
          text: "text-risk-medium",
          bg: "bg-risk-medium/5",
          dot: "bg-risk-medium",
          badge: "bg-risk-medium/10 text-risk-medium border-risk-medium/20"
        };
      case "error":
        return {
          border: "border-risk-high/20 hover:border-risk-high/40",
          text: "text-risk-high",
          bg: "bg-risk-high/5",
          dot: "bg-risk-high animate-ping",
          badge: "bg-risk-high/10 text-risk-high border-risk-high/20"
        };
    }
  };

  return (
    <div className={`transition-all duration-300 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            Sentinel Parallel Scanners
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            First layer analysis: security audits, performance regressions, and deployment metadata scanning.
          </p>
        </div>
        <span className="font-mono text-[10px] text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded border border-card-border">
          STEP 1.5 // SENTINELS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sentinels.map((item, idx) => {
          const isVisible = visibleCount > idx;
          const statusClass = getStatusClasses(item.data.status);

          return (
            <div
              key={item.key}
              className={`glass-panel rounded-xl p-5 border transition-all duration-300 ${statusClass.border} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
            >
              {/* Sentinel Header */}
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-2xl">{item.icon}</span>
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusClass.badge}`}
                >
                  {item.data.status}
                </span>
              </div>

              {/* Title & Status message */}
              <h4 className="text-sm font-semibold text-slate-200">{item.label}</h4>
              <div className="flex items-center space-x-2 mt-2">
                <div className="relative w-2 h-2 flex items-center justify-center">
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${statusClass.dot}`} />
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${item.data.status === "error" ? "bg-risk-high" : item.data.status === "warning" ? "bg-risk-medium" : "bg-risk-low"}`} />
                </div>
                <span className={`text-xs font-mono font-semibold ${statusClass.text}`}>{item.data.message}</span>
              </div>

              {/* Detailed findings */}
              {item.data.details && (
                <div className="mt-3.5 pt-3.5 border-t border-card-border/40">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Agent Findings</div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/20 p-2.5 rounded border border-card-border/20">
                    {item.data.details}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
