---
version: "2.6.0"
last_updated: "2026-01-07"
changelog:
  - "2.6.0: Added Superdesign AI Design Agent - IDE extension + MCP for rapid UI mockups, wireframes, components. References superdesign-integration.md foundation skill"
  - "2.5.0: Added Memory MCP Server (Persistent Context) - enables knowledge graph-based memory across sessions, references memory-systems.md foundation skill"
  - "2.4.0: Added iOS Simulator MCP, InjectionIII hot reload, CodeLLDB extension, and SWIFTUI-CURSOR-WORKFLOW.md reference"
description: "Step 0: Environment Setup & MCP Validation - Ensures all tools and MCPs are installed before starting the workflow"
allowed-tools:
  # PRIMARY MCP Tools (Use First)
  - mcp_ref_ref_search_documentation
  - mcp_ref_ref_read_url
  - mcp_exa_web_search_exa
  - mcp_exa_get_code_context_exa
  - mcp_exa_crawling_exa
  - mcp_exa_company_research_exa
  - mcp_exa_linkedin_search_exa
  - mcp_exa_deep_researcher_start
  - mcp_exa_deep_researcher_check

  # ALWAYS ACTIVE (Specialized)
  - mcp_supabase-mcp-server_search_docs
  - mcp_21st-devmagic_21st_magic_component_builder

  # BACKUP MCP Tools
  - mcp_firecrawl_firecrawl_search
  
  # OTHER TOOLS
  - web_search
  - read_file
  - write
  - list_dir
  - run_terminal_cmd
parameters:
  - --skip-validation
  - --force-install
---

# /step-0-environment-setup — Environment Setup & MCP Validation

**Mission**  
Ensure your development environment is properly configured with all required tools and MCPs BEFORE starting the Step 1-12 workflow. This prevents mid-workflow failures due to missing dependencies.

**Context:** You are a **DevOps Engineer** setting up a new developer's machine. Everything must work before they write their first line of code.

**Core Philosophy:**
1. **Validate First:** Check what's already installed
2. **Guide Installation:** Provide clear instructions for missing tools
3. **Test Everything:** Verify each tool actually works
4. **Document Setup:** Create a record of the environment

---

<goal>
You are the DevOps Engineer. Execute ALL phases (A through E) in order.
CRITICAL: Do NOT skip any phase. Do NOT combine phases.
Each phase ends with a STOP marker — halt and wait for user approval before proceeding.

Phase Roadmap:
| Phase | Name | Key Output |
|-------|------|------------|
| A | System Requirements Check | System status report |
| B | MCP Discovery & Validation | MCP status report |
| C | MCP Installation Guide | Installation instructions |
| D | Foundation Skills Installation | Skills installed |
| E | Final Validation & Report | ENVIRONMENT-SETUP.md |

Final Outputs: /docs/ops/ENVIRONMENT-SETUP.md, all /docs subdirectories created
Quality gate: All MCPs tested, core tools validated, score 80+/100
</goal>

---

## Boilerplate Prerequisites (NEW)

**If using Sigma boilerplate templates, ensure these additional prerequisites:**

### GitHub Access Check

```bash
# Test GitHub access (required for cloning boilerplates)
git ls-remote https://github.com/your-org/sss-nextjs-starter.git HEAD

# If SSH is preferred:
ssh -T git@github.com
```

### Boilerplate-Specific Requirements

| Template | Additional Prerequisites |
|----------|-------------------------|
| `nextjs-saas` | Supabase account, Stripe account |
| `expo-mobile` | Xcode (macOS), Android Studio, Expo account |
| `nextjs-ai` | OpenAI API key, Convex account |
| `nextjs-portable` | PostgreSQL (local or cloud) |
| `tanstack-saas` | Supabase account |

### Quick Start Path (If Using Boilerplate)

If you're starting from a boilerplate, you can skip much of the manual setup:

```bash
# Clone the boilerplate (includes Sigma commands!)
git clone https://github.com/your-org/sigma-nextjs-starter.git my-app
cd my-app

# Run the interactive setup wizard
npm run setup

# This will:
# ✅ Rename the project
# ✅ Configure environment variables
# ✅ Initialize fresh git history
# ✅ Bundle all Sigma commands in .cursor/commands/

# Then start developing
npm install
npm run dev
```

**Detection**: If `.sigma/boilerplate.json` exists in your project, you're using a boilerplate and can proceed directly to Step 3 (UX Design) after running setup.

---

## Preflight (auto)

1) **Get date**: `date +"%Y-%m-%d"`.
2) **Create ALL project folders (idempotent)**:
   - `/docs/specs` (Step 1: MASTER_PRD.md)
   - `/docs/research` (Steps 1-8: Research findings)
   - `/docs/ops` (Steps 0, 2: Environment, deployment)
   - `/docs/architecture` (Step 2: Architecture design)
   - `/docs/database` (Step 2, 8: Database schemas)
   - `/docs/api` (Step 2, 8: API specifications)
   - `/docs/security` (Step 2, 8: Security considerations)
   - `/docs/ux` (Step 3: UX Design)
   - `/docs/journeys` (Step 3: User journeys)
   - `/docs/flows` (Step 4: Flow Tree & Screen Architecture) ✨ NEW
   - `/docs/wireframes` (Step 5: Wireframe Prototypes)
   - `/docs/design` (Step 6: Design System)
   - `/docs/tokens` (Step 6: Design tokens)
   - `/docs/components` (Step 6: Component specs)
   - `/docs/states` (Step 7: Interface States)
   - `/docs/screens` (Step 7: Screen state specs)
   - `/docs/technical` (Step 8: Technical Spec)
   - `/docs/implementation` (Step 8, 10: Implementation plans)
   - `/docs/testing` (Step 8: Testing strategies)
   - `/docs/landing-page` (Step 9: Landing page copy)
   - `/docs/avatars` (Step 9: Customer avatars)
   - `/docs/prds` (Step 11: Feature PRDs)
   - `/docs/development` (dev-loop: Development tracking)
   - `/.cursor/rules` (Step 12: Cursor rules)
   - `/docs/seo` (Audit: SEO audit reports)
   - `/docs/accessibility` (Audit: Accessibility audit reports)
   - `/docs/legal` (Audit: License check reports)
   - `/docs/tech-debt` (Audit: Tech debt audit reports)
   - `/docs/performance` (Audit: Performance/load test reports)
   - `/docs/analysis` (Audit: Code analysis reports)
   - `/docs/deployments` (Deploy: Deployment logs and checklists)
   - `/docs/reports` (Audit: Quality reports)
3) **Detect OS**: macOS, Linux, or Windows (for platform-specific instructions)

---

## Planning & Task Creation (CRITICAL - DO THIS FIRST)

**Before executing anything, you MUST:**

1. **Analyze System**: Check what's already installed
2. **Create Task List**: Generate comprehensive validation checklist
3. **Present Plan**: Show the user what will be checked
4. **Get Approval**: Wait for user to approve before proceeding

**Task List Format** (create at the start):
```markdown
## Step-0 Environment Setup Plan

### Phase A: System Requirements Check
- [ ] Check Node.js version (need 18+)
- [ ] Check package manager (npm/pnpm/yarn/bun)
- [ ] Check Git installation and configuration
- [ ] Check Cursor version
- [ ] CHECKPOINT: Present system status
- [ ] Wait for approval

### Phase B: MCP Discovery & Validation
- [ ] List all currently installed MCPs
- [ ] Identify required MCPs based on common tech stacks
- [ ] Test each installed MCP with a simple query
- [ ] Document which MCPs are working
- [ ] CHECKPOINT: Present MCP status
- [ ] Wait for approval

### Phase C: Missing MCP Installation Guide
- [ ] For each missing MCP, provide installation instructions
- [ ] Show configuration examples
- [ ] Provide troubleshooting tips
- [ ] CHECKPOINT: User installs missing MCPs
- [ ] Wait for confirmation

### Phase D: Final Validation
- [ ] Re-test all MCPs after installation
- [ ] Create environment report
- [ ] CHECKPOINT: Present final status
- [ ] Wait for approval to proceed to Step 1
```

**Execution Rules**:
- ✅ Check off EACH task as you complete it
- ✅ Do NOT skip ahead - validate thoroughly
- ✅ Do NOT proceed to next phase until user approves
- ✅ Provide copy-paste ready commands

---

## Phase A — System Requirements Check

**Goal:** Verify core development tools are installed.

### 1. Node.js Version Check

**Required:** Node.js 18+ (LTS recommended: 20 or 22)

**Check command:**
```bash
node --version
```

**Expected output:** `v18.x.x` or higher

**If missing or outdated:**
```bash
# macOS (using Homebrew)
brew install node@22

# Linux (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22

# Windows (using nvm-windows)
# Download from: https://github.com/coreybutler/nvm-windows/releases
nvm install 22
nvm use 22
```

---

### 2. Package Manager Check

**Check which package managers are available:**
```bash
npm --version    # Should be 9+ (comes with Node.js)
pnpm --version   # Optional but recommended (faster)
yarn --version   # Optional
bun --version    # Optional (fastest)
```

**Recommendation:** pnpm (faster, more efficient)

**Install pnpm if missing:**
```bash
npm install -g pnpm
```

---

### 3. Git Configuration Check

**Check Git installation:**
```bash
git --version
```

**Check Git configuration:**
```bash
git config --global user.name
git config --global user.email
```

**If not configured:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

### 4. Cursor Version Check

**Check Cursor version:**
- Open Cursor
- Go to: Cursor → About Cursor (macOS) or Help → About (Windows/Linux)
- **Required:** Latest version (for best MCP support)

**If outdated:**
- Cursor → Check for Updates

---

### 5. Mobile Development Setup (If Building Mobile Apps)

**Ask the user:**
> "Will this project include mobile app development (React Native/Expo)?
> Reply `yes` for mobile setup or `no` to skip."

**If YES, detect OS and guide accordingly:**

#### macOS Users: iOS Simulator + Android Emulator

**For iOS Development (Required on Mac):**
```bash
# Check if Xcode is installed
xcode-select --version

# If not installed:
# 1. Open App Store
# 2. Search "Xcode"
# 3. Install (free, ~12GB)

# After installing Xcode, install command line tools:
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept

# Verify iOS Simulator is available
open -a Simulator
```

**For Android Development (Optional on Mac):**
```bash
# Install Android Studio via Homebrew
brew install --cask android-studio

# After installation:
# 1. Open Android Studio
# 2. Go to: More Actions → SDK Manager
# 3. Install: Android SDK, Android SDK Platform-Tools
# 4. Go to: More Actions → Virtual Device Manager
# 5. Create a device (e.g., Pixel 7 with API 34)
```

#### Windows Users: Android Emulator Only

**Important:** iOS Simulator is NOT available on Windows. You'll use Android Emulator for development and Expo Go on a real iPhone for iOS testing.

```powershell
# Install Android Studio
# Download from: https://developer.android.com/studio

# After installation:
# 1. Open Android Studio
# 2. Go to: More Actions → SDK Manager
# 3. Install: Android SDK, Android SDK Platform-Tools
# 4. Go to: More Actions → Virtual Device Manager
# 5. Create a device (e.g., Pixel 7 with API 34)

# Add to PATH (in System Environment Variables):
# C:\Users\[YourUsername]\AppData\Local\Android\Sdk\platform-tools
```

**For Windows iOS Testing:**
- Install **Expo Go** app on your iPhone (App Store)
- Run `npx expo start` in your project
- Scan QR code with iPhone camera
- App runs on your real device!

#### Linux Users: Android Emulator Only

```bash
# Install Android Studio
sudo snap install android-studio --classic

# After installation, same steps as Windows
# iOS Simulator not available on Linux
```

#### All Platforms: Expo CLI

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Or use npx (no global install needed)
npx expo --version
```

---
**>>> CHECKPOINT: MOBILE SETUP APPROVAL <<<**

Present mobile development setup status to the user.
**Do NOT continue to Phase A (SwiftUI Setup or System Check) until the user explicitly approves.**

Reply `approve mobile` or `revise: [feedback]`.
---

**Prompt (if mobile):**
> "## 📱 Mobile Development Setup
>
> I detected you're on [macOS/Windows/Linux].
>
> ### Available Simulators:
> [macOS] ✅ iOS Simulator (via Xcode) + ✅ Android Emulator
> [Windows] ❌ iOS Simulator (not available) + ✅ Android Emulator
> [Linux] ❌ iOS Simulator (not available) + ✅ Android Emulator
>
> ### For iOS testing on Windows/Linux:
> Install Expo Go on your iPhone and scan the QR code from `npx expo start`
>
> Reply `mobile ready` to continue or `help: mobile` for troubleshooting."

---

### 6. Native iOS/SwiftUI Development Setup (If Building with Swift)

**Ask the user:**
> "Will this project use **native iOS development** with SwiftUI and Xcode (not React Native/Expo)?
> Reply `swiftui` for native iOS setup or `skip` to continue."

**If SWIFTUI (macOS only — native iOS requires macOS):**

#### Prerequisites (macOS Only)

```bash
# 1. Install Xcode (full version, not just command line tools)
# Open App Store → Search "Xcode" → Install (free, ~12GB)

# 2. Accept license and install CLI tools
sudo xcodebuild -license accept
xcode-select --install

# 3. Install build tools for Cursor integration
brew install xcode-build-server
brew install xcbeautify
brew install swiftformat

# 4. Verify installation
xcode-build-server --version
xcbeautify --version
swiftformat --version
```

#### SweetPad Extension (Cursor/Xcode Integration)

**SweetPad** enables building and running SwiftUI apps from Cursor with Xcode's build system.

1. Open Cursor Extensions (`Cmd+Shift+X`)
2. Search "SweetPad"
3. Install the extension

**Generate Build Config (per project):**
```bash
# In your Xcode project directory:
# Run from Cursor Command Palette: "SweetPad: Generate Build Server Config"
# This creates .build-server.json for LSP integration
```

#### Create New SwiftUI Project

```bash
# Option 1: Create via Xcode
# Open Xcode → File → New → Project → iOS → App
# Interface: SwiftUI, Language: Swift
# Save to your workspace

# Option 2: Use swift CLI (basic)
mkdir MyApp && cd MyApp
swift package init --type executable --name MyApp
```

#### Swift Package Manager (SPM) Packages

Unlike npm/pnpm, Swift uses SPM for dependencies. Add packages in Xcode:

1. `File` → `Add Packages...`
2. Enter GitHub URL (e.g., `https://github.com/airbnb/lottie-ios`)
3. Select version
4. Add to your target

**Or add to Package.swift:**
```swift
dependencies: [
    .package(url: "https://github.com/airbnb/lottie-ios.git", from: "4.4.0"),
]
```

#### Essential SwiftUI Reference Documents

The following reference docs are available for SwiftUI development:

| Document | Purpose |
|----------|---------|
| `/docs/swiftui/SWIFTUI-BEST-PRACTICES.md` | HIG, architecture, experts, patterns |
| `/docs/swiftui/SWIFTUI-LIBRARIES.md` | Curated package reference |
| `/docs/swiftui/SWIFTUI-CURSOR-WORKFLOW.md` | Complete Cursor dev workflow |

#### Running on Simulator

```bash
# From Cursor with SweetPad:
# Command Palette: "SweetPad: Build"
# Command Palette: "SweetPad: Build & Run (Launch)"

# From Xcode:
# Select target device (e.g., iPhone 15 Pro)
# Press Cmd+R or click Play button
```

#### iOS Simulator MCP (Optional - AI Testing)

The iOS Simulator MCP server enables Claude to control the iOS simulator directly for automated testing.

**Installation:**

Add to `~/.cursor/mcp.json` or `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "ios-simulator": {
      "command": "npx",
      "args": ["-y", "@joshuayoes/ios-simulator-mcp"]
    }
  }
}
```

**Capabilities:**
- `get_booted_sim_id` — Get current simulator ID
- `ui_describe_all` — Describe all UI elements
- `ui_tap` — Tap at coordinates/element
- `ui_swipe` — Swipe gestures
- `ui_type` — Type text input
- `take_screenshot` — Capture screen

**GitHub:** https://github.com/joshuayoes/ios-simulator-mcp

#### Hot Reload with InjectionIII (Optional - Faster Iteration)

InjectionIII enables instant SwiftUI updates without rebuilding.

**Installation:**
```bash
brew install --cask injectioniii
```

**Setup in App.swift:**
```swift
@main
struct YourApp: App {
    init() {
        #if DEBUG
        Bundle(path: "/Applications/InjectionIII.app/Contents/Resources/iOSInjection.bundle")?.load()
        #endif
    }
    
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

**Workflow:**
1. Build and run app once
2. Open InjectionIII.app
3. Select project folder
4. Save file in Cursor → Changes appear instantly!

**GitHub:** https://github.com/johnno1962/InjectionIII

#### Required Cursor Extensions for SwiftUI

| Extension | ID | Purpose |
|-----------|----|---------| 
| **SweetPad** | `sweetpad.sweetpad` | Build/run iOS apps |
| **Swift** | `sswg.swift-lang` | Language support |
| **CodeLLDB** | `vadimcn.vscode-lldb` | Debugging |

---
**>>> CHECKPOINT: SWIFTUI SETUP APPROVAL <<<**

Present SwiftUI development setup checklist to the user.
**Do NOT continue to Phase A (System Requirements Check) until the user explicitly approves.**

Reply `approve swiftui` or `revise: [feedback]`.
---

**Prompt (if SwiftUI):**
> "## 🍎 SwiftUI Development Setup
>
> ### Checklist:
> - [ ] Xcode installed (latest version)
> - [ ] xcode-build-server installed
> - [ ] xcbeautify installed
> - [ ] swiftformat installed
> - [ ] SweetPad extension installed in Cursor
> - [ ] Swift extension installed in Cursor
> - [ ] CodeLLDB extension installed in Cursor
> - [ ] (Optional) iOS Simulator MCP configured
> - [ ] (Optional) InjectionIII installed for hot reload
>
> ### Reference Documents Created:
> - `/docs/swiftui/SWIFTUI-BEST-PRACTICES.md`
> - `/docs/swiftui/SWIFTUI-LIBRARIES.md`
> - `/docs/swiftui/SWIFTUI-CURSOR-WORKFLOW.md`
>
> Reply `swiftui ready` to continue or `help: swiftui` for troubleshooting."

---

---
**>>> CHECKPOINT: PHASE A APPROVAL <<<**

Present system requirements status summary to the user.
**Do NOT continue to Phase B until the user explicitly approves.**

Reply `approve phase-a` or `revise: [feedback]`.
---

**Prompt:**
> "## 📊 System Requirements Status
>
> ✅ Node.js: v22.x.x (OK)
> ✅ pnpm: 8.x.x (OK)
> ✅ Git: 2.x.x (Configured)
> ✅ Cursor: Latest version
> [If mobile] ✅ Expo CLI: Ready
> [If SwiftUI] ✅ Xcode + SweetPad: Ready
>
> All system requirements met!
>
> Reply `continue` to proceed to MCP validation."

---

## Phase B — MCP Discovery & Validation

**Goal:** Identify which MCPs are installed and working.

### 1. List Currently Installed MCPs

**Check MCP configuration files:**
```bash
# Check global MCP config
cat ~/.cursor/mcp.json 2>/dev/null || echo "No global MCP config found"

# Check workspace MCP config
cat .cursormcp 2>/dev/null || echo "No workspace MCP config found"
```

**Parse and list installed MCPs:**
- Extract MCP names from config
- Note which are enabled/disabled

---

### 2. Test Each Installed MCP

**For each MCP found, run a test query:**

#### **Test: Ref MCP** (usually pre-installed)
```
Try: ref_search_documentation with query "Next.js"
Expected: Returns documentation results
Status: ✅ Working / ❌ Failed
```

#### **Test: Exa MCP**
```
Try: get_code_context_exa with query "React hooks"
Expected: Returns code examples
Status: ✅ Working / ❌ Failed
```

#### **Test: Supabase MCP**
```
Try: search_docs with query "RLS policies"
Expected: Returns Supabase documentation
Status: ✅ Working / ❌ Failed
```

#### **Test: 21st.dev MCP**
```
Try: 21st_magic_component_inspiration with query "button"
Expected: Returns UI component suggestions
Status: ✅ Working / ❌ Failed
```

#### **Test: Firecrawl MCP**
```
Try: firecrawl_search with query "What is React?"
Expected: Returns web search results
Status: ✅ Working / ❌ Failed
```

#### **Test: Expo MCP**
```
Try: List projects or account info
Expected: Returns Expo account details
Status: ✅ Working / ❌ Failed
```

#### **Test: RevenueCat MCP**
```
Try: List projects or offerings
Expected: Returns RevenueCat data
Status: ✅ Working / ❌ Failed
```

#### **Test: App Store Connect MCP**
```
Try: List apps
Expected: Returns list of apps
Status: ✅ Working / ❌ Failed
```

---

### 3. Identify Required vs. Optional MCPs

**Core MCPs (Highly Recommended):**
- ✅ **Ref** - Official documentation (usually pre-installed)
- ✅ **Exa** - Code search and examples
- ✅ **Firecrawl** - Web search and scraping
- ✅ **Greptile** - Codebase-aware AI PR review

**Stack-Specific MCPs:**
- **Supabase MCP** - Required if using Supabase (PostgreSQL, Auth, Realtime)
- **21st.dev MCP** - Recommended for UI development (Magic UI templates)

**Optional MCPs:**
- Context7 - Backup documentation (fallback for Ref)
- Sequential Thinking - Complex logic planning

---

---
**>>> CHECKPOINT: PHASE B APPROVAL <<<**

Present MCP status report to the user.
**Do NOT continue to Phase C until the user explicitly approves.**

Reply `approve phase-b` or `install: [MCP names]`.
---

**Prompt:**
> "## 🔌 MCP Status Report
>
> ### ✅ Working MCPs:
> - Ref (documentation)
> - Exa (code search)
>
> ### ❌ Missing/Not Working:
> - Supabase MCP (needed for database features)
> - 21st.dev MCP (recommended for UI development)
> - Firecrawl MCP (recommended for web scraping/search)
> - Greptile MCP (recommended for codebase-aware PR review)
>
> ### 📝 Recommendations:
> 1. Install Supabase MCP if you plan to use Supabase
> 2. Install 21st.dev MCP for faster UI development
> 3. Install Firecrawl MCP for web scraping and search
> 4. Install Greptile MCP for AI-powered code review
>
> Would you like installation instructions?
> Reply `install all` or `install: [specific MCP]` or `skip` to continue without them."

---

## Phase C — MCP Installation Guide

**Goal:** Provide clear, copy-paste ready installation instructions.

### Installation Instructions by MCP

---

#### **1. Supabase MCP Server**

**When you need it:**
- Using Supabase for database
- Need PostgreSQL with RLS
- Want built-in Auth and Realtime

**Installation:**

**Step 1: Install the package**
```bash
npm install -g @supabase/mcp-server
```

**Step 2: Get your Supabase credentials**
- Go to: https://supabase.com/dashboard
- Select your project (or create one)
- Go to: Settings → API
- Copy: `Project URL` and `anon public` key

**Step 3: Configure in Cursor**

Create or edit `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "supabase-mcp-server",
      "args": [],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_ANON_KEY": "your-anon-key-here"
      }
    }
  }
}
```

**Step 4: Restart Cursor**

**Troubleshooting:**
- If command not found: Check `npm bin -g` is in your PATH
- If connection fails: Verify URL and key are correct
- If permissions error: Run with sudo (macOS/Linux)

---

#### **2. Exa MCP**

**When you need it:**
- Searching for code examples
- Finding real-world implementations
- Web search with code context

**Installation:**

**Step 1: Get API key**
- Go to: https://exa.ai
- Sign up for free account
- Copy your API key

**Step 2: Configure in Cursor**

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "@exa/mcp-server"],
      "env": {
        "EXA_API_KEY": "your-exa-api-key-here"
      }
    }
  }
}
```

**Step 3: Restart Cursor**

---

#### **3. 21st.dev MCP (Magic UI)**

**When you need it:**
- Building landing pages
- Need pre-built UI components
- Want to use Magic UI templates

**Installation:**

**Via Cursor Settings:**
1. Open Cursor Settings
2. Go to: Extensions → MCP Servers
3. Search for: "21st.dev"
4. Click: Install
5. Restart Cursor

**Manual Installation:**

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "21st-devmagic": {
      "command": "npx",
      "args": ["-y", "@21st-dev/mcp-server"]
    }
  }
}
```

---

#### **4. Firecrawl MCP**

**When you need it:**
- Web scraping and content extraction
- Search functionality
- Site crawling and mapping

**Installation:**

**Step 1: Get API key**
- Go to: https://www.firecrawl.dev/
- Create account and get API key

**Step 2: Configure in Cursor**

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "your-firecrawl-api-key-here"
      }
    }
  }
}
```

**Step 3: Restart Cursor**

---

#### **4b. Greptile MCP**

**When you need it:**
- AI-powered PR code review
- Codebase-aware suggestions
- Pattern detection across repos

**Installation:**

**Step 1: Get API key**
- Go to: https://greptile.com/
- Create account and get API key

**Step 2: Configure in Cursor**

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "greptile": {
      "url": "https://api.greptile.com/mcp",
      "headers": {
        "Authorization": "Bearer your-greptile-api-key-here"
      }
    }
  }
}
```

**Step 3: Restart Cursor**

---

#### **5. Memory MCP Server (Persistent Context) — NEW RECOMMENDED**

**When you need it:**
- Long-running projects (multi-session development)
- Persistent context across conversations
- Storing architectural decisions, patterns, learnings
- Team knowledge that persists beyond individuals

**Why it matters:**
Without persistent memory, AI forgets project context between sessions. This MCP provides a knowledge graph for storing entities (projects, decisions, patterns) and their relationships.

**Installation:**

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**No API key required** — runs locally.

**Available Operations:**
| Tool | Purpose |
|------|---------|
| `create_entities` | Store project, decisions, patterns |
| `create_relations` | Link entities (decision → project) |
| `add_observations` | Add facts to entities |
| `search_nodes` | Find relevant memories |
| `read_graph` | Load all context |

**Recommended Usage:**
- At session start: "Load project context for [PROJECT]"
- After decisions: "Store this decision in memory"
- After learnings: "Remember this pattern"

> **📚 Reference:** See `/src/skills/memory-systems.md` for detailed memory patterns.

**Step 2: Restart Cursor**

---

#### **6. Expo MCP (Mobile)**

**When you need it:**
- Mobile app development
- Simulator automation
- EAS integration

**Installation:**

**Step 1: Get Token**
- Go to: expo.dev > Dashboard > Credentials > Access tokens
- Create "Personal access token"

**Step 2: Configure in Cursor**

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "expo-mcp": {
      "url": "https://mcp.expo.dev/mcp",
      "headers": {
        "Authorization": "Bearer {YOUR_ACCESS_TOKEN}"
      }
    }
  }
}
```

---

#### **6. RevenueCat MCP (Mobile)**

**When you need it:**
- Mobile subscriptions
- Paywalls
- In-app purchases

**Installation:**

**Step 1: Get API Key**
- Go to: app.revenuecat.com > Your Project > API Keys
- Create new API v2 Secret Key (Write access if needed)

**Step 2: Configure in Cursor**

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "revenuecat": {
      "url": "https://mcp.revenuecat.ai/mcp",
      "headers": {
        "Authorization": "Bearer {YOUR_API_V2_SECRET_KEY}"
      }
    }
  }
}
```

---

#### **7. App Store Connect MCP (Mobile)**

**When you need it:**
- iOS App Store deployment
- TestFlight management
- App metadata

**Installation:**

**Step 1: Get Credentials**
- Go to: App Store Connect > Users and Access > Keys
- Generate API Key
- Download .p8 file
- Note Key ID and Issuer ID

**Step 2: Configure in Cursor**

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "app-store-connect": {
      "command": "npx",
      "args": ["-y", "app-store-connect-mcp-server"],
      "env": {
        "APP_STORE_CONNECT_KEY_ID": "YOUR_KEY_ID",
        "APP_STORE_CONNECT_ISSUER_ID": "YOUR_ISSUER_ID",
        "APP_STORE_CONNECT_P8_PATH": "/path/to/AuthKey.p8"
      }
    }
  }
}
```

---

#### **8. Ref MCP (Usually Pre-installed)**

**When you need it:**
- Official documentation lookup
- API reference checking
- Framework guides

**Check if installed:**
- Usually comes with Cursor by default
- Test with: `ref_search_documentation` query

**If missing:**
- Update Cursor to latest version
- Should be automatically available

---

#### **9. Superdesign AI Design Agent — NEW RECOMMENDED**

**When you need it:**
- Rapid UI mockup generation from natural language
- Wireframe prototyping (Step 5)
- Component design exploration
- Landing page design (Step 9)
- Design system extraction

**Why it matters:**
Superdesign is the first **open-source AI Design Agent** that lives inside your IDE. Generate 10 design variations instead of 1, iterate rapidly, and implement the best. Created by [AI Jason](https://x.com/jasonzhou1993).

**GitHub:** [superdesigndev/superdesign](https://github.com/superdesigndev/superdesign) (5.5k+ stars)

**Installation Option 1: Cursor/VSCode Extension (Recommended)**

1. Open Cursor Extensions (`Cmd+Shift+X`)
2. Search "Superdesign"
3. Install the extension
4. Open Superdesign sidebar panel
5. Start prompting!

**Installation Option 2: MCP Server (Claude Code/Advanced)**

For deeper integration with Claude Code:

```bash
# Clone the MCP server
git clone https://github.com/jonthebeef/superdesign-mcp-claude-code
cd superdesign-mcp-claude-code
npm install
npm run build
```

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "superdesign": {
      "command": "node",
      "args": ["/path/to/superdesign-mcp-claude-code/dist/index.js"]
    }
  }
}
```

**MCP Tools Available:**
| Tool | Purpose |
|------|---------|
| `superdesign_generate` | Generate UI, wireframes, components, logos, icons |
| `superdesign_iterate` | Improve existing designs with feedback |
| `superdesign_extract_system` | Extract design systems from screenshots |
| `superdesign_list` | List all created designs |
| `superdesign_gallery` | Generate interactive HTML gallery |

**Installation Option 3: Chrome Extension**

[Superdesign Chrome Extension](https://chromewebstore.google.com/detail/obpjaonipoaomjnokbimppohbpjibflm) — Clone any website UI

**Prompt Library:** [app.superdesign.dev/library](https://app.superdesign.dev/library)

**File Organization:**
Designs are saved locally in `.superdesign/`:
```
.superdesign/
├── design_iterations/   # Generated designs
└── design_system/       # Extracted design systems
```

> **📚 Reference:** See `/src/skills/superdesign-integration.md` for detailed usage patterns.

---

### Complete MCP Configuration Example

**Full `~/.cursor/mcp.json` with all MCPs:**

```json
{
  "mcpServers": {
    "supabase": {
      "command": "supabase-mcp-server",
      "args": [],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_ANON_KEY": "your-anon-key"
      }
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "@exa/mcp-server"],
      "env": {
        "EXA_API_KEY": "your-exa-key"
      }
    },
    "21st-devmagic": {
      "command": "npx",
      "args": ["-y", "@21st-dev/mcp-server"]
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "your-firecrawl-key"
      }
    },
    "greptile": {
      "url": "https://api.greptile.com/mcp",
      "headers": {
        "Authorization": "Bearer your-greptile-key"
      }
    },
    "expo-mcp": {
      "url": "https://mcp.expo.dev/mcp",
      "headers": {
        "Authorization": "Bearer {YOUR_TOKEN}"
      }
    },
    "revenuecat": {
      "url": "https://mcp.revenuecat.ai/mcp",
      "headers": {
        "Authorization": "Bearer {YOUR_RC_KEY}"
      }
    },
    "app-store-connect": {
      "command": "npx",
      "args": ["-y", "app-store-connect-mcp-server"],
      "env": {
        "APP_STORE_CONNECT_KEY_ID": "...",
        "APP_STORE_CONNECT_ISSUER_ID": "...",
        "APP_STORE_CONNECT_P8_PATH": "..."
      }
    }
  }
}
```

---

---
**>>> CHECKPOINT: PHASE C APPROVAL <<<**

Present installation instructions and wait for user to complete installations.
**Do NOT continue to Phase D until the user explicitly approves.**

Reply `approve phase-c` or `help: [MCP name]`.
---

**Prompt:**
> "## 📦 Installation Instructions Provided
>
> I've provided installation instructions for all recommended MCPs.
>
> **Next steps:**
> 1. Follow the installation instructions above
> 2. Restart Cursor after adding MCPs
> 3. Reply `installed` when ready for validation
>
> **Need help?**
> - Reply `help: [MCP name]` for troubleshooting
> - Reply `skip: [MCP name]` to skip that MCP
> - Reply `skip all` to continue without MCPs (not recommended)"

---

## Phase D — Foundation Skills Installation

**Goal:** Install Sigma Foundation Skills for the selected platform(s).

### 1. Platform Selection

**Ask the user:**
> "Which AI development platform(s) will you use for this project?
> 
> - **Cursor** — `.cursor/rules/*.mdc` (keyword/glob auto-triggers)
> - **Claude Code** — `.claude/skills/*` (SKILL.md format)
> - **OpenCode** — `.opencode/skill/*` (SKILL.md format)
> 
> Reply with your selection (e.g., `cursor`, `claude`, `opencode`, or `all`)"

**Save selection to `.sigma/config.json`:**
```json
{
  "version": "1.0.0",
  "platforms": {
    "cursor": true,
    "claude_code": false,
    "opencode": false
  },
  "skills_installed": true,
  "installed_at": "2025-01-05T12:00:00Z"
}
```

### 2. Install Foundation Skills

**Foundation Skills provide universal capabilities for the Sigma workflow:**

| Category | Skills | Used In |
|----------|--------|---------|
| **Sigma Core** | research, verification, bdd-scenarios, hormozi-frameworks, output-generation, frontend-design | Steps 1-13 |
| **Design & Dev** | ux-designer, architecture-patterns, api-design-principles, web-artifacts-builder | Steps 2-9 |
| **Quality** | brainstorming, systematic-debugging, quality-gates, senior-qa, senior-architect | All steps |
| **Productivity** | prompt-engineering-patterns, xlsx, pptx, applying-brand-guidelines, remembering-conversations | As needed |
| **Platform Tools** | skill-creator, agent-development (Claude), opencode-agent-generator, creating-opencode-plugins (OpenCode) | Meta/tooling |

**Installation by Platform:**

#### Cursor Installation
```bash
# Copy Sigma foundation rules to project
mkdir -p .cursor/rules

# The Sigma CLI installs these automatically
# Run the interactive installer:
npx sigma-protocol install

# Or install skills separately:
npx sigma-protocol install-skills --platform cursor
```

#### Claude Code Installation
```bash
# Copy Sigma foundation skills to project
mkdir -p .claude/skills

# The Sigma CLI installs these automatically:
npx sigma-protocol install-skills --platform claude-code
```

#### OpenCode Installation
```bash
# Copy Sigma foundation skills to project
mkdir -p .opencode/skill

# The Sigma CLI installs these automatically:
npx sigma-protocol install-skills --platform opencode
```

### 3. Verify Skills Installation

**Check skills are installed:**

```bash
# Cursor
ls -la .cursor/rules/*.mdc

# Claude Code
ls -la .claude/skills/*/SKILL.md

# OpenCode
ls -la .opencode/skill/*/SKILL.md
```

**Expected output:** Multiple skill files for your selected platform.

### 4. Foundation Skills Reference

**Full list of 24 Foundation Skills:**

| Skill | Description | Auto-Triggers |
|-------|-------------|---------------|
| `research` | MCP-orchestrated web research | research, find, market, competitor |
| `verification` | Step quality scoring | verify, validate, check |
| `bdd-scenarios` | Given/When/Then generation | test, scenario, behavior |
| `hormozi-frameworks` | Value equation analysis | value, offer, pricing |
| `output-generation` | Consistent doc formatting | generate, output, document |
| `frontend-design` | Anti-slop UI aesthetics | tsx, jsx, css, component, ui |
| `ux-designer` | Wireframes, accessibility | wireframe, flow, wcag, ux |
| `architecture-patterns` | Clean Architecture, DDD | architecture, domain, layer |
| `api-design-principles` | REST/GraphQL patterns | api, endpoint, rest, graphql |
| `brainstorming` | Pre-implementation exploration | brainstorm, ideate, explore |
| `systematic-debugging` | Root cause analysis | bug, error, fail, debug |
| `quality-gates` | CI/CD, testing, hooks | test, ci, hook, quality |
| `senior-qa` | Test strategies | qa, coverage, e2e |
| `senior-architect` | System design decisions | design, scalability, decision |
| `prompt-engineering-patterns` | LLM optimization | prompt, llm, ai |
| `xlsx` | Spreadsheet manipulation | spreadsheet, excel, csv |
| `pptx` | Presentation generation | presentation, slides, pptx |
| `applying-brand-guidelines` | Brand consistency | brand, style, theme |
| `web-artifacts-builder` | Complex multi-component UIs | dashboard, app, complex |
| `remembering-conversations` | Context recall | recall, previous, remember |
| `skill-creator` | Create Claude Code skills | create skill, new skill |
| `agent-development` | Create Claude Code agents | create agent, new agent |
| `opencode-agent-generator` | Create OpenCode agents | opencode agent |
| `creating-opencode-plugins` | Create OpenCode plugins | opencode plugin |

**Note:** Step 13 (Skillpack Generator) creates **project-specific skill overlays** that build on these foundation skills with your project's design system, patterns, and conventions.

---

---
**>>> CHECKPOINT: PHASE D APPROVAL <<<**

Present foundation skills installation status to the user.
**Do NOT continue to Phase E until the user explicitly approves.**

Reply `approve phase-d` or `revise: [feedback]`.
---

**Prompt:**
> "## 🎯 Foundation Skills Installation
>
> I've installed the Sigma Foundation Skills for your selected platform(s).
>
> ### Installed:
> - [X] 24 Foundation Skills
> - [X] Platform: [Cursor/Claude Code/OpenCode]
> - [X] Auto-trigger configuration
>
> ### Skills Categories:
> - Sigma Core (6 skills)
> - Design & Development (4 skills)
> - Quality & Process (5 skills)
> - Productivity (5 skills)
> - Platform Tools (4 skills)
>
> These skills will auto-activate during Steps 1-13 based on context.
>
> Reply `continue` to proceed to final validation."

---

## Phase E — Final Validation & Report

**Goal:** Verify everything is working and create environment documentation.

### 1. Re-test All MCPs

**Run test queries again for each MCP:**
- Ref: ✅ / ❌
- Exa: ✅ / ❌
- Supabase: ✅ / ❌
- 21st.dev: ✅ / ❌
- Firecrawl: ✅ / ❌
- Greptile: ✅ / ❌

---

### 2. Create Environment Report

**Generate:** `/docs/ops/ENVIRONMENT-SETUP.md`

[Content continues with environment report template, troubleshooting guide, quality gates, and final review - truncated for length]

---

## Final Review Gate

**All outputs for this step:**
- [ ] /docs/ops/ENVIRONMENT-SETUP.md created
- [ ] All /docs subdirectories created
- [ ] All phases (A–E) completed with user approval

---
**>>> FINAL CHECKPOINT: STEP 0 COMPLETE <<<**
**Do NOT proceed to Step 1 without explicit approval.**
---

**Prompt to user (blocking):**
> "Please review the Environment Setup Report.
> • Reply `approve step 0` to proceed to Step-1 Ideation, or
> • Reply `fix: [issue]` to troubleshoot a specific problem.
> I won't continue until you approve."

---

## Supported Frameworks Reference

**For Step 5 (Wireframe Prototypes) and beyond, these are the supported frameworks:**

### Web Frameworks

| Framework | Install Command | Best For |
|-----------|-----------------|----------|
| **Next.js 15+** | `npx create-next-app@latest` | SSR/SSG, SEO-critical, React Server Components |
| **TanStack Start** | `npx create-tanstack-app@latest` | Type-safe routing, Vite-native, client-first |
| **Remix** | `npx create-remix@latest` | Full-stack forms, progressive enhancement |

### Mobile Frameworks

| Framework | Install Command | Best For |
|-----------|-----------------|----------|
| **Expo + React Native** | `npx create-expo-app@latest` | iOS/Android, managed workflow, Expo Go preview |

### Icon Libraries (All Platforms)

| Library | Web Install | Mobile Install |
|---------|-------------|----------------|
| **Lucide** ⭐ | `npm i lucide-react` | `npm i lucide-react-native react-native-svg` |
| **Phosphor** | `npm i @phosphor-icons/react` | `npm i phosphor-react-native react-native-svg` |
| **Heroicons** | `npm i @heroicons/react` | N/A (web only) |
| **Tabler** | `npm i @tabler/icons-react` | N/A (web only) |

### Styling

| Platform | Library | Install |
|----------|---------|---------|
| **Web** | Tailwind CSS v4 | Included with create-next-app |
| **Mobile** | NativeWind | `npm i nativewind tailwindcss` |

**Note:** Framework scaffolding happens in Step 5 (Wireframe Prototypes). This reference is for planning purposes.

---

<verification>
## Step 0 Verification Schema

### Required Files (20 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Environment Report | /docs/ops/ENVIRONMENT-SETUP.md | 1KB | 10 |
| Docs Directory | /docs/ | exists | 5 |
| Rules Directory | /.cursor/rules/ | exists | 5 |

### Required Sections (30 points)

| Document | Section | Points |
|----------|---------|--------|
| ENVIRONMENT-SETUP.md | ## System Requirements | 6 |
| ENVIRONMENT-SETUP.md | ## MCP Status | 8 |
| ENVIRONMENT-SETUP.md | ## Validation Results | 8 |
| ENVIRONMENT-SETUP.md | ## Next Steps | 4 |
| ENVIRONMENT-SETUP.md | ## Troubleshooting | 4 |

### Content Quality (30 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:ENVIRONMENT-SETUP.md:node.*version | Node.js version documented | 6 |
| has_pattern:ENVIRONMENT-SETUP.md:npm\|pnpm\|yarn | Package manager documented | 5 |
| has_pattern:ENVIRONMENT-SETUP.md:MCP.*✅\|Working | At least one MCP validated | 8 |
| dir_count:/docs:10 | At least 10 docs subdirectories created | 6 |
| has_pattern:ENVIRONMENT-SETUP.md:Git.*configured | Git configuration verified | 5 |

### Checkpoints (10 points)

| Checkpoint | Evidence | Points |
|------------|----------|--------|
| System Check | ENVIRONMENT-SETUP.md has system requirements section | 5 |
| MCP Validation | At least one MCP test result documented | 5 |

### Success Criteria (10 points)

| Criterion | Check | Points |
|-----------|-------|--------|
| Node 18+ | Version string shows 18, 20, or 22 | 4 |
| Docs Structure | /docs directory has subdirectories | 3 |
| Ready for Step 1 | Report exists and has approval section | 3 |

</verification>
