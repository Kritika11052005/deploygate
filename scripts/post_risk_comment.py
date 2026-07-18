"""C2: PR-comment bot.

Computes real diff-based features (lines changed, files touched, day/hour),
scores them via api/scoring.py, and posts a formatted risk comment on the PR.
"""
import os
import subprocess
import sys
from datetime import datetime, timezone

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from api.scoring import score_deployment  # noqa: E402

RISK_EMOJI = {"High": "\U0001F534", "Medium": "\U0001F7E1", "Low": "\U0001F7E2"}


def get_diff_stats(base_ref: str) -> tuple[int, int]:
    subprocess.run(["git", "fetch", "origin", base_ref], check=False)
    result = subprocess.run(
        ["git", "diff", "--shortstat", f"origin/{base_ref}...HEAD"],
        capture_output=True,
        text=True,
        check=False,
    )
    lines_changed = 0
    files_touched = 0
    for part in result.stdout.split(","):
        part = part.strip()
        if "file" in part:
            files_touched = int(part.split()[0])
        elif "insertion" in part or "deletion" in part:
            lines_changed += int(part.split()[0])
    return lines_changed, files_touched


def build_features() -> dict:
    base_ref = os.environ.get("GITHUB_BASE_REF", "main")
    lines_changed, files_touched = get_diff_stats(base_ref)
    now = datetime.now(timezone.utc)
    return {
        "deploy_hour": now.hour,
        "day_of_week": now.weekday(),
        "lines_changed": lines_changed,
        "files_touched": files_touched,
        "service_criticality": "medium",
        "incidents_last_30d": 0,
        "oncall_coverage": 1.0,
        "author_success_rate": 0.9,
        "secrets_detected_count": 0,
    }


def format_comment(result: dict) -> str:
    emoji = RISK_EMOJI.get(result["risk"], "⚪")
    lines = [f"{emoji} {result['risk']} Risk ({result['score']})", "", "Top Risk Factors:"]
    if result["top_factors"]:
        for factor in result["top_factors"]:
            lines.append(f"• {factor['contribution_pct']}% — {factor['feature']}")
    else:
        lines.append("• No significant risk factors detected")
    lines += ["", "Remediation Plan:", "_(Advisor integration lands in C3/A4)_"]
    return "\n".join(lines)


def post_comment(body: str) -> None:
    repo = os.environ["GITHUB_REPOSITORY"]
    pr_number = os.environ["PR_NUMBER"]
    token = os.environ["GITHUB_TOKEN"]
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }
    resp = requests.post(url, json={"body": body}, headers=headers)
    resp.raise_for_status()


def main():
    features = build_features()
    result = score_deployment(features)
    comment = format_comment(result)
    print(comment)
    post_comment(comment)


if __name__ == "__main__":
    main()
