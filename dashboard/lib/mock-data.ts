import {
  PRSummary,
  SentinelResults,
  RiskAssessment,
  AdvisorPlan,
  TelemetryHistory,
  WatchtowerDeploy,
  TelemetryPoint
} from "./types";

export function getDemoPR(): PRSummary {
  return {
    id: "#402",
    title: "Refactor payment webhook retry logic",
    author: "Kritika",
    linesAdded: 842,
    linesRemoved: 213,
    filesChanged: 14,
    openedTime: "Friday · 5:52 PM",
    branch: "feature/payment-webhook-retry",
    hasSecretLeak: false
  };
}

export function getSecretLeakPR(): PRSummary {
  return {
    id: "#403",
    title: "Add third-party payment provider client config",
    author: "Kritika",
    linesAdded: 12,
    linesRemoved: 3,
    filesChanged: 2,
    openedTime: "Friday · 6:15 PM",
    branch: "config/payment-client",
    hasSecretLeak: true,
    secretDiffSnippet: `--- a/config/payment-client.ts
+++ b/config/payment-client.ts
@@ -10,3 +10,4 @@
 export const config = {
-  endpoint: "https://api.payment-provider.com/v1",
+  endpoint: "https://api.payment-provider.com/v1",
+  secret_key: "AKIA_DEMO_FAKE_KEY_0000" // REMOVE BEFORE MERGING
 };`
   };
}

export function getSentinelResults(hasSecretLeak: boolean): SentinelResults {
  if (hasSecretLeak) {
    return {
      security: {
        name: "Security Sentinel",
        status: "error",
        message: "1 secret detected",
        details: "Found AWS access key pattern (AKIA_DEMO_FAKE_KEY_0000) in file: config/payment-client.ts on line 12."
      },
      performance: {
        name: "Performance Sentinel",
        status: "success",
        message: "0 performance issues flagged",
        details: "No slow database queries, N+1 patterns, or blocking synchronous calls detected in this diff."
      },
      metadata: {
        name: "Metadata Sentinel",
        status: "warning",
        message: "Friday evening deploy",
        details: "PR opened on Friday at 6:15 PM. Critical path payments service affected. On-call coverage is currently 0%."
      }
    };
  }

  return {
    security: {
      name: "Security Sentinel",
      status: "success",
      message: "0 secrets detected",
      details: "No plaintext keys, credentials, or high-entropy strings found in the file diff."
    },
    performance: {
      name: "Performance Sentinel",
      status: "warning",
      message: "1 N+1 query pattern flagged",
      details: "Potential N+1 query detected in retry queue processing loop in webhook_handler.py:112."
    },
    metadata: {
      name: "Metadata Sentinel",
      status: "warning",
      message: "Friday evening deploy",
      details: "PR opened on Friday at 5:52 PM. Critical path payments service affected. On-call coverage is currently 0%."
    }
  };
}

export function getRiskAssessment(): RiskAssessment {
  return {
    risk: "High",
    score: 0.84,
    top_factors: [
      { feature: "Large diff (842 lines changed)", contribution_pct: 38 },
      { feature: "Friday 5:52 PM deploy window", contribution_pct: 32 },
      { feature: "Zero on-call engineers on payments", contribution_pct: 20 }
    ]
  };
}

export function getLowRiskAssessment(): RiskAssessment {
  return {
    risk: "Low",
    score: 0.21,
    top_factors: [
      { feature: "Large diff (842 lines changed)", contribution_pct: 15 },
      { feature: "Tuesday 10:00 AM deploy window", contribution_pct: 4 },
      { feature: "100% on-call coverage (re-scheduled)", contribution_pct: 2 }
    ]
  };
}

export function getAdvisorPlan(): AdvisorPlan {
  return {
    items: [
      {
        id: "adv-1",
        remediation: "Split this PR at the payments/ service boundary",
        effect: "drops to Medium",
        effectType: "Medium"
      },
      {
        id: "adv-2",
        remediation: "Move the deploy window to Tue 10 AM",
        effect: "drops to Low",
        effectType: "Low"
      },
      {
        id: "adv-3",
        remediation: "No rollback step detected — add one",
        runbook: "rollback-pattern.md"
      }
    ],
    caption: "Grounded in the team's own runbooks. The LLM never invents the risk score — only the fix."
  };
}

export function getTelemetryHistory(): TelemetryHistory {
  const deploys: WatchtowerDeploy[] = [
    {
      id: "dp-1",
      title: "Update user profile layout",
      score: 0.12,
      risk: "Low",
      outcome: "Success",
      timestamp: "Jul 17, 10:30 AM"
    },
    {
      id: "dp-2",
      title: "Fix billing currency format",
      score: 0.45,
      risk: "Medium",
      outcome: "Success",
      timestamp: "Jul 18, 2:15 PM"
    },
    {
      id: "dp-3",
      title: "Optimize DB index on events table",
      score: 0.78,
      risk: "High",
      outcome: "Rollback",
      timestamp: "Jul 18, 4:45 PM"
    },
    {
      id: "dp-4",
      title: "Add slack notification for retry failures",
      score: 0.34,
      risk: "Medium",
      outcome: "Warning",
      timestamp: "Jul 19, 11:00 AM"
    },
    {
      id: "dp-5",
      title: "Refactor payment webhook retry logic",
      score: 0.21,
      risk: "Low",
      outcome: "Success",
      timestamp: "Jul 21, 10:00 AM"
    }
  ];

  const chartData: TelemetryPoint[] = [
    { timestamp: "09:50 AM", value: 0.015 },
    { timestamp: "09:55 AM", value: 0.012 },
    { timestamp: "10:00 AM", value: 0.018 }, // Deploy happens here
    { timestamp: "10:05 AM", value: 0.025 },
    { timestamp: "10:10 AM", value: 0.022 },
    { timestamp: "10:15 AM", value: 0.017 },
    { timestamp: "10:20 AM", value: 0.015 },
    { timestamp: "10:25 AM", value: 0.013 },
    { timestamp: "10:30 AM", value: 0.014 },
    { timestamp: "10:35 AM", value: 0.011 }
  ];

  return {
    metricName: "Production Error Rate (%)",
    deploys,
    chartData
  };
}
