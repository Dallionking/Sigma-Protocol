/**
 * SSS Protocol - PRD Score Tool
 * 
 * OpenCode custom tool that calculates PRD quality scores
 * based on the SSS methodology criteria.
 * 
 * Usage in OpenCode:
 *   @prd-score Calculate quality of docs/prds/F01-auth.md
 *   The AI will call prd_score({ prd_path: "docs/prds/F01-auth.md" })
 */

import { defineTool } from "opencode";
import * as fs from "fs/promises";
import * as path from "path";

interface ScoreResult {
  prdPath: string;
  exists: boolean;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  breakdown: ScoreItem[];
  issues: string[];
  summary: string;
}

interface ScoreItem {
  criterion: string;
  points: number;
  maxPoints: number;
  status: "pass" | "partial" | "fail";
  details?: string;
}

// Scoring criteria based on SSS Step 11 PRD quality rubric
const SCORING_CRITERIA = [
  {
    name: "User Story Present",
    pattern: /##\s*User\s*Story/i,
    maxPoints: 10,
  },
  {
    name: "Acceptance Criteria (5+)",
    pattern: /##\s*Acceptance\s*Criteria[\s\S]*?(?:- \[[ x]\].*){5,}/i,
    partialPattern: /##\s*Acceptance\s*Criteria/i,
    maxPoints: 15,
    partialPoints: 7,
  },
  {
    name: "UI/UX Specifications",
    pattern: /##\s*UI\/UX\s*Specifications?/i,
    maxPoints: 15,
  },
  {
    name: "API Endpoints Documented",
    pattern: /##\s*(?:API\s*Endpoints?|Technical\s*Requirements)[\s\S]*?\|.*Method.*\|/i,
    partialPattern: /##\s*(?:API|Technical)/i,
    maxPoints: 15,
    partialPoints: 7,
  },
  {
    name: "BDD Scenarios (3+)",
    pattern: /(?:Given[\s\S]*?When[\s\S]*?Then[\s\S]*?){3,}/i,
    partialPattern: /Given[\s\S]*?When[\s\S]*?Then/i,
    maxPoints: 20,
    partialPoints: 10,
  },
  {
    name: "Edge Cases Documented",
    pattern: /##\s*Edge\s*Cases/i,
    maxPoints: 10,
  },
  {
    name: "Out of Scope Defined",
    pattern: /##\s*Out\s*of\s*Scope/i,
    maxPoints: 5,
  },
  {
    name: "No Ambiguous Language",
    // Inverse check - should NOT contain these
    antiPattern: /\b(should\s+probably|might|maybe|TBD|TODO|etc\.)\b/gi,
    maxPoints: 10,
  },
];

async function readFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

function gradeFromPercentage(percentage: number): string {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}

export default defineTool({
  name: "prd_score",
  description:
    "Calculate quality score for a PRD based on SSS Protocol Step 11 criteria",
  parameters: {
    prd_path: {
      type: "string",
      description: "Path to the PRD file (e.g., docs/prds/F01-auth.md)",
    },
  },

  async execute({ prd_path }): Promise<ScoreResult> {
    const content = await readFile(prd_path);

    if (content === null) {
      return {
        prdPath: prd_path,
        exists: false,
        score: 0,
        maxScore: 100,
        percentage: 0,
        grade: "F",
        breakdown: [],
        issues: [`PRD file not found: ${prd_path}`],
        summary: `❌ PRD not found at ${prd_path}`,
      };
    }

    const breakdown: ScoreItem[] = [];
    const issues: string[] = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const criterion of SCORING_CRITERIA) {
      maxScore += criterion.maxPoints;

      if (criterion.antiPattern) {
        // Inverse check - passes if pattern NOT found
        const matches = content.match(criterion.antiPattern);
        if (!matches || matches.length === 0) {
          totalScore += criterion.maxPoints;
          breakdown.push({
            criterion: criterion.name,
            points: criterion.maxPoints,
            maxPoints: criterion.maxPoints,
            status: "pass",
          });
        } else {
          breakdown.push({
            criterion: criterion.name,
            points: 0,
            maxPoints: criterion.maxPoints,
            status: "fail",
            details: `Found: ${matches.slice(0, 3).join(", ")}${matches.length > 3 ? "..." : ""}`,
          });
          issues.push(`Ambiguous language found: ${matches.slice(0, 3).join(", ")}`);
        }
      } else {
        // Normal pattern check
        const fullMatch = criterion.pattern.test(content);
        const partialMatch =
          criterion.partialPattern && criterion.partialPattern.test(content);

        if (fullMatch) {
          totalScore += criterion.maxPoints;
          breakdown.push({
            criterion: criterion.name,
            points: criterion.maxPoints,
            maxPoints: criterion.maxPoints,
            status: "pass",
          });
        } else if (partialMatch && criterion.partialPoints) {
          totalScore += criterion.partialPoints;
          breakdown.push({
            criterion: criterion.name,
            points: criterion.partialPoints,
            maxPoints: criterion.maxPoints,
            status: "partial",
            details: "Section exists but incomplete",
          });
          issues.push(`${criterion.name}: exists but needs more detail`);
        } else {
          breakdown.push({
            criterion: criterion.name,
            points: 0,
            maxPoints: criterion.maxPoints,
            status: "fail",
          });
          issues.push(`Missing: ${criterion.name}`);
        }
      }
    }

    const percentage = Math.round((totalScore / maxScore) * 100);
    const grade = gradeFromPercentage(percentage);
    const passing = percentage >= 80;

    const prdName = path.basename(prd_path);
    const summary = passing
      ? `✅ ${prdName}: Grade ${grade} (${percentage}%) - Ready for implementation`
      : `❌ ${prdName}: Grade ${grade} (${percentage}%) - Needs ${issues.length} fixes`;

    return {
      prdPath: prd_path,
      exists: true,
      score: totalScore,
      maxScore,
      percentage,
      grade,
      breakdown,
      issues,
      summary,
    };
  },
});

