# DeployGate: AI Deployment Risk Gate
## Complete Project Documentation

**Created:** July 17, 2026  
**Team:** 4 Engineers  
**Track:** Problem Statement PS09 (Deployment Risk Scorer)  
**Competition:** Synergy 2026

---

## 🎯 Executive Summary

**One-line pitch:**  
*"A credit score for every deployment — it predicts the risk, explains it, writes the fix, applies it on your command, and watches production to learn from every deploy."*

DeployGate replaces deployment intuition with a trained ML classifier that scores every deployment **Low / Medium / High** before it proceeds, with SHAP explanations of why. Unlike reactive AI-SRE tools (Resolve.ai, Traversal, Cleric) that investigate incidents *after* production breaks, DeployGate sits one step earlier: **before the deploy button**. The system consists of five specialized agent layers around a deterministic ML core, creating a graduated-autonomy platform that learns from every deployment outcome.

---

## 🔍 1. The Problem We're Solving

### The Core Issue
Engineering teams deploy code constantly, but the decision *"is this deploy safe?"* is made on **gut feeling** — a senior engineer's intuition about Friday-evening deploys and big diffs. The status quo relies on human pattern recognition that:
- Doesn't scale across growing teams
- Creates single-point-of-failure dependencies on experienced engineers
- Produces inconsistent decision-making across services
- Cannot capture the full feature/context/history space

### Market Context
The hottest infrastructure category right now is **"AI SRE"**:
- **Resolve.ai**: $250M at $1B valuation (Dec 2025) — post-incident investigation
- **Traversal**: $48M from Sequoia & Kleiner Perkins — post-deployment monitoring
- **Cleric**: Gartner Cool Vendor 2025 — incident analysis and learning

**Our differentiator**: Every one of these companies is **reactive** — they investigate incidents after production breaks. We sit one step earlier: **before the deploy button**. They built the ambulance; we're building the guardrail.

This maps directly to HPE's own product thesis: **GreenLake AIOps / InfoSight** = *"predict infrastructure problems before they happen."*

---

## 🏗️ 2. System Architecture: Five Specialized Layers

### The Layer Stack
Think of the system as five specialized agents around one **deterministic ML core**:

```
SENTINEL AGENTS (parallel signal collectors)
  Security Sentinel (gitleaks)
  Performance Sentinel (static checks + preview deploys)
  Metadata Sentinel (deploy context)
           ↓
  RISK JUDGE (LightGBM + SHAP)  ← deliberately NOT an LLM
           ↓
  ADVISOR AGENT (LLM + RAG over curated runbooks)
           ↓
  FIXER AGENT (agentic remediation on /fix command)
           ↓
  WATCHTOWER AGENT (post-deploy telemetry monitor)
           ↓
Outcome logged → new training row → model retrains
```

### Layer 1: Sentinel Agents (Signal Collection)

Three collectors run **in parallel** on every PR. Each produces **features, not verdicts** — everything feeds the single risk engine. This is what makes us a "multi-signal risk platform" instead of five bolted-on tools.

#### **Security Sentinel (gitleaks)**
- **What it does**: Scans the diff for leaked secrets — API keys, tokens, credentials
- **Features extracted**: `secrets_detected_count`, `env_file_touched`, `workflow_permissions_changed`
- **Market validation**:
  - GitGuardian's 2025 report: 12M+ new secrets in public GitHub commits in one year
  - Wiz: 61% of organizations have secrets exposed in public repos
  - Secret leaks are the #1 cause of CI/CD pipeline compromise
- **Design rule**: A verified live secret **BYPASSES the ML model** — instant hard block. No classifier gets to vote on a leaked AWS key. (This shows judges that knowing when NOT to use ML is a senior-engineer signal.)

#### **Performance Sentinel (Static Analysis + Measurement)**
- **Static heuristics**: DB queries inside loops (N+1 pattern), missing pagination on list endpoints, missing timeouts on external HTTP calls, dependency count spikes, Docker image size jumps
- **Features extracted**: `n_plus_one_detected`, `missing_timeouts_count`, `dep_delta`, image size changes, etc.
- **Round 1 scope**: Static analysis from code inspection
- **Finals upgrade — Preview Deploy Load Test**: On every PR, deploy the branch to an ephemeral preview environment (Render/Railway), run a load script against it for 30–60s, and **measure actual p95 latency, error rate, and payload sizes vs. main**. These become model features:
  - Real numbers pre-merge, before production ever sees the code
  - Stronger and more honest than static "latency prediction"
  - Feeds a latency-delta regressor trained on real measured data

#### **Metadata Sentinel (PS09 Core Features)**
- **Time of day** / day of week of deploy
- **Diff size** (lines changed, files touched)
- **Service criticality** of files touched
- **Recent incident count** on this service
- **On-call coverage** at deploy time
- **Author's historical deploy success rate**

---

### Layer 2: Risk Judge — The ML Core (PS09's Actual Requirement)

**The heart of the system — deterministic, fully explainable, no LLM anywhere.**

#### **Classification Engine**
- **Model**: LightGBM classifier → Low / Medium / High + probability score
- **Why LightGBM**: Fast, tabular-native, SHAP-native, fully interpretable

#### **Explainability (SHAP)**
- Top contributing factors with percentages
- Example: *"High Risk — 40% deploy size, 30% recent incidents, 20% low on-call coverage"*
- Every factor is a feature; every feature is traceable to a sentinel

#### **Counterfactuals (DiCE Library) — The Edge**
Not just *why* risky, but *what changes it*:
- *"Drops to Medium if deployed Tuesday 10 AM"*
- *"Drops to Low if split into two PRs"*
- Users see actionable interventions, not just blame

#### **Precedent Retrieval (KNN) — Traversal's Flagship Feature, Replicated**
- Nearest-neighbor lookup over deployment history
- Example: *"This deploy is 91% similar to deploy #482, which caused a 47-min outage."*
- Provides institutional memory and de-risks novel combinations

#### **Training Data: Synthetic + Self-Improving**
**Round 1**: Synthetic deployment dataset with **documented label-generation rules**:
- Large diffs fail more often
- Friday-evening deploys fail more often
- Low on-call coverage compounds risk
- Leaked secrets = auto-high risk
- All rules written into the README

**Why judges trust this**: When they ask *"How do you know your labels mean anything?"* we point to:
1. Documented heuristics in README (transparent methodology)
2. Layer 5 (Watchtower) feedback loop: real outcomes replace synthetic data over time
3. Architecture is dataset-agnostic — a real org plugs in its deployment history

---

### Layer 3: Advisor Agent (Generative AI + RAG)

**Takes structured input, produces concrete remediation plans grounded in curated knowledge.**

#### **Inputs**
- SHAP factors + counterfactual deltas
- Diff summary + precedent match + fired sentinel signals
- All deterministic outputs from Layers 1–2

#### **Knowledge Base**
10–15 self-written markdown runbook docs:
- Secret rotation procedure
- Git-history purge with git-filter-repo
- Deploy-window best practices
- Rollback patterns
- N+1 query fixes
- PR-splitting guidelines
- etc.

Retrieved via embeddings (ChromaDB or plain cosine similarity) — **keep it tiny and grounded**.

#### **Output**
Concrete remediation plan as a PR comment, each item tagged with counterfactual delta:

```markdown
1. Rotate the leaked key and purge git history (runbook §2)
   → Required, hard block until done

2. Split this 1,400-line PR at the payments/ service boundary
   → Drops risk to Medium

3. Move deploy window to Tue 10 AM
   → Drops risk to Low

4. No rollback step detected — add one
   → Best practice recommendation
```

#### **Critical Design Rule**
The LLM **never invents the risk assessment**. It only translates the ML output into actions, grounded in our runbooks. It can't freelance. This is our defense against *"LLMs hallucinate."*

#### **Implementation Strategy**
- **Round 1**: Plain function-calling loop (~100 lines FastAPI) with Claude/GPT API and structured JSON output — fastest to ship and debug
- **Finals**: Migrate orchestration to CrewAI (agents wrap the working system, framework never replaces building one)

---

### Layer 4: Fixer Agent (Agentic AI, Graduated Autonomy)

**Developer replies `/fix` on the PR → agent executes from a fixed menu of safe, scoped tools.**

#### **Execution Model**
- Tools are **deterministic Python functions**, not arbitrary code/shell
- All tool calls go through GitHub API — no direct infrastructure access
- Commits land on the branch, never pushed to main
- After executing, the gate **re-runs automatically** → new comment shows risk dropping

#### **Tool Menu (Round 1: one; Finals: four)**

| Tool | Action | Round 1? | Finals? |
|------|--------|----------|---------|
| **Workflow Updater** | Add rollback/canary step to workflow YAML | ✅ | ✅ |
| **Schedule Optimizer** | Reschedule deployment window | ❌ | ✅ |
| **PR Splitter** | Open draft PR splitting diff at file boundaries | ❌ | ✅ |
| **On-Call Notifier** | Notify on-call via webhook | ❌ | ✅ |

#### **Demo Moment (The Money Shot)**
1. `/fix` → agent commits the workflow change
2. Gate re-runs automatically
3. New comment: **🟢 Low Risk (0.21)** ← because of what the agent did
4. Deploy job runs
5. Live URL opens

#### **Autonomy Roadmap**
This is the **graduated autonomy** axis the AI SRE market competes on:
- **Current**: `/fix` approval-to-act (agent waits for human command)
- **Finals** (new config flag):
  - **Low risk**: Full-auto fix application (no human needed)
  - **Medium/High**: Always require human `/fix` approval
- **Why it's safe**: Fixed deterministic tool menu. LLM only picks which tool + arguments from a bounded set.

---

### Layer 5: Watchtower Agent (Production Telemetry + Feedback Loop)

**Note: Finals-only feature; Round 1 shows prototype.**

#### **Architecture**
Demo app hosted on Render/Railway free tier with ~30 lines of middleware recording:
- Per-request **latency**
- Per-request **status codes**
- Exposed at `/metrics` endpoint
- Traffic simulated by a small load script

**Framing**: *"Simulated traffic, real telemetry"* — standard, respectable demo methodology.

#### **Post-Deploy Monitoring Flow**
After an allowed deploy, Watchtower polls metrics for ~60–90s vs. pre-deploy baseline:

```
Healthy               → Deployment logged as SUCCESS
                        ✅ Confidence gained

Degraded (p95↑, 404s) → Alert comment with telemetry chart
                        ⚠️ Monitor continues

Failing badly (error  → AUTOMATIC ROLLBACK
rate >5%)               → Revert-push or host rollback API
                        → Outcome logged as FAILURE
                        ❌ Incident learned
```

#### **The Loop Closes: Self-Improving System**
Every outcome becomes a new **labeled training row**:
- Deployment data + features + risk score + SHAP factors + *actual outcome*
- Retraining fires automatically after every N logged outcomes
- Human-approval toggle in config — judges see both modes live

**Why this is game-changing**: The synthetic-data question is answered permanently:
- *The system generates its own ground truth.*
- Same self-learning thesis Cleric just raised capital on
- Real outcomes replace synthetic labels over time

---

## 🎬 3. The Two Demos

### **Demo A: The /fix Loop** (Round 1 + Finals)

A complete remediation workflow in ~5 minutes:

1. **Open a risky PR**
   - Big diff (1,400 lines)
   - Friday-evening metadata
   - Low on-call coverage

2. **Gate comment appears automatically**
   ```
   🔴 High Risk (0.84)
   
   Top Risk Factors:
   • 40% — Deploy size (lines changed)
   • 30% — Recent incidents on payments service
   • 20% — Low on-call coverage
   
   Remediation Plan:
   1. Split PR at service boundary → Low (0.21)
   2. Move deploy window to Tue 10 AM → Low (0.15)
   3. Add rollback step to workflow
   ```

3. **Deploy job is visibly BLOCKED** in the Actions tab
   - Shows GitHub Actions UI with ❌ on deploy job
   - Shows risk-gate job with ✅ but needs: not met

4. **Developer replies `/fix`**
   - Agent commits workflow change (adds rollback step)
   - Gate re-runs automatically

5. **New comment appears**
   ```
   🟢 Low Risk (0.21)
   → Deploy job now ALLOWED
   ```

6. **Deploy runs, app goes live**
   - Open the live URL
   - Show real app responding at deploy URL

7. **Bonus demo moment**
   - Commit a fake API key (in a new commit on the same branch)
   - Gate runs immediately
   - Instant hard block: *"Secrets detected — gitleaks policy"*
   - No ML involved — deterministic sentinel took action

### **Demo B: The Rollback Finale** (Finals Only)

Automatic self-healing in real time:

1. **Deploy a deliberately broken change**
   - Endpoint starts throwing 500 errors
   - Gate says Medium Risk (risky but not obvious)
   - Gate allows it (within tolerance)

2. **Deploy runs, app goes live**

3. **Watchtower's error-rate chart spikes on screen**
   - p99 latency doubles
   - Error rate: 34% vs. baseline 0.2%

4. **Automatic rollback fires**
   - Revert-push or host rollback API
   - App recovers in real time
   - Status codes return to 200

5. **PR comment updates automatically**
   ```
   ⚠️ Deployment #47 ROLLED BACK
   
   Error rate: 34% vs baseline 0.2%
   p99 latency: 2100ms vs baseline 340ms
   
   Outcome: FAILURE
   Model retrained with this data.
   ```

6. **The impact**: An automatic rollback happening live on HPE engineers' screens beats every slide in the deck.

#### **Backup Strategy**
Both demos get **cached golden-path responses** for network fallbacks:
- Live LLM calls and free-tier hosts are the #1 demo failure causes
- Backup screen recordings saved in two places
- If live fails, play recording seamlessly

---

## 📅 4. Round 1 Prototype (July 17–20, 2026)

**Evaluation**: Department judges (not HPE) on **Innovation (25) + Feasibility (20) = 45/100**  
**Key rule**: Simplified/canned versions are fine at Round 1 (that's what prototypes are) as long as slides label them *"prototype — full integration by finals."* On July 31 in front of HPE, everything shown must be real.

### **Tier 1: Working End-to-End (The Spine)**
By July 20 night, this must work on a real PR:

```
Metadata Sentinel features
        ↓
    LightGBM + SHAP
        ↓
  PR comment with score + top-3 factors
        ↓
  Blocked/allowed deploy via GitHub Actions
```

**Stretch goal**: Add gitleaks hard-block (one workflow step, huge demo value).

### **Tier 2: Prototype Versions (Honest Labels)**
Shown at Round 1 as simplified but real-looking:

| Component | Round 1 Form | Implementation | Notes |
|-----------|-------------|-----------------|-------|
| **Advisor** | Real LLM-generated remediation plan | Pre-generated from demo PR's SHAP output, posted by bot | Real output — just not wired end-to-end yet |
| **/fix** | Scripted walkthrough | Live fix commit + re-score, or video | Shows the re-score moment (High → Low) |
| **Watchtower** | Real latency/error chart | Load script against app locally, chart shown in dashboard | Real measurement, labeled "prototype dashboard preview" |
| **Dashboard** | Static mockup or Jupyter notebook | Could use Streamlit prototype | Dashboard structure visible |

These make the prototype look 2–3 weeks further along than mockup slides would, with almost zero extra build cost.

### **8-Slide Structure (Mapped to Rubric)**

1. **Problem** (15 pts)
   - Deploys gated by intuition today
   - One strong cost-of-failure stat
   - Market gap intro

2. **Solution + Innovation** (25 pts)
   - One-liner pitch
   - Five-layer architecture diagram
   - Explicit contrast: basic PS09 solution vs. ours
   - Our edge: counterfactuals, precedents, RAG advisor, graduated autonomy, telemetry loop
   - Position vs. reactive AI-SRE market

3. **Technical Feasibility** (20 pts)
   - Exact tech stack with justifications
   - Risk-mitigation table:
     * LLM only translates ML output (not risk scorer)
     * Agent restricted to predefined tool menu
     * Demo fallbacks cached
   - No magic, all solved problems

4. **Architecture Deep Dive** (part of above)
   - Five-layer diagram with data flow
   - Each layer's responsibility

5. **Initial Progress** (15 pts)
   - Live thin-slice demo or recording
   - GitHub repo link (public if possible)
   - Commit-graph screenshot showing 4-person contribution
   - Risk comment screenshot from real PR run

6. **Execution Plan + Team** (10 pts)
   - July 20→30 timeline with per-person ownership
   - Finals features prioritized
   - Escalation plan

---

## 👥 5. Team Assignment: Four People, Three Days (July 17–19)

### **Critical Path Dependency Map**

```
Jul 17            Jul 18                  Jul 19

┌ SYNC-0 (30 min, all four) ── freezes contracts ──┐

Sarthak: S1 dataset ──▶ S2 model+SHAP ───▶ S3 handoff ┐

                          │                        ▼

Chaitanya: C1 gate ──▶ C2 /score+bot ───▶ C3 INTEGRATION ─▶ REHEARSAL

           │                │                        ▲      ▲

           └──▶ A3 gitleaks (Jul 19) ──────────────┘      │

Aditya:   A1 runbooks ─▶ A2 advisor output ─▶ A4 wire-in ─┘      │

Kritika:  K1 app+telemetry ─▶ K2 chart+mockup ─▶ K3 dashboard+recording
```

**Critical path**: S1 → S2 → C3 → rehearsal. If the dataset or model slips a day, integration day dies.

### **Detailed Per-Person Sequences**

#### **Chaitanya — Gate + Integration (Owns the Spine)**

**C1 (Jul 17): Demo Repo + Two-Job Workflow**
- Repository created with clear README structure
- Two-job GitHub Actions workflow:
  - `risk-gate` job: runs risk scoring
  - `deploy` job: `needs: risk-gate` — only runs if gate passes
- Hardcoded risk score of "High" visibly blocks deploy job
- Hardcoded score of "Low" lets deploy run
- **Done**: Screenshot of both blocked and allowed states
- Placeholder app is fine — Kritika's real app swaps in when K1 lands

**C2 (Jul 18): /score Endpoint + PR-Comment Bot**
- FastAPI `/score` endpoint accepts feature dict, returns contract-format JSON:
  ```json
  {
    "risk": "High|Medium|Low",
    "score": 0.84,
    "top_factors": [
      {"feature": "lines_changed", "contribution_pct": 40},
      {"feature": "incidents_last_30d", "contribution_pct": 30},
      {"feature": "oncall_coverage", "contribution_pct": 20}
    ]
  }
  ```
- Bot posts formatted comment on PR automatically
- Placeholder logic for now (real model swaps in C3)
- **Done**: Comment appears automatically on a fresh PR

**C3 (Jul 19): Full Integration + End-to-End Test**
- Sarthak's real model behind `/score`
- Aditya's canned advisor text in comment's advisor slot
- One full run on the crafted demo PR:
  - Open PR → High Risk comment → blocked
  - Create low-risk PR → allowed → app deploys
- **Done**: The exact Round-1 demo flow works twice in a row
- Supports C3 integration debugging if Sarthak needs it

#### **Sarthak — Dataset + Model + SHAP (Critical Path, No Side Quests)**

**S1 (Jul 17): Synthetic Dataset + Label Rules**
- Generator script producing ~5–10k rows
- Rows contain exactly the frozen feature schema (from SYNC-0):
  ```python
  {
    "deploy_hour": 22,
    "day_of_week": 4,  # Friday
    "lines_changed": 1400,
    "files_touched": 18,
    "service_criticality": "high",
    "incidents_last_30d": 3,
    "oncall_coverage": 0.6,
    "author_success_rate": 0.88
  }
  ```
- Label rules documented in README as code comments:
  - `lines_changed > 800` → +20% risk
  - `deploy_hour > 20` (evening) → +25% risk
  - `oncall_coverage < 0.75` → +30% risk
  - leaked secret detected → auto-high
  - etc.
- **Done**: CSV + README section committed from Sarthak's GitHub account

**S2 (Jul 18): LightGBM Training + SHAP Extraction**
- Train LightGBM classifier on the synthetic dataset
- Achieve reasonable class balance (maybe oversample High/Medium)
- Extract SHAP top-3 factors for each prediction
- Implement `score_deployment(features_dict) → contract_json` function
- Function is importable and callable from C2
- **Done**: Chaitanya can import and call it blind (zero coordination needed)
- Send real sample output to Aditya immediately (upgrades A2 from contract-based to real)

**S3 (Jul 19): Model Handoff + Integration Debugging**
- Pair with Chaitanya for integration
- Own any model-side bugs (incorrect feature types, NaN handling, etc.)
- **Done**: C3's demo flow passes

#### **Aditya — Advisor + Gitleaks (GenAI Layer)**

**A1 (Jul 17): Runbook Markdown Docs (Fully Independent)**
- 5–6 short runbook docs in repo `/runbooks`:
  - `secret-rotation.md`
  - `git-history-purge.md`
  - `deploy-window-policy.md`
  - `rollback-pattern.md`
  - `n-plus-one-fix.md`
  - `pr-splitting-guide.md`
- Each is 2–3 minutes to read, concrete steps
- These become the RAG knowledge base
- **Done**: Markdown files committed, README references them
- **Fully independent**: Start immediately after SYNC-0

**A2 (Jul 18): Advisor Prompt + Canned Output**
- Write advisor prompt (SHAP factors + runbook excerpts → remediation plan)
- Generate the REAL canned output using:
  - Contract-format feature input (from SYNC-0)
  - Real SHAP sample output from S2 (when it lands)
- Output format: structured markdown with counterfactual deltas
- **Done**: Final advisor text file, labeled *"prototype — live integration by finals"* on the slide

**A3 (Jul 19): Gitleaks Integration**
- Add gitleaks step to the risk-gate GitHub Actions job
- Test commit with a fake API key
- Verify that the key triggers instant hard block BEFORE the model runs
- **Done**: The fake-key demo moment works
- **Depends only on**: C1, so can start any time Jul 19 morning

**A4 (Jul 19): Wire Advisor into Bot Comment**
- Canned advisor text delivered to Chaitanya in a new comment format
- Chaitanya's bot inserts it into the PR comment's advisor section
- **Done**: It renders inside the bot comment on the demo PR

#### **Kritika — Demo App + Telemetry + Dashboard**

**K1 (Jul 17): Demo App + Telemetry Middleware (Fully Independent)**
- Small FastAPI demo app: 2–3 endpoints (GET /health, GET /users, POST /users)
- ~30-line telemetry middleware:
  ```python
  @app.middleware("http")
  async def log_metrics(request, call_next):
      start = time.time()
      response = await call_next(request)
      duration = time.time() - start
      metrics.record(path=request.url.path, status=response.status_code, latency=duration)
      return response
  ```
- `/metrics` endpoint returning Prometheus-format metrics
- Deployed on Render or Railway (free tier, real URL)
- **Done**: Live URL + `/metrics` endpoint returning real numbers
- **Fully independent track**: No other dependencies

**K2 (Jul 18): Load Script + Telemetry Chart**
- Load script generating traffic:
  - ~10 requests/sec for 30s against K1's app
  - Mix of GET /health, GET /users, POST /users
- Real latency/error chart from measured data:
  - p50, p95, p99 latencies
  - Error rate %
  - Requests/sec
- /fix interaction mockup on the PR-comment format (visual design)
- **Done**: Chart image + mockup committed for the deck

**K3 (Jul 19): Streamlit Dashboard Prototype + Recording**
- Minimal Streamlit dashboard:
  - Risk history table (past 10 deployments)
  - One SHAP plot (from Sarthak's model, dummy data)
  - Telemetry chart (from K2)
- Dashboard runs locally (or on free Streamlit Cloud if time)
- Backup demo recording once C3 is green
- **Done**: Dashboard runs locally + recording saved in two places

---

## 🔄 6. Sync Points & Rules

### **Jul 17 Morning — SYNC-0 (30 minutes, All Four)**
**Freeze the three interface contracts** before anyone writes code. This is what lets all four people work in parallel:

1. **Feature Schema** — Exact list of input features and their types
   ```python
   features = {
     "deploy_hour": int,
     "day_of_week": int,  # 0=Mon, 6=Sun
     "lines_changed": int,
     "files_touched": int,
     "service_criticality": str,  # "low", "medium", "high"
     "incidents_last_30d": int,
     "oncall_coverage": float,  # 0.0–1.0
     "author_success_rate": float,
   }
   ```

2. **SHAP Output JSON** — Exact shape the model function returns
   ```json
   {
     "risk": "High|Medium|Low",
     "score": 0.84,
     "top_factors": [
       {"feature": "name", "contribution_pct": 40.0},
       {"feature": "name", "contribution_pct": 30.0},
       {"feature": "name", "contribution_pct": 20.0}
     ]
   }
   ```

3. **PR-Comment Format** — Comment layout
   ```
   🔴 High Risk (0.84)
   
   Top Risk Factors:
   • 40% — lines_changed
   • 30% — incidents_last_30d
   • 20% — oncall_coverage
   
   Remediation Plan:
   [Aditya's advisor output goes here]
   ```

**Why this matters**: With frozen contracts, a placeholder respecting the contract is as good as the real thing. Chaitanya can build the whole pipeline on Day 1 with a hardcoded score and swap in the real model on Day 3 without rework.

### **Jul 17 Evening (15 minutes)**
**Blockers only.** Key checks:
- Contracts holding?
- K1's app URL live?
- Dataset generation started?

### **Jul 18 Evening (15 minutes)**
**S2 × C2 smoke test**: Call the real model function through `/score` once, tonight. If this works, Jul 19 starts with integration already proven, not attempted.

### **Jul 19 Evening (After Integration)**
**Two full rehearsals** — every member presents and defends their own component:
- **Sarthak**: Model/SHAP/label-rules questions (why these heuristics? What if they're wrong?)
- **Aditya**: GenAI/RAG (LLM never decides risk — walk through an example)
- **Kritika**: Telemetry/dashboard + product surface
- **Chaitanya**: Architecture, pipeline, live demo driving

### **Commit Rule**
Everyone commits **daily from their own GitHub account**. The rubric explicitly checks commit distribution. A 4-contributor graph over 3 days is free Team Readiness marks.

### **Escalation Rule**
Stuck for more than 90 minutes → say so in the group, don't sink the day.

**Critical-path rescue order**:
- Sarthak stuck → Chaitanya assists (he's the ML backup)
- Chaitanya stuck → Sarthak assists
- Aditya/Kritika tracks are parallel and self-contained (no rescue needed, low risk)

---

## 🛠️ 7. Tech Stack Decisions

| Component | Technology | Justification |
|-----------|-----------|-----------------|
| **Model** | LightGBM | Fast, tabular-native, SHAP-friendly, fully deterministic |
| **Explainability** | SHAP + DiCE | PS09 requirement + our edge (counterfactuals) |
| **Precedent Lookup** | KNN over feature history | Cheap, mimics Traversal's flagship feature |
| **Secret Scanning** | gitleaks | One Action step, industry standard |
| **API** | FastAPI | Our home turf, fast |
| **CI/CD + Gate** | GitHub Actions two-job pipeline | Named in PS09 itself |
| **LLM** | Claude/GPT API, structured JSON | Fastest iteration; hand-rolled function-calling loop |
| **Agent Orchestration (finals)** | CrewAI | Multi-agent structure after plain loop works |
| **RAG** | 10–15 self-written runbooks + ChromaDB/cosine | Tiny, grounded, kills generic advice |
| **Deployment History DB (finals)** | SQLite → PostgreSQL | Single source for precedents, outcomes, retraining |
| **Dashboard (finals)** | Streamlit | Judge-facing control room |
| **Hosting (finals)** | Render / Railway free tier | Real running server + telemetry |
| **Telemetry** | Custom middleware + /metrics + load script | Real measurement, not simulation |
| **Packaging (finals)** | Docker | One-command reproducibility |

---

## ❓ 8. Anticipated Judge Questions & Answers

### Q: *"Synthetic labels — how do we trust them?"*
**A**: 
- We document the label-generation rules transparently in the README (heuristics are visible)
- Layer 5 (Watchtower) closes the loop: real outcomes replace synthetic data over time
- The architecture is dataset-agnostic — a real org plugs in its deployment history
- By finals, the system has generated its own ground truth from real deployments

### Q: *"What if the LLM hallucinates?"*
**A**: 
- It never decides risk — only translates deterministic ML output
- All advice is grounded in our curated runbook knowledge base only
- If runbooks don't contain an answer, the LLM says "not in knowledge base"
- The advisor is a translator, not an oracle

### Q: *"What if the agent goes rogue?"*
**A**: 
- Fixed tool menu — LLM picks *which* tool + *which* arguments, never writes arbitrary code
- All commits land on the PR branch, never pushed to main
- Human must approve with `/fix` for Medium/High risk (config-gated auto-fix only for Low risk)
- Graduated autonomy: we're shipping human-in-loop today, full-auto as a config flag

### Q: *"Why not just predict latency from the diff?"*
**A**: 
- Static prediction from code isn't honest without load infrastructure
- We measure real post-deploy telemetry instead (p95 latency, error rate, actual payloads)
- This feeds back into the model as a feature (finals: latency-delta regressor trained on real data)
- Better than prediction: actual measurement

### Q: *"How is this different from a linter or Dependabot?"*
**A**: 
- Linters check code properties (style, structure)
- Dependabot checks dependency versions
- We score the **deployment event** (timing, context, history, on-call, incident record, author skill)
- We **close the loop** with production outcomes — every deploy teaches the model

---

## 📊 9. Finals Roadmap: Everything Ships Real (Not Roadmap)

Nothing gets cut. Each advanced feature ships by July 30 via a cheaper implementation than would have been built "from scratch":

| Feature | Round 1 Form | Finals Real Implementation | Effort |
|---------|-------------|---------------------------|--------|
| **Preview Deploy Load Test** | Static "expected latency" mockup | Every PR deploys ephemeral env → 30s load test → p95/error/size fed to model | 1 day, high payoff |
| **Fixer Tool Menu** | First tool (workflow edit) works end-to-end | All four tools: workflow, schedule, PR splitter, on-call notifier | ~1 day total, ~6h per tool |
| **Auto-Retraining** | Outcome logged manually | Trigger fires after N outcomes; human-approval toggle in config; both modes demoed | ~4 hours |
| **Full-Auto Remediation** | `/fix` approval-to-act | Config-gated: auto-apply for Low risk only; Medium/High require human `/fix` | ~2 hours (config wrapper) |
| **CrewAI Migration** | Hand-rolled function loop | Sentinels, Advisor, Fixer, Watchtower become Agents in sequential/parallel Crew | 3 days (after loop works) |
| **Deployment History DB** | None | SQLite single file → PostgreSQL if time; tracks precedents, outcomes, retraining | 2 days |
| **Streamlit Dashboard** | Static mockup or Jupyter | Real running dashboard: risk history, SHAP plots, telemetry, autonomy toggle | 2 days |
| **Docker Packaging** | None | Dockerfile: one-command reproducibility on demo machine | ~4 hours |

### **The One Hard Rule**
Scripted **inputs** are fine (pre-crafted risky PR, scripted traffic, cached LLM response as fallback) — that's rehearsal. Scripted **outputs** presented as working are not. On July 31 in front of HPE: everything shown runs for real. Fallback caching is there to handle live failures gracefully, not to hide simulation.

### **Priority Ladder (If Time Gets Tight, Cut from Bottom)**
1. Advisor + RAG ✅ (spinnable)
2. Fixer /fix with one tool ✅ (spinnable)
3. Watchtower + rollback ✅ (spinnable)
4. Auto-retrain trigger ✅ (spinnable)
5. Remaining Fixer tools (add later)
6. Deployment-history DB (add later)
7. Streamlit dashboard (add later)
8. CrewAI migration (add later)
9. Preview-deploy load test (add later)
10. Config-gated full autonomy (add later)
11. Latency-delta regressor (add later)
12. Docker packaging (add later)

**Items 1–4 are the demo backbone; 5–12 are the wow-multipliers.**

**Note**: CrewAI sits at #7 deliberately — it re-wraps working features, so it must never block items above it.

---

## 📋 Definition of Success

### **Round 1 Ready (July 19 Night)**
```
Demo PR (big diff, Friday evening) 
    → High Risk comment with SHAP factors + advisor section 
    → Deploy blocked 
    → Low-risk PR → Deploy allowed 
    → Fake API key → Instant hard block 
    → Backup recording saved 
    → Everyone can defend their layer
```

### **Finals Ready (July 30 Night)**
Everything from Round 1, plus:
- **/fix loop**: Agent commits, gate re-runs, risk drops on screen
- **Gitleaks demo**: Real secret detection hard-block
- **Automatic rollback**: Broken deploy → Watchtower detects → Auto-revert → App recovers
- **Outcome logged**: Model updated with real deployment data
- **Full autonomy demo**: Config toggle shows Low-risk auto-fixes (no `/fix` needed)
- **Rehearsed twice**: All five people present, cold-call ready

---

## 🚀 Next Steps

1. **Today (Jul 17)**: SYNC-0 kickoff, freeze the three contracts
2. **Day 1–2**: Each person starts their critical-path task
3. **Day 2 evening**: S2 × C2 smoke test (real model through /score)
4. **Day 3 morning**: C3 integration sprint
5. **Day 3 evening**: Two full rehearsals, demo runs twice
6. **July 20**: Deck finalized, Round 1 submission
7. **July 21–30**: Finals sprint, each priority-ladder item built real
8. **July 30**: Feature freeze, bug fixes, recordings, final rehearsal
9. **July 31**: On-stage with HPE, live demos, Q&A

---

## 📎 Appendix: Key Documents

- **GitHub Repo**: TBD (created on Jul 17)
- **Synthetic Dataset**: `datasets/deployments_synthetic.csv` (S1 deliverable)
- **Label Rules**: `datasets/README.md` — label-generation rules (S1 deliverable)
- **Runbooks**: `runbooks/*.md` (A1 deliverable)
- **Demo Recording**: Backup in two places (K3 + C3 deliverables)

---

**Last Updated**: July 17, 2026  
**Status**: Sprint Planning → Ready to Build  
**Decision**: All in? → Sarthak starts the dataset today.
