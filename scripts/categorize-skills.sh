#!/bin/bash
# categorize-skills.sh
# Phase 4: Add invocation flags to .claude/skills/ based on categorization
# Category A: disable-model-invocation: true (manual-only, ~22 skills)
# Category B: default (no change needed, ~80 skills)
# Category C: user-invocable: false (background knowledge, ~81 skills)

set -euo pipefail

SKILLS_DIR="${1:-.claude/skills}"
DRY_RUN="${2:-false}"

# Category A: Manual-Only (side effects, deployment, session management, protocol dev)
CATEGORY_A=(
  "sigma-exit.md"
  "session-distill.md"
  "sigma-protocol-dev.md"
  "sigma-ralph"  # directory
  "ralph-loop.md"
  "ralph-tail.md"
  "finishing-a-development-branch.md"
  "vercel-deploy.md"
  "skill-creator.md"
  "writing-skills.md"
  "opencode-agent-generator.md"
  "creating-opencode-plugins.md"
  "using-sigma-skills.md"
  "using-superpowers.md"
  "fork-worker.md"
  "orchestrator-admin.md"
  "taskmaster-integration.md"
  "terminal-automation.md"
  "using-git-worktrees.md"
  "output-generation.md"
  "memory-systems.md"
  "remembering-conversations.md"
)

# Category C: Background Knowledge (specialized domain, not in / menu)
CATEGORY_C=(
  # Three.js family (10)
  "threejs-animation.md"
  "threejs-fundamentals.md"
  "threejs-geometry.md"
  "threejs-interaction.md"
  "threejs-lighting.md"
  "threejs-loaders.md"
  "threejs-materials.md"
  "threejs-postprocessing.md"
  "threejs-shaders.md"
  "threejs-textures.md"
  # Blockchain scanners (6)
  "algorand-vulnerability-scanner.md"
  "cairo-vulnerability-scanner.md"
  "cosmos-vulnerability-scanner.md"
  "solana-vulnerability-scanner.md"
  "substrate-vulnerability-scanner.md"
  "ton-vulnerability-scanner.md"
  # Fuzzing tools (12)
  "aflpp.md"
  "atheris.md"
  "cargo-fuzz.md"
  "libafl.md"
  "libfuzzer.md"
  "ossfuzz.md"
  "ruzzy.md"
  "fuzzing-dictionary.md"
  "fuzzing-integration.md"
  "fuzzing-obstacles.md"
  "harness-writing.md"
  "wycheproof.md"
  # Security tooling (7)
  "burpsuite-project-parser.md"
  "codeql.md"
  "semgrep.md"
  "semgrep-rule-creator.md"
  "semgrep-rule-variant-creator.md"
  "sarif-parsing.md"
  "firebase-apk-scanner.md"
  # CRO tools (6)
  "form-cro.md"
  "onboarding-cro.md"
  "page-cro.md"
  "popup-cro.md"
  "signup-flow-cro.md"
  "paywall-upgrade-cro.md"
  # Expo family (5)
  "expo-api-routes.md"
  "expo-cicd-workflows.md"
  "expo-deployment.md"
  "expo-dev-client.md"
  "expo-tailwind-setup.md"
  # Analysis tools (7)
  "constant-time-analysis.md"
  "constant-time-testing.md"
  "root-cause-tracing.md"
  "coverage-analysis.md"
  "entry-point-analyzer.md"
  "token-integration-analyzer.md"
  "address-sanitizer.md"
  # Smart contract security (4)
  "smart-contract-security.md"
  "guidelines-advisor.md"
  "spec-to-code-compliance.md"
  "secure-workflow-guide.md"
  # Specialized domain (various)
  "dwarf-expert.md"
  "sharp-edges.md"
  "variant-analysis.md"
  "code-maturity-assessor.md"
  "code-maturity-assessor-extended.md"
  "audit-context-building.md"
  "audit-prep-assistant.md"
  "property-based-testing.md"
  "property-based-testing-advanced.md"
  "testing-handbook-generator.md"
  "fix-review.md"
  "differential-review.md"
  "receiving-code-review.md"
  "requesting-code-review.md"
  # Multi-agent patterns
  "crewai-patterns.md"
  "langgraph-patterns.md"
  "loki-mode.md"
  # Marketing specialized
  "ab-test-setup.md"
  "analytics-tracking.md"
  "competitor-alternatives.md"
  "email-sequence.md"
  "free-tool-strategy.md"
  "marketing-ideas.md"
  "paid-ads.md"
  "pricing-strategy.md"
  "programmatic-seo.md"
  "referral-program.md"
  "schema-markup.md"
  "social-content.md"
  # Content specialized
  "interpreting-culture-index.md"
  "internal-comms.md"
  # React Native / Mobile
  "building-native-ui.md"
  "native-data-fetching.md"
  "react-native-best-practices.md"
  "upgrading-expo.md"
  "use-dom.md"
  # Misc specialized
  "remotion-best-practices.md"
  "stripe-best-practices.md"
  "upgrade-stripe.md"
  "condition-based-waiting.md"
  "agentation.md"
  "test-driven-development.md"
  "writing-plans.md"
)

add_frontmatter_field() {
  local file="$1"
  local field="$2"
  local value="$3"

  if [ ! -f "$file" ]; then
    return
  fi

  # Check if field already exists
  if grep -q "^${field}:" "$file" 2>/dev/null; then
    echo "  SKIP (already has $field): $file"
    return
  fi

  # Check if file has frontmatter
  if ! head -1 "$file" | grep -q "^---" 2>/dev/null; then
    echo "  SKIP (no frontmatter): $file"
    return
  fi

  if [ "$DRY_RUN" = "true" ]; then
    echo "  DRY-RUN: Would add '$field: $value' to $file"
    return
  fi

  # Insert the field before the closing ---
  # Find the second --- and insert before it
  python3 -c "
import sys
lines = open('$file').readlines()
# Find second ---
count = 0
insert_idx = -1
for i, line in enumerate(lines):
    if line.strip() == '---':
        count += 1
        if count == 2:
            insert_idx = i
            break
if insert_idx > 0:
    lines.insert(insert_idx, '$field: $value\n')
    open('$file', 'w').writelines(lines)
    print('  ADDED $field: $value to $(basename $file)')
else:
    print('  ERROR: Could not find closing --- in $file')
"
}

echo "=== Sigma Protocol Skill Categorization ==="
echo "Skills directory: $SKILLS_DIR"
echo ""

# Process Category A
echo "--- Category A: Manual-Only (disable-model-invocation: true) ---"
A_COUNT=0
for skill in "${CATEGORY_A[@]}"; do
  filepath="$SKILLS_DIR/$skill"
  if [ -f "$filepath" ]; then
    add_frontmatter_field "$filepath" "disable-model-invocation" "true"
    A_COUNT=$((A_COUNT + 1))
  elif [ -d "$filepath" ]; then
    # Handle directory-based skills (e.g., sigma-ralph/)
    for md in "$filepath"/*.md; do
      [ -f "$md" ] && add_frontmatter_field "$md" "disable-model-invocation" "true"
    done
    A_COUNT=$((A_COUNT + 1))
  fi
done
echo "Category A: $A_COUNT skills processed"
echo ""

# Process Category C
echo "--- Category C: Background Knowledge (user-invocable: false) ---"
C_COUNT=0
for skill in "${CATEGORY_C[@]}"; do
  filepath="$SKILLS_DIR/$skill"
  if [ -f "$filepath" ]; then
    add_frontmatter_field "$filepath" "user-invocable" "false"
    C_COUNT=$((C_COUNT + 1))
  fi
done
echo "Category C: $C_COUNT skills processed"
echo ""

echo "=== Summary ==="
echo "Category A (manual-only): $A_COUNT"
echo "Category B (default/unchanged): ~$((182 - A_COUNT - C_COUNT))"
echo "Category C (background): $C_COUNT"
echo "Total: 182 skills"
