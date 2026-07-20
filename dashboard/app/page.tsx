"use client";

import React, { useState, useEffect } from "react";
import GateBar from "../components/GateBar";
import PRCard from "../components/PRCard";
import SentinelPanel from "../components/SentinelPanel";
import RiskJudgePanel from "../components/RiskJudgePanel";
import AdvisorPanel from "../components/AdvisorPanel";
import ApprovalPanel from "../components/ApprovalPanel";
import FixerExecutingPanel from "../components/FixerExecutingPanel";
import GateBanner from "../components/GateBanner";
import WatchtowerPreview from "../components/WatchtowerPreview";

import {
  getDemoPR,
  getSecretLeakPR,
  getSentinelResults,
  getRiskAssessment,
  getLowRiskAssessment,
  getAdvisorPlan,
  getTelemetryHistory
} from "../lib/mock-data";

import { RiskAssessment } from "../lib/types";

// Walkthrough Steps (Standard Path):
// 0: Title Screen
// 1: Pull Request Details
// 1.5: Sentinel Parallel Scanners
// 2: Risk Judge Score (High Risk 0.84)
// 2.5: Advisor Agent Runbook RAG Recommendation
// 2.75: Review & Approve Fixes (NEW)
// 2.85: Fixer Agent Executing (NEW)
// 3: Risk Judge Re-scan (Low Risk 0.21)
// 4: Deployed (green success)
// 5: Watchtower Closed-Loop Dashboard
// 6: Closing Summary Recap
//
// Secret Leak Path (unchanged):
// 0 -> 1 -> 1.5 -> 3 (secret_blocked)

export default function Home() {
  const [step, setStep] = useState<number>(0);
  const [branch, setBranch] = useState<"normal" | "secret">("normal");
  const [isFixed, setIsFixed] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0.84);
  const [approvedFixIds, setApprovedFixIds] = useState<string[]>([]);

  // Get data based on current state
  const pr = branch === "normal" ? getDemoPR() : getSecretLeakPR();
  const sentinels = getSentinelResults(branch === "secret");
  const initialRisk = getRiskAssessment();
  const lowRisk = getLowRiskAssessment();
  const advisor = getAdvisorPlan();
  const telemetry = getTelemetryHistory();

  // Handle approval from Step 2.75 — advances to Fixer Executing (2.85)
  const handleApproveAndRun = (ids: string[]) => {
    setApprovedFixIds(ids);
    setStep(2.85);
  };

  // Handle re-run risk gate from Step 2.85 — triggers re-scan animation then shows Step 3
  const handleRerunRiskGate = () => {
    setIsRecalculating(true);
    setStep(3);
    
    // Recalculation delay simulating model runs
    setTimeout(() => {
      setIsRecalculating(false);
      setIsFixed(true);
      
      // Animate score from 0.84 to 0.21
      let current = 0.84;
      const target = 0.21;
      const interval = setInterval(() => {
        if (current > target) {
          current -= 0.05;
          if (current < target) current = target;
          setAnimatedScore(current);
        } else {
          clearInterval(interval);
        }
      }, 50);
    }, 1500);
  };

  const handleRestart = () => {
    setStep(0);
    setBranch("normal");
    setIsFixed(false);
    setIsRecalculating(false);
    setAnimatedScore(0.84);
    setApprovedFixIds([]);
  };

  const toggleBranch = () => {
    handleRestart();
    setBranch((prev) => (prev === "normal" ? "secret" : "normal"));
  };

  // Keyboard navigation controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is typing in forms (not applicable here, but safe practice)
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (e.code === "Space" || e.code === "ArrowRight") {
        e.preventDefault();
        
        // Block advancing during recalculation
        if (step === 3 && isRecalculating) return;
        
        // Final step recap boundary
        if (step < 6) {
          // Secret leak branch: 1.5 goes straight to 3 (secret_blocked)
          if (branch === "secret" && step === 1.5) {
            setStep(3);
          } else if (branch === "normal") {
            // Standard path: 0→1→1.5→2→2.5→2.75→2.85→3→4→5→6
            const nextStep = step === 0 ? 1 : step === 1 ? 1.5 : step === 1.5 ? 2 : step === 2 ? 2.5 : step === 2.5 ? 2.75 : step === 2.75 ? 2.85 : step === 2.85 ? 3 : step === 3 ? 4 : step === 4 ? 5 : 6;
            setStep(nextStep);
          } else {
            // Secret path forward (only 0→1→1.5→3, step 3 is terminal for secret)
            const nextStep = step === 0 ? 1 : step === 1 ? 1.5 : step;
            setStep(nextStep);
          }
        }
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (step > 0 && !(step === 3 && isRecalculating)) {
          // Secret leak bypass reverse
          if (branch === "secret" && step === 3) {
            setStep(1.5);
          } else if (branch === "normal") {
            const prevStep = step === 6 ? 5 : step === 5 ? 4 : step === 4 ? 3 : step === 3 ? 2.85 : step === 2.85 ? 2.75 : step === 2.75 ? 2.5 : step === 2.5 ? 2 : step === 2 ? 1.5 : step === 1.5 ? 1 : 0;
            setStep(prevStep);
          } else {
            const prevStep = step === 1.5 ? 1 : step === 1 ? 0 : step;
            setStep(prevStep);
          }
        }
      } else if (e.code === "KeyR" || e.code === "Escape") {
        handleRestart();
      } else if (e.code === "KeyS") {
        toggleBranch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, branch, isFixed, isRecalculating]);

  // Determine global gate status for GateBar
  const getGateStatus = () => {
    if (step < 2) return "neutral";
    if (step >= 2 && step <= 2.85) return "neutral";
    if (step === 3 && branch === "secret") return "blocked";
    if (step === 3 && isRecalculating) return "neutral";
    if (step === 3 && !isRecalculating) return "neutral"; // re-scan showing low risk
    if (step === 4) return "deployed";
    if (step >= 5) return "deployed";
    return "neutral";
  };

  const activeAssessment: RiskAssessment = isFixed
    ? { ...lowRisk, score: animatedScore }
    : initialRisk;

  return (
    <div className="flex-1 bg-[#14161C] text-[#EDEEF2] flex flex-col font-sans relative min-h-screen">
      {/* 1. Header Gate Bar (Visible for walkthrough steps 1-6) */}
      {step > 0 && <GateBar status={getGateStatus()} />}

      {/* 2. Main Presenter Viewport Container */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 md:px-8 max-w-6xl mx-auto w-full pb-28">
        
        {/* STEP 0: TITLE AND OVERVIEW */}
        {step === 0 && (
          <div className="w-full max-w-3xl glass-panel rounded-2xl p-8 border border-card-border glow-brand space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <span className="inline-block bg-brand/10 border border-brand/35 text-brand px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider">
                SYNERGY 2026 // PS09 HACKATHON
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-brand bg-clip-text text-transparent">
                DeployGate Console
              </h1>
              <p className="text-base text-slate-400 font-medium max-w-xl mx-auto italic">
                &ldquo;A credit score for every deployment — predicts risk, explains it, writes the fix, applies it on command, and watches production to learn.&rdquo;
              </p>
            </div>

            {/* The 5 Layers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4">
              {[
                { step: "1", title: "Sentinels", icon: "🔒", desc: "Security, performance, and metadata scanners" },
                { step: "2", title: "Risk Judge", icon: "🧠", desc: "Deterministic LightGBM risk classifier" },
                { step: "3", title: "Advisor", icon: "🤖", desc: "LLM runbook RAG action mitigation planner" },
                { step: "4", title: "Fixer", icon: "💬", desc: "Automated trigger execution via /fix command" },
                { step: "5", title: "Watchtower", icon: "👁️", desc: "Closed-loop live telemetry audit feedback" }
              ].map((layer) => (
                <div key={layer.step} className="bg-slate-900/40 p-4 rounded-xl border border-card-border/50 text-center hover:border-brand/40 transition-colors">
                  <div className="text-2xl mb-1.5">{layer.icon}</div>
                  <div className="text-xs font-bold text-slate-200">{layer.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono leading-tight">{layer.desc}</div>
                </div>
              ))}
            </div>

            {/* Path Selection */}
            <div className="bg-slate-950/40 p-5 rounded-xl border border-card-border/60 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-200">Select Demo Branch</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono leading-relaxed">
                  Test standard risk mitigation or automated security hard-gates.
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => {
                    setBranch("normal");
                    setStep(1);
                  }}
                  className="flex-1 md:flex-none bg-brand hover:bg-brand/90 text-slate-100 font-semibold py-2.5 px-5 rounded-lg text-sm transition-all cursor-pointer text-center"
                >
                  Standard Path
                </button>
                <button
                  onClick={() => {
                    setBranch("secret");
                    setStep(1);
                  }}
                  className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 border border-card-border py-2.5 px-5 rounded-lg text-sm transition-all cursor-pointer text-center"
                >
                  Secret Leak Path
                </button>
              </div>
            </div>

            <div className="text-center text-[10px] font-mono text-slate-600">
              Concept walkthrough — illustrative data. Presenter keyboard shortcuts enabled.
            </div>
          </div>
        )}

        {/* STEP 1: THE PR */}
        {step === 1 && (
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-mono text-slate-500">STEP 1 // OPEN PULL REQUEST</span>
              <span className="text-xs font-mono text-slate-400">Branch: {branch === "normal" ? "Standard" : "Security Hard-Gate"}</span>
            </div>
            <PRCard
              pr={pr}
              onRunCheck={() => {
                setStep(1.5);
              }}
              onTrySecretLeak={toggleBranch}
            />
          </div>
        )}

        {/* STEP 1.5: THE SENTINELS */}
        {step === 1.5 && (
          <div className="w-full max-w-4xl space-y-6">
            <div className="opacity-45 scale-[0.98] pointer-events-none transition-all duration-300">
              <PRCard pr={pr} isActive={false} />
            </div>
            <SentinelPanel
              results={sentinels}
              isActive={true}
            />
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  if (branch === "secret") {
                    setStep(3);
                  } else {
                    setStep(2);
                  }
                }}
                className="bg-brand hover:bg-brand/90 text-slate-100 font-semibold py-2.5 px-6 rounded-lg text-sm transition-all cursor-pointer"
              >
                {branch === "secret" ? "Proceed to Blocked Verdict" : "Proceed to Risk Judge Classifier"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: RISK JUDGE */}
        {step === 2 && (
          <div className="w-full max-w-4xl space-y-6">
            <div className="opacity-40 scale-[0.97] pointer-events-none transition-all duration-300">
              <SentinelPanel results={sentinels} isActive={false} />
            </div>
            <RiskJudgePanel
              assessment={activeAssessment}
              isActive={true}
            />
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2.5)}
                className="bg-brand hover:bg-brand/90 text-slate-100 font-semibold py-2.5 px-6 rounded-lg text-sm transition-all cursor-pointer"
              >
                Proceed to Advisor Recommendation
              </button>
            </div>
          </div>
        )}

        {/* STEP 2.5: ADVISOR RECOMMENDATION */}
        {step === 2.5 && (
          <div className="w-full max-w-4xl space-y-6">
            <div className="opacity-40 scale-[0.97] pointer-events-none transition-all duration-300">
              <RiskJudgePanel assessment={activeAssessment} isActive={false} />
            </div>
            <AdvisorPanel
              plan={advisor}
              isActive={true}
            />
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2.75)}
                className="bg-brand hover:bg-brand/90 text-slate-100 font-semibold py-2.5 px-6 rounded-lg text-sm transition-all cursor-pointer"
              >
                Proceed to Review &amp; Approve
              </button>
            </div>
          </div>
        )}

        {/* STEP 2.75: REVIEW & APPROVE FIXES (NEW) */}
        {step === 2.75 && (
          <div className="w-full max-w-4xl space-y-6">
            <div className="opacity-40 scale-[0.97] pointer-events-none transition-all duration-300">
              <AdvisorPanel plan={advisor} isActive={false} />
            </div>
            <ApprovalPanel
              plan={advisor}
              onApprove={handleApproveAndRun}
              onSkip={() => setStep(3)}
              isActive={true}
            />
          </div>
        )}

        {/* STEP 2.85: FIXER AGENT EXECUTING (NEW) */}
        {step === 2.85 && (
          <div className="w-full max-w-4xl space-y-6">
            <FixerExecutingPanel
              approvedIds={approvedFixIds.length > 0 ? approvedFixIds : ["adv-2"]}
              onRerunRiskGate={handleRerunRiskGate}
              isActive={true}
            />
          </div>
        )}

        {/* STEP 3: RISK JUDGE RE-SCAN (standard) or BLOCKED VERDICT (secret) */}
        {step === 3 && (
          <div className="w-full max-w-4xl space-y-6">
            {branch === "secret" ? (
              /* Secret leak path: blocked verdict */
              <div className="w-full max-w-3xl mx-auto space-y-6">
                <GateBanner status="secret_blocked" />
                <div className="glass-panel p-6 rounded-xl border border-risk-high/30 text-center space-y-3">
                  <span className="text-2xl">⚠️</span>
                  <h4 className="text-sm font-semibold text-slate-200">Security Gate Remediation Action Required</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Automated fixer commands cannot bypass credential leaks. Strip the credential, squash, and push commit updates to re-run scanners.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={handleRestart}
                      className="bg-slate-850 hover:bg-slate-800 text-slate-300 border border-card-border text-xs px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Restart Demo
                    </button>
                    <button
                      onClick={toggleBranch}
                      className="bg-brand text-slate-100 text-xs px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Toggle to Standard PR
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard path: Risk Judge re-scan with recalculating animation */
              isRecalculating ? (
                <div className="glass-panel rounded-xl p-10 border border-brand/20 flex flex-col items-center justify-center space-y-6">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-40"></span>
                    <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-mono font-bold uppercase tracking-wider text-slate-100">
                      Re-scanning Risk Profile
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Recalculating classifier predictions with applied fixes...
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      Syncing on-call calendar... Updating SHAP feature attribution...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-mono text-slate-500">STEP 3 // RISK JUDGE (RE-SCAN)</span>
                  </div>
                  <RiskJudgePanel assessment={activeAssessment} isActive={true} />
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setStep(4)}
                      className="bg-brand hover:bg-brand/90 text-slate-100 font-semibold py-2.5 px-6 rounded-lg text-sm transition-all cursor-pointer"
                    >
                      Proceed to Deploy
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* STEP 4: DEPLOYED */}
        {step === 4 && (
          <div className="w-full max-w-4xl space-y-6 animate-fade-in">
            <GateBanner
              status="deployed"
              liveUrl="https://payments-retry.deploygate.internal/health"
              onViewDashboard={() => setStep(5)}
              onRestartDemo={handleRestart}
            />
          </div>
        )}

        {/* STEP 5: WATCHTOWER FEEDBACK */}
        {step === 5 && (
          <div className="w-full max-w-4xl space-y-6">
            <WatchtowerPreview telemetry={telemetry} />
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(6)}
                className="bg-brand hover:bg-brand/90 text-slate-100 font-semibold py-2.5 px-6 rounded-lg text-sm transition-all cursor-pointer"
              >
                Proceed to Wrap Up
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: CLOSING SUMMARY RECAP */}
        {step === 6 && (
          <div className="w-full max-w-3xl glass-panel rounded-2xl p-8 border border-card-border glow-brand space-y-8 animate-fade-in text-center">
            <div className="space-y-3">
              <span className="text-4xl">🚀</span>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-slate-100 via-slate-200 to-brand bg-clip-text text-transparent uppercase tracking-wide">
                Walkthrough Complete
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                DeployGate replaces manual approval checklists and risky guesswork with a predictive, explainable, self-correcting safety loop.
              </p>
            </div>

            {/* Recalculating details of layers */}
            <div className="bg-slate-950/30 p-6 rounded-xl border border-card-border/50 text-left space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-brand mb-1">
                The Five Gating Layers Recap:
              </h3>
              
              <div className="space-y-3.5 text-sm">
                {[
                  { layer: "Sentinel Collectors", desc: "Scans diffs in parallel for security flaws, performance bugs, and metadata signals." },
                  { layer: "Risk Judge ML Core", desc: "A deterministic LightGBM classifier with SHAP feature attribution. Safe and explainable." },
                  { layer: "LLM Advisor Planner", desc: "Retrieves context from internal team runbooks to propose safe risk mitigation schedules." },
                  { layer: "Automated Fixer", desc: "Executes adjustments immediately inside CI/CD pipelines via simple developer comment triggers." },
                  { layer: "Watchtower Monitor", desc: "Tracks production health post-deploy, closing the loop by retraining models on real outcomes." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="font-mono text-brand font-bold text-xs pt-0.5">{idx + 1}.</span>
                    <div>
                      <strong className="text-slate-200 font-semibold">{item.layer}:</strong>{" "}
                      <span className="text-slate-400">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitch Footer */}
            <div className="space-y-5 pt-4">
              <p className="text-base font-medium text-slate-300 italic">
                &ldquo;A credit score for every deployment — predicting risk, explaining it, executing the fix.&rdquo;
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="bg-brand hover:bg-brand/90 text-slate-100 font-semibold py-3 px-6 rounded-lg text-sm transition-all cursor-pointer"
                >
                  Restart Walkthrough
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Floating Presenter Control Dashboard Panel */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#181B24]/90 backdrop-blur-md border-t border-card-border/60 py-4 px-6 z-50 flex items-center justify-between select-none">
        
        {/* Left Side Controls (Status Indicator) */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wide text-slate-300 uppercase">PRESENTER CONSOLE</span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="font-mono bg-slate-900 border border-card-border px-1.5 py-0.5 rounded text-[10px]">← / →</span>
            <span>Navigate</span>
            <span className="font-mono bg-slate-900 border border-card-border px-1.5 py-0.5 rounded text-[10px] ml-1">Space</span>
            <span>Advance</span>
            <span className="font-mono bg-slate-900 border border-card-border px-1.5 py-0.5 rounded text-[10px] ml-1">R</span>
            <span>Reset</span>
            <span className="font-mono bg-slate-900 border border-card-border px-1.5 py-0.5 rounded text-[10px] ml-1">S</span>
            <span>Switch Branch</span>
          </div>
        </div>

        {/* Center Progress Dot Indicators */}
        <div className="flex items-center space-x-2 bg-slate-950/40 px-3.5 py-1.5 rounded-full border border-card-border/40">
          {[
            { s: 0, label: "Title" },
            { s: 1, label: "PR" },
            { s: 1.5, label: "Sentinels" },
            { s: 2, label: "Risk Judge" },
            { s: 2.5, label: "Advisor" },
            { s: 2.75, label: "Approval" },
            { s: 2.85, label: "Fixer" },
            { s: 3, label: "Re-scan" },
            { s: 4, label: "Deploy" },
            { s: 5, label: "Watchtower" },
            { s: 6, label: "Summary" }
          ].map((dot) => {
            const isCurrent = step === dot.s;
            const isCompleted = step > dot.s;
            return (
              <button
                key={dot.s}
                onClick={() => {
                  // Allow jumping to any step directly during rehearsals/demos
                  if (isRecalculating) return;
                  setStep(dot.s);
                }}
                title={dot.label}
                className={`relative w-2.5 h-2.5 rounded-full transition-all duration-300 border ${
                  isCurrent
                    ? "bg-brand border-brand scale-125 shadow-[0_0_8px_rgba(124,108,240,0.8)]"
                    : isCompleted
                    ? "bg-risk-low border-risk-low/50"
                    : "bg-slate-800 border-slate-700/50 hover:bg-slate-700"
                }`}
              />
            );
          })}
          <span className="text-[10px] font-mono font-bold text-slate-400 pl-1.5">
            {step % 1 !== 0 ? `Step ${step}` : `Step ${step}`}
          </span>
        </div>

        {/* Right Side Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleBranch}
            className="hidden sm:inline-flex items-center font-mono text-[10px] font-bold bg-slate-900 border border-card-border hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded transition-all cursor-pointer"
          >
            PATH: {branch === "normal" ? "STANDARD" : "SECRET LEAK"}
          </button>
          
          <button
            onClick={handleRestart}
            className="font-mono text-[10px] font-bold bg-slate-900 border border-card-border hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded transition-all cursor-pointer"
          >
            RESTART
          </button>
          
          <div className="flex space-x-1.5">
            <button
              onClick={() => {
                if (step > 0) {
                  if (branch === "secret" && step === 3) {
                    setStep(1.5);
                  } else if (branch === "normal") {
                    const prevStep = step === 6 ? 5 : step === 5 ? 4 : step === 4 ? 3 : step === 3 ? 2.85 : step === 2.85 ? 2.75 : step === 2.75 ? 2.5 : step === 2.5 ? 2 : step === 2 ? 1.5 : step === 1.5 ? 1 : 0;
                    setStep(prevStep);
                  } else {
                    const prevStep = step === 1.5 ? 1 : step === 1 ? 0 : step;
                    setStep(prevStep);
                  }
                }
              }}
              disabled={step === 0}
              className="w-8 h-8 flex items-center justify-center rounded bg-slate-900 border border-card-border hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-300 transition-colors cursor-pointer"
            >
              ←
            </button>
            <button
              onClick={() => {
                if (step === 3 && isRecalculating) return;
                if (step < 6) {
                  if (branch === "secret" && step === 1.5) {
                    setStep(3);
                  } else if (branch === "normal") {
                    const nextStep = step === 0 ? 1 : step === 1 ? 1.5 : step === 1.5 ? 2 : step === 2 ? 2.5 : step === 2.5 ? 2.75 : step === 2.75 ? 2.85 : step === 2.85 ? 3 : step === 3 ? 4 : step === 4 ? 5 : 6;
                    setStep(nextStep);
                  } else {
                    const nextStep = step === 0 ? 1 : step === 1 ? 1.5 : step;
                    setStep(nextStep);
                  }
                }
              }}
              disabled={step === 6 || (step === 3 && isRecalculating)}
              className="w-8 h-8 flex items-center justify-center rounded bg-slate-900 border border-card-border hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-300 transition-colors cursor-pointer"
            >
              →
            </button>
          </div>
        </div>

        {/* Small honest label watermark */}
        <div className="absolute right-6 -top-5 text-[9px] font-mono text-slate-500/70 select-none pointer-events-none uppercase tracking-wider">
          Concept walkthrough — illustrative data.
        </div>
      </footer>
    </div>
  );
}
