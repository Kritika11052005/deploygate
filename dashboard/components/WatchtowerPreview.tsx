"use client";

import React from "react";
import { TelemetryHistory } from "../lib/types";

interface WatchtowerPreviewProps {
  telemetry: TelemetryHistory;
  isActive?: boolean;
}

export default function WatchtowerPreview({ telemetry, isActive = true }: WatchtowerPreviewProps) {
  const { metricName, deploys, chartData } = telemetry;

  // Render SVG dimensions
  const width = 500;
  const height = 150;
  const padding = 20;

  // Find min and max for scaling
  const values = chartData.map((d) => d.value);
  const minVal = Math.min(...values) * 0.8;
  const maxVal = Math.max(...values) * 1.2;
  const valRange = maxVal - minVal;

  // Convert data points to SVG coordinate strings
  const points = chartData
    .map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / (chartData.length - 1);
      const y = height - padding - ((d.value - minVal) / valRange) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  // Deploy marker coordinate (deploy occurs at index 2, 10:00 AM)
  const deployMarkerIdx = 2;
  const markerX = padding + (deployMarkerIdx * (width - padding * 2)) / (chartData.length - 1);
  const markerYTop = padding - 5;
  const markerYBottom = height - padding;

  return (
    <div className={`glass-panel rounded-xl p-6 transition-all duration-300 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-card-border/60 pb-3 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>👁️</span> Watchtower Telemetry Dashboard
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Layer 5: Continuous monitoring watches production metrics post-release to refine Risk Judge classification weights.
          </p>
        </div>
        <span className="font-mono text-[10px] text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded border border-card-border">
          STEP 3 // WATCHTOWER
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Telemetry Chart */}
        <div className="lg:col-span-6 bg-slate-950/30 p-4 rounded-lg border border-card-border/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-slate-300 font-mono">{metricName}</span>
              <span className="text-[10px] text-slate-500 font-mono">10:00 AM DEPLOY EVENT</span>
            </div>
            
            {/* SVG Line Chart */}
            <div className="w-full relative h-[150px]">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                  {/* Chart gradient */}
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C6CF0" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7C6CF0" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" />

                {/* Vertical Deploy Marker */}
                <line
                  x1={markerX}
                  y1={markerYTop}
                  x2={markerX}
                  y2={markerYBottom}
                  stroke="#F5A623"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />
                
                {/* Marker Text Banner */}
                <text
                  x={markerX + 6}
                  y={markerYTop + 14}
                  fill="#F5A623"
                  fontSize="9"
                  fontFamily="var(--font-geist-mono)"
                  fontWeight="bold"
                >
                  DEPLOYMENT #402 ACTIVE
                </text>

                {/* Area Gradient under curve */}
                <polygon
                  points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
                  fill="url(#chartGlow)"
                />

                {/* Main Curve Line */}
                <polyline
                  fill="none"
                  stroke="#7C6CF0"
                  strokeWidth="2.5"
                  points={points}
                />

                {/* Data point dot markers */}
                {chartData.map((d, i) => {
                  const x = padding + (i * (width - padding * 2)) / (chartData.length - 1);
                  const y = height - padding - ((d.value - minVal) / valRange) * (height - padding * 2);
                  const isDeployPoint = i === deployMarkerIdx;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={isDeployPoint ? 4.5 : 2.5}
                      fill={isDeployPoint ? "#F5A623" : "#7C6CF0"}
                      stroke={isDeployPoint ? "#14161C" : "rgba(255,255,255,0.3)"}
                      strokeWidth={isDeployPoint ? 1.5 : 0.5}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Chart Labels */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-card-border/30 mt-2">
            <span>{chartData[0].timestamp}</span>
            <span>{chartData[Math.floor(chartData.length / 2)].timestamp}</span>
            <span>{chartData[chartData.length - 1].timestamp}</span>
          </div>
        </div>

        {/* Right: Watchtower Table */}
        <div className="lg:col-span-6 bg-slate-950/30 p-4 rounded-lg border border-card-border/50 overflow-x-auto">
          <div className="text-xs font-semibold text-slate-300 font-mono mb-3">Watchtower Deployments History</div>
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-card-border text-slate-500 text-[10px]">
                <th className="pb-2 font-normal">DEPLOYMENT</th>
                <th className="pb-2 font-normal text-center">SCORE</th>
                <th className="pb-2 font-normal text-center">OUTCOME</th>
                <th className="pb-2 font-normal text-right">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/30">
              {deploys.map((dep) => {
                let outcomeBadge = "";
                if (dep.outcome === "Success") {
                  outcomeBadge = "text-risk-low bg-risk-low/10 border-risk-low/25";
                } else if (dep.outcome === "Warning") {
                  outcomeBadge = "text-risk-medium bg-risk-medium/10 border-risk-medium/25";
                } else {
                  outcomeBadge = "text-risk-high bg-risk-high/10 border-risk-high/25 animate-pulse";
                }

                return (
                  <tr key={dep.id} className="hover:bg-slate-900/20">
                    <td className="py-2.5 max-w-[150px] truncate text-slate-200" title={dep.title}>
                      {dep.title}
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-300">
                      {dep.score.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${outcomeBadge}`}>
                        {dep.outcome === "Success" ? "✅ OK" : dep.outcome === "Warning" ? "⚠️ WARN" : "🔁 ROLLBACK"}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      {dep.timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Caption */}
      <div className="border-t border-card-border/40 pt-4 mt-6 text-xs font-mono text-slate-400">
        📊 Every outcome becomes a new training row — the loop closes.
      </div>
    </div>
  );
}
