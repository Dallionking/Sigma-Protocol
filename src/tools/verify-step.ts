/**
 * SSS Protocol - Verify Step Tool
 * 
 * OpenCode custom tool that verifies SSS step completion
 * against the verification schema defined in each step command.
 * 
 * Usage in OpenCode:
 *   @verify Check step 1 completion
 *   The AI will call verify_step({ step: 1 })
 */

import { defineTool } from "opencode";
import * as fs from "fs/promises";
import * as path from "path";

interface VerificationResult {
  step: number;
  score: number;
  maxScore: number;
  percentage: number;
  passing: boolean;
  results: CheckResult[];
  summary: string;
}

interface CheckResult {
  check: string;
  status: "pass" | "fail";
  points: number;
  maxPoints: number;
  reason?: string;
}

// Step file mappings
const STEP_FILES: Record<number, string> = {
  0: "step-0-environment",
  1: "step-1-ideation",
  2: "step-2-architecture",
  3: "step-3-ux-design",
  4: "step-4-flow-tree",
  5: "step-5-wireframes",
  6: "step-6-design-system",
  7: "step-7-interface-states",
  8: "step-8-technical-spec",
  9: "step-9-landing-page",
  10: "step-10-feature-breakdown",
  11: "step-11-prd-generation",
  12: "step-12-context-engine",
};

// Required outputs per step
const STEP_REQUIREMENTS: Record<number, { files: string[]; sections?: Record<string, string[]> }> = {
  1: {
    files: ["docs/specs/MASTER_PRD.md"],
    sections: {
      "MASTER_PRD.md": [
        "## Problem Statement",
        "## Target Users",
        "## Value Proposition",
        "## Competitive Landscape",
        "## Success Metrics",
      ],
    },
  },
  2: {
    files: ["docs/architecture/ARCHITECTURE.md"],
    sections: {
      "ARCHITECTURE.md": [
        "## System Overview",
        "## Tech Stack",
        "## Data Model",
      ],
    },
  },
  3: {
    files: ["docs/ux/UX-DESIGN.md"],
  },
  4: {
    files: [
      "docs/flows/FLOW-TREE.md",
      "docs/flows/SCREEN-INVENTORY.md",
      "docs/flows/TRACEABILITY-MATRIX.md",
    ],
  },
  5: {
    files: ["wireframes/", "docs/wireframes/PROTOTYPE-SUMMARY.md"],
  },
  6: {
    files: [
      "docs/design/DESIGN-SYSTEM.md",
      "docs/design/UI-PROFILE.md",
      "docs/design/ui-profile.json",
    ],
  },
  7: {
    files: ["docs/states/STATE-SPEC.md"],
  },
  8: {
    files: ["docs/technical/TECHNICAL-SPEC.md"],
  },
  9: {
    files: ["docs/landing/LANDING-PAGE.md"],
  },
  10: {
    files: ["docs/features/FEATURE-BREAKDOWN.md"],
  },
  11: {
    files: ["docs/prds/PRD-INDEX.md"],
  },
  12: {
    files: [".cursorrules"],
  },
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

async function readFileContent(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function checkFile(
  filePath: string,
  minSize: number = 100
): Promise<CheckResult> {
  const exists = await fileExists(filePath);
  const size = exists ? await getFileSize(filePath) : 0;
  const isDirectory = filePath.endsWith("/");

  if (isDirectory) {
    // For directories, check if it exists and has files
    try {
      const files = await fs.readdir(filePath.slice(0, -1));
      const hasFiles = files.length > 0;
      return {
        check: `Directory: ${filePath}`,
        status: hasFiles ? "pass" : "fail",
        points: hasFiles ? 10 : 0,
        maxPoints: 10,
        reason: hasFiles ? undefined : "Directory empty or missing",
      };
    } catch {
      return {
        check: `Directory: ${filePath}`,
        status: "fail",
        points: 0,
        maxPoints: 10,
        reason: "Directory not found",
      };
    }
  }

  if (!exists) {
    return {
      check: `File: ${filePath}`,
      status: "fail",
      points: 0,
      maxPoints: 10,
      reason: "File not found",
    };
  }

  if (size < minSize) {
    return {
      check: `File: ${filePath}`,
      status: "fail",
      points: 5,
      maxPoints: 10,
      reason: `File too small (${size} bytes, need ${minSize}+)`,
    };
  }

  return {
    check: `File: ${filePath}`,
    status: "pass",
    points: 10,
    maxPoints: 10,
  };
}

async function checkSection(
  filePath: string,
  section: string
): Promise<CheckResult> {
  const content = await readFileContent(filePath);
  const hasSection = content.includes(section);

  return {
    check: `Section: ${section} in ${path.basename(filePath)}`,
    status: hasSection ? "pass" : "fail",
    points: hasSection ? 5 : 0,
    maxPoints: 5,
    reason: hasSection ? undefined : `Section "${section}" not found`,
  };
}

export default defineTool({
  name: "verify_step",
  description:
    "Verify SSS Protocol step completion by checking required files, sections, and quality patterns",
  parameters: {
    step: {
      type: "number",
      description: "Step number to verify (0-12)",
    },
  },

  async execute({ step }): Promise<VerificationResult> {
    if (step < 0 || step > 12) {
      return {
        step,
        score: 0,
        maxScore: 0,
        percentage: 0,
        passing: false,
        results: [],
        summary: `Invalid step number: ${step}. Valid range is 0-12.`,
      };
    }

    const requirements = STEP_REQUIREMENTS[step];
    if (!requirements) {
      return {
        step,
        score: 0,
        maxScore: 0,
        percentage: 0,
        passing: false,
        results: [],
        summary: `No verification requirements defined for step ${step}.`,
      };
    }

    const results: CheckResult[] = [];

    // Check required files
    for (const file of requirements.files) {
      const result = await checkFile(file);
      results.push(result);
    }

    // Check required sections
    if (requirements.sections) {
      for (const [fileName, sections] of Object.entries(requirements.sections)) {
        const filePath = requirements.files.find((f) => f.endsWith(fileName));
        if (filePath) {
          for (const section of sections) {
            const result = await checkSection(filePath, section);
            results.push(result);
          }
        }
      }
    }

    // Calculate score
    const score = results.reduce((sum, r) => sum + r.points, 0);
    const maxScore = results.reduce((sum, r) => sum + r.maxPoints, 0);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passing = percentage >= 80;

    // Generate summary
    const passCount = results.filter((r) => r.status === "pass").length;
    const failCount = results.filter((r) => r.status === "fail").length;

    const summary = passing
      ? `✅ Step ${step} PASSED with ${percentage}% (${score}/${maxScore} points). ${passCount} checks passed.`
      : `❌ Step ${step} FAILED with ${percentage}% (${score}/${maxScore} points). ${failCount} checks need attention.`;

    return {
      step,
      score,
      maxScore,
      percentage,
      passing,
      results,
      summary,
    };
  },
});

