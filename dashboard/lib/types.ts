export interface RiskFeatures {
  deploy_hour: number;
  day_of_week: string;
  lines_changed: number;
  files_touched: number;
  service_criticality: string;
  incidents_last_30d: number;
  oncall_coverage: number;
  author_success_rate: number;
}

export interface RiskFactor {
  feature: string;
  contribution_pct: number;
}

export interface RiskAssessment {
  risk: "Low" | "Medium" | "High";
  score: number;
  top_factors: RiskFactor[];
}

export interface PRSummary {
  id: string;
  title: string;
  author: string;
  linesAdded: number;
  linesRemoved: number;
  filesChanged: number;
  openedTime: string;
  branch: string;
  hasSecretLeak?: boolean;
  secretDiffSnippet?: string;
}

export interface SentinelResult {
  name: string;
  status: "success" | "warning" | "error";
  message: string;
  details?: string;
}

export interface SentinelResults {
  security: SentinelResult;
  performance: SentinelResult;
  metadata: SentinelResult;
}

export interface AdvisorItem {
  id: string;
  remediation: string;
  effect?: string;
  effectType?: "Low" | "Medium" | "High";
  runbook?: string;
}

export interface AdvisorPlan {
  items: AdvisorItem[];
  caption: string;
}

export interface WatchtowerDeploy {
  id: string;
  title: string;
  score: number;
  risk: "Low" | "Medium" | "High";
  outcome: "Success" | "Warning" | "Rollback"; // ✅, ⚠️, 🔁
  timestamp: string;
}

export interface TelemetryPoint {
  timestamp: string;
  value: number; // e.g. error rate or latency
}

export interface TelemetryHistory {
  metricName: string;
  deploys: WatchtowerDeploy[];
  chartData: TelemetryPoint[];
}
