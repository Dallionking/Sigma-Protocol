---
version: "1.1.0"
last_updated: "2026-01-21"
changelog:
  - "1.1.0: Renamed from step-5.25 to step-5a for correct sort order; added auto-install missing skills"
  - "1.0.0: Initial release - Prototype preparation step ensuring Foundation Skills are installed and environment is ready for Step 5b PRD implementation"
description: "Step 5a: Prototype Prep - Validate Foundation Skills, check environment, auto-install missing skills, and prepare for prototype implementation via Ralph Loop"
allowed-tools:
  # File Operations
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep

  # Terminal Operations
  - run_terminal_cmd

  # Documentation Reference
  - mcp_ref_ref_search_documentation
  - mcp_ref_ref_read_url
parameters:
  - --quick        # Skip detailed validation, just check essentials
  - --fix          # Auto-fix issues where possible
  - --platform     # cursor | claude-code | opencode (optional, auto-detect)
---

# /step-5a-prototype-prep — Prototype Implementation Preparation

**Mission**
Ensure the development environment is properly configured with Foundation Skills and dependencies before implementing Step 5b prototype PRDs via the Ralph Loop. **Auto-installs missing skills** when detected.

**Context:**
- **Step 5** generated wireframe PRDs for each user flow
- **Step 5b** converts those PRDs to `ralph-backlog.json` format
- **This Step (5a)** validates that skills, environment, and dependencies are ready; **auto-installs missing skills**
- **Ralph Loop** will autonomously implement the stories from the backlog

**When to Run:**
- After completing Step 5 wireframe PRD generation
- Before running Step 5b PRD-to-JSON conversion
- When troubleshooting Ralph Loop implementation failures

---

## PHASE A: ENVIRONMENT VALIDATION

### A.1 Node.js & Package Manager Check

```bash
# Required: Node.js 18+ and preferred package manager
node --version   # Must be >= 18.0.0
npm --version    # or pnpm/yarn
```

**Checklist:**
- [ ] Node.js >= 18.0.0 installed
- [ ] Package manager (npm/pnpm/yarn) available
- [ ] `package.json` exists in project root

**Auto-Fix Actions:**
```bash
# If Node version is insufficient
nvm install 22 && nvm use 22

# If package.json missing
npm init -y
```

### A.2 Project Dependencies Check

Verify core prototype dependencies are installed:

```bash
# Check for required dev dependencies
npm list @types/node typescript eslint 2>/dev/null || echo "Missing dev deps"

# Check for framework-specific deps
npm list next react react-dom 2>/dev/null || echo "Missing Next.js"
# OR
npm list expo react-native 2>/dev/null || echo "Missing Expo"
```

**Required Dependencies by Platform:**

| Platform | Core Dependencies |
|----------|-------------------|
| **Next.js** | `next`, `react`, `react-dom`, `typescript`, `tailwindcss` |
| **TanStack** | `@tanstack/start`, `@tanstack/react-router`, `vite` |
| **Expo** | `expo`, `react-native`, `nativewind` |

### A.3 Environment Variables Check

```bash
# Check .env or .env.local exists
ls -la .env* 2>/dev/null || echo "No .env files found"

# List required variables from PRDs (parse from docs/prds/flows/*.md)
grep -h "^[A-Z_]*=" docs/prds/flows/*.md 2>/dev/null | sort -u
```

**Quality Gate A:**
- [ ] Node.js 18+ installed
- [ ] Package manager functional
- [ ] Framework dependencies installed
- [ ] TypeScript configured (tsconfig.json exists)
- [ ] Environment file exists (.env or .env.local)

**Score: ___/5 (minimum 4 to pass)**

---

## PHASE B: FOUNDATION SKILLS VALIDATION

### B.1 Detect Platform

```bash
# Auto-detect platform based on directory structure
if [ -d ".cursor" ]; then echo "Cursor detected"; fi
if [ -d ".claude" ]; then echo "Claude Code detected"; fi
if [ -d ".opencode" ]; then echo "OpenCode detected"; fi
```

### B.2 Verify Foundation Skills Installed

Foundation Skills are installed during Step 0 and provide the AI coding capabilities needed for prototype implementation.

**Required Skills for Prototype Implementation:**

| Skill | Purpose | Required |
|-------|---------|----------|
| `frontend-design` | UI component generation, styling | **YES** |
| `systematic-debugging` | Fixing implementation issues | **YES** |
| `ux-designer` | UX decisions, accessibility | Recommended |
| `quality-gates` | Validation and testing | Recommended |
| `browser-verification` | UI visual validation | Optional |
| `react-performance` | React optimization | Optional |

**Verification Commands:**

For **Cursor**:
```bash
# Check .cursor/rules/ for sss-* files
ls .cursor/rules/sss-*.mdc 2>/dev/null | wc -l
# Should show >= 5 Foundation Skills
```

For **Claude Code**:
```bash
# Check .claude/skills/ for skill directories
ls -d .claude/skills/*/ 2>/dev/null | wc -l
# Should show >= 5 Foundation Skills
```

For **OpenCode**:
```bash
# Check .opencode/skill/ for skill directories
ls -d .opencode/skill/*/ 2>/dev/null | wc -l
# Should show >= 5 Foundation Skills
```

### B.3 Auto-Install Missing Skills

**This step automatically installs missing Foundation Skills from SSS Protocol source.**

```typescript
// Auto-install logic executed when --fix flag is used or skills are missing

interface SkillInstallConfig {
  skillName: string;
  sourcePath: string;  // Relative to SSS Protocol package
  required: boolean;
}

const REQUIRED_SKILLS: SkillInstallConfig[] = [
  { skillName: 'frontend-design', sourcePath: 'src/skills/frontend-design.md', required: true },
  { skillName: 'systematic-debugging', sourcePath: 'src/skills/systematic-debugging.md', required: true },
  { skillName: 'ux-designer', sourcePath: 'src/skills/ux-designer.md', required: false },
  { skillName: 'quality-gates', sourcePath: 'src/skills/quality-gates.md', required: false },
];

async function autoInstallMissingSkills(platform: 'cursor' | 'claude-code' | 'opencode', missingSkills: string[]) {
  // Determine SSS Protocol source directory
  const sssProtocolDir = await findSssProtocolDir();
  // Options: node_modules/sss-protocol, ~/.sss-protocol, or global install

  // Determine target directory based on platform
  const targetConfig = {
    'cursor': { dir: '.cursor/rules', suffix: '.mdc', prefix: 'sss-' },
    'claude-code': { dir: '.claude/skills', suffix: '/SKILL.md', prefix: '' },
    'opencode': { dir: '.opencode/skill', suffix: '/SKILL.md', prefix: '' },
  }[platform];

  console.log(`\n🔧 Auto-installing ${missingSkills.length} missing skills for ${platform}...\n`);

  for (const skillName of missingSkills) {
    const skillConfig = REQUIRED_SKILLS.find(s => s.skillName === skillName);
    if (!skillConfig) continue;

    const sourcePath = `${sssProtocolDir}/${skillConfig.sourcePath}`;

    let targetPath: string;
    if (platform === 'cursor') {
      // Cursor: .cursor/rules/sss-frontend-design.mdc
      targetPath = `${targetConfig.dir}/${targetConfig.prefix}${skillName}${targetConfig.suffix}`;
    } else {
      // Claude Code / OpenCode: .claude/skills/frontend-design/SKILL.md
      targetPath = `${targetConfig.dir}/${skillName}${targetConfig.suffix}`;
      // Create directory if needed
      await mkdir(`${targetConfig.dir}/${skillName}`, { recursive: true });
    }

    // Copy skill file
    await copyFile(sourcePath, targetPath);
    console.log(`  ✓ Installed ${skillName} → ${targetPath}`);
  }

  console.log(`\n✅ Auto-install complete. ${missingSkills.length} skills installed.\n`);
}

async function findSssProtocolDir(): Promise<string> {
  // Check locations in order of preference
  const locations = [
    'node_modules/sss-protocol',           // Local install
    `${process.env.HOME}/.sss-protocol`,   // User home
    '/usr/local/share/sss-protocol',       // Global install
  ];

  for (const loc of locations) {
    if (await fileExists(`${loc}/src/skills/frontend-design.md`)) {
      return loc;
    }
  }

  throw new Error('SSS Protocol not found. Run: npm install sss-protocol');
}
```

**Auto-Install Behavior:**
- **Detects missing required skills** (frontend-design, systematic-debugging)
- **Copies from SSS Protocol source directory** (node_modules or ~/.sss-protocol)
- **Creates directory structure if needed** (for Claude Code/OpenCode)
- **Reports each skill installed**
- **Works with `--fix` flag or automatically when required skills are missing**

**Skills Auto-Installed:**

| Skill | Source | Cursor Target | Claude Code Target |
|-------|--------|---------------|-------------------|
| `frontend-design` | `src/skills/frontend-design.md` | `.cursor/rules/sss-frontend-design.mdc` | `.claude/skills/frontend-design/SKILL.md` |
| `systematic-debugging` | `src/skills/systematic-debugging.md` | `.cursor/rules/sss-systematic-debugging.mdc` | `.claude/skills/systematic-debugging/SKILL.md` |
| `quality-gates` | `src/skills/quality-gates.md` | `.cursor/rules/sss-quality-gates.mdc` | `.claude/skills/quality-gates/SKILL.md` |
| `ux-designer` | `src/skills/ux-designer.md` | `.cursor/rules/sss-ux-designer.mdc` | `.claude/skills/ux-designer/SKILL.md` |

**Manual Installation (Alternative):**

```bash
# Via SSS CLI
npx sss-protocol install-skills --platform [cursor|claude-code|opencode]

# Or copy manually for Cursor
cp node_modules/sss-protocol/src/skills/frontend-design.md .cursor/rules/sss-frontend-design.mdc

# Or copy manually for Claude Code
mkdir -p .claude/skills/frontend-design
cp node_modules/sss-protocol/src/skills/frontend-design.md .claude/skills/frontend-design/SKILL.md
```

**Quality Gate B:**
- [ ] Platform detected (Cursor/Claude Code/OpenCode)
- [ ] `frontend-design` skill installed (auto-installed if missing)
- [ ] `systematic-debugging` skill installed (auto-installed if missing)
- [ ] At least 4 Foundation Skills present
- [ ] Skills directory has correct permissions (readable)

**Score: ___/5 (minimum 4 to pass)**

---

## PHASE C: RECOMMENDED SKILLS FOR PROTOTYPE WORK

### C.1 Core Required Skills

These skills are **mandatory** for successful prototype implementation:

#### @frontend-design
**Purpose:** Generate high-quality UI components with modern React patterns.

**Used For:**
- Creating component files from PRD specs
- Tailwind CSS styling
- shadcn/ui component integration
- Responsive design implementation

**Invocation:** When implementing any `UI-*` task from Ralph backlog.

#### @systematic-debugging
**Purpose:** Structured approach to fixing implementation issues.

**Used For:**
- Resolving TypeScript errors
- Fixing runtime issues
- Tracing component rendering problems
- API integration debugging

**Invocation:** When a task fails or produces errors.

### C.2 Recommended Skills

#### @ux-designer
**Purpose:** Ensure UI decisions align with UX best practices.

**Used For:**
- Accessibility compliance (WCAG)
- Mobile responsiveness
- User flow optimization
- Interaction patterns

#### @quality-gates
**Purpose:** Automated validation and testing.

**Used For:**
- Running lint checks
- Type checking
- Unit test generation
- Build verification

### C.3 Optional Skills

#### @browser-verification
**Purpose:** Automated UI validation using Agent Browser.

**Used For:**
- Visual regression testing
- Interactive element verification
- Screenshot capture for documentation

#### @react-performance
**Purpose:** Optimize React component performance.

**Used For:**
- Memoization strategies
- Bundle size optimization
- Render optimization

### C.4 Skill Availability Matrix

Generate a matrix showing which skills are available:

```
┌─────────────────────────┬──────────┬────────────┐
│ Skill                   │ Required │ Installed  │
├─────────────────────────┼──────────┼────────────┤
│ frontend-design         │ YES      │ [ ]        │
│ systematic-debugging    │ YES      │ [ ]        │
│ ux-designer            │ Rec      │ [ ]        │
│ quality-gates          │ Rec      │ [ ]        │
│ browser-verification   │ Optional │ [ ]        │
│ react-performance      │ Optional │ [ ]        │
└─────────────────────────┴──────────┴────────────┘
```

**Quality Gate C:**
- [ ] All required skills installed
- [ ] At least 1 recommended skill installed
- [ ] Skill invocation patterns documented

**Score: ___/3 (minimum 2 to pass)**

---

## PHASE D: PROTOTYPE IMPLEMENTATION GUIDE

### D.1 Generate Implementation Guide

Create a markdown file that summarizes the prototype implementation approach:

**Output:** `docs/specs/PROTOTYPE-IMPLEMENTATION-GUIDE.md`

```markdown
# Prototype Implementation Guide

**Generated:** [DATE]
**Platform:** [PLATFORM]
**PRD Count:** [COUNT] flows to implement

## Environment Status

| Check | Status |
|-------|--------|
| Node.js | ✓ v22.x |
| Dependencies | ✓ Installed |
| Foundation Skills | ✓ 6/6 installed |
| Environment Variables | ✓ .env.local present |

## Implementation Order

Based on Step 5 PRDs:

1. **01-auth** - Authentication flow (login, signup, forgot password)
2. **02-onboarding** - User onboarding flow
3. **03-dashboard** - Main dashboard view
4. ...

## Skill Usage Guide

When implementing **UI components**:
→ Use `@frontend-design` for component generation
→ Reference shadcn/ui documentation via MCP

When **debugging issues**:
→ Use `@systematic-debugging` for structured troubleshooting
→ Check TypeScript errors first

When **validating UI**:
→ Use `@browser-verification` for automated checks
→ Or manual visual inspection at localhost:3000

## Ralph Loop Command

After Step 5b generates the backlog:

\`\`\`bash
# Run Ralph Loop on prototype PRDs
sigma ralph --engine claude --backlog docs/ralph/prototype/prd.json
\`\`\`

## Quality Gates

After each PRD implementation:
1. ✓ `npm run lint` passes
2. ✓ `npm run build` succeeds
3. ✓ UI renders at expected route
4. ✓ No console errors

## Next Steps

1. Run `/step-5b-prd-to-json` to convert PRDs to Ralph backlog
2. Run `sigma ralph` to start autonomous implementation
3. Monitor progress in `.sss/ralph-backlog.json`
```

### D.2 Write Guide to File

```bash
# Write the guide
cat > docs/specs/PROTOTYPE-IMPLEMENTATION-GUIDE.md << 'EOF'
[Generated content from above]
EOF
```

**Quality Gate D:**
- [ ] Implementation guide generated
- [ ] Guide includes environment status
- [ ] Guide includes skill usage instructions
- [ ] Guide includes Ralph Loop command

**Score: ___/4 (minimum 3 to pass)**

---

## PHASE E: RALPH LOOP READINESS CHECK

### E.1 Check PRD Files Exist

```bash
# Count PRD files from Step 5
ls docs/prds/flows/*.md 2>/dev/null | wc -l
# Should be >= 1
```

### E.2 Check PRD Format

Each PRD should have the required sections for Ralph Loop:

```bash
# Check for required sections in PRDs
for file in docs/prds/flows/*.md; do
  echo "Checking: $file"
  grep -q "## Tasks" "$file" && echo "  ✓ Tasks section" || echo "  ✗ Missing Tasks section"
  grep -q "## Acceptance Criteria" "$file" && echo "  ✓ AC section" || echo "  ✗ Missing AC section"
  grep -q "## Component Specifications" "$file" && echo "  ✓ Components" || echo "  ✗ Missing Components"
done
```

### E.3 Check Agent Browser (Optional)

```bash
# Check if Agent Browser is installed (for UI validation)
which agent-browser 2>/dev/null && echo "Agent Browser: ✓ Installed" || echo "Agent Browser: Not installed (optional)"
```

### E.4 Ralph Backlog Schema Check

Verify the ralph-backlog schema is available:

```bash
# Check for schema files
ls schemas/ralph-backlog.schema.json 2>/dev/null || ls .sss/schemas/ralph-backlog.schema.json 2>/dev/null
```

### E.5 Generate Readiness Report

```
┌─────────────────────────────────────────────────────────────┐
│              RALPH LOOP READINESS REPORT                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Environment:                                                │
│  ✓ Node.js 22.x                                             │
│  ✓ Dependencies installed                                    │
│  ✓ TypeScript configured                                     │
│                                                              │
│  Foundation Skills:                                          │
│  ✓ frontend-design (Required)                               │
│  ✓ systematic-debugging (Required)                          │
│  ✓ ux-designer (Recommended)                                │
│  ✓ quality-gates (Recommended)                              │
│  ○ browser-verification (Optional - not installed)          │
│                                                              │
│  PRD Status:                                                 │
│  ✓ 5 flow PRDs found in docs/prds/flows/                    │
│  ✓ All PRDs have Tasks section                              │
│  ✓ All PRDs have Acceptance Criteria                        │
│                                                              │
│  Ralph Loop Status:                                          │
│  ✓ Schema available                                          │
│  ✓ CLI ready (sigma ralph)                                  │
│  ○ Backlog not yet generated (run Step 5b)                 │
│                                                              │
│  OVERALL SCORE: 85/100                                       │
│  STATUS: ✓ READY FOR STEP 5b                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Quality Gate E:**
- [ ] At least 1 PRD file exists
- [ ] PRDs have required sections (Tasks, AC)
- [ ] Ralph schema available
- [ ] Overall readiness score >= 70/100

**Score: ___/4 (minimum 3 to pass)**

---

## QUALITY GATE SUMMARY

| Phase | Name | Score | Pass |
|-------|------|-------|------|
| A | Environment Validation | __/5 | ≥4 |
| B | Foundation Skills | __/5 | ≥4 |
| C | Recommended Skills | __/3 | ≥2 |
| D | Implementation Guide | __/4 | ≥3 |
| E | Ralph Loop Readiness | __/4 | ≥3 |
| **TOTAL** | | **__/21** | **≥16 (70%)** |

**Passing Criteria:** Total score ≥ 16 points (70%)

**If Failing:**
1. Review which phases failed
2. Use `--fix` flag to auto-remediate where possible
3. Manually address remaining issues
4. Re-run this step

---

## OUTPUTS

| Artifact | Location | Description |
|----------|----------|-------------|
| Implementation Guide | `docs/specs/PROTOTYPE-IMPLEMENTATION-GUIDE.md` | Summary of environment and skill readiness |
| Readiness Report | Console output | Ralph Loop readiness assessment |

---

## NEXT STEPS

After passing this step:

1. **Run Step 5b:** Convert PRDs to Ralph backlog
   ```bash
   claude "Run step-5b-prd-to-json"
   ```

2. **Start Ralph Loop:** Autonomous implementation
   ```bash
   sigma ralph --engine claude --backlog docs/ralph/prototype/prd.json
   ```

3. **Monitor Progress:** Check backlog status
   ```bash
   cat .sss/ralph-backlog.json | jq '.stories[] | select(.passes == false) | .title'
   ```

---

## TROUBLESHOOTING

### Foundation Skills Not Found

```bash
# Reinstall Foundation Skills
npx sss-protocol install-skills --platform [your-platform]

# Verify installation
ls -la .cursor/rules/sss-*.mdc   # For Cursor
ls -la .claude/skills/           # For Claude Code
```

### PRDs Missing Required Sections

```bash
# Re-run Step 5 with specific flow
claude "Run step-5-wireframe-prototypes --flow auth"
```

### Environment Issues

```bash
# Reset Node modules
rm -rf node_modules package-lock.json
npm install

# Verify TypeScript
npx tsc --noEmit
```
