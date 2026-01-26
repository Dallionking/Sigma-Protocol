---
name: new-project
description: "Scaffold new projects from SSS boilerplate templates with flow-tree driven module selection"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# new-project

**Source:** Sigma Protocol generators module
**Version:** 2.0.0

---


# @new-project (Boilerplate Scaffolding)

**Create new projects from SSS boilerplate templates with flow-tree driven module selection**

## 🎯 Mission

Scaffold production-ready projects from SSS boilerplate templates. Each template includes:
- Complete app code (auth, payments, AI, etc.)
- Bundled SSS commands
- Setup script for customization
- Provenance tracking
- **Flow-tree driven module selection** (NEW)

## 📋 Command Usage

```bash
@new-project
@new-project --template=nextjs-saas
@new-project --template=nextjs-saas --name=my-app
@new-project --template=expo-mobile --directory=~/projects
@new-project --flow-tree=product/flows/flow-tree.json
@new-project --modules=marketing,auth,dashboard,billing
@new-project --skip-setup
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--template` | Template: `nextjs-saas`, `expo-mobile`, `nextjs-ai`, `nextjs-portable`, `tanstack-saas` | Interactive |
| `--name` | Project name (kebab-case) | Interactive |
| `--directory` | Parent directory for project | Current directory |
| `--skip-setup` | Clone only, don't run setup script | `false` |
| `--flow-tree` | Path to flow-tree.json from Step 4 | `product/flows/flow-tree.json` |
| `--modules` | Comma-separated list of modules to include | From flow-tree or all defaults |
| `--platform` | Force platform filter: `web`, `mobile`, `both` | From flow-tree or template |

---

## 📦 Available Templates

| Template | Description | Stack | Platform |
|----------|-------------|-------|----------|
| `nextjs-saas` | Full SaaS starter | Next.js + Supabase + Stripe + AI SDK | web |
| `expo-mobile` | Mobile app starter | Expo + Supabase + RevenueCat | mobile |
| `nextjs-ai` | AI-first app | Next.js + Convex | web |
| `nextjs-portable` | Self-hostable | Next.js + Drizzle + Any Postgres | web |
| `tanstack-saas` | Modern full-stack | TanStack Start + Supabase | web |

---

## 🧩 Module System

### Module Selection Sources (Priority Order)

1. **`--modules` flag** - Explicit list overrides everything
2. **`--flow-tree` JSON** - Reads modules from Step 4 output
3. **Template defaults** - Uses modules with `defaultIncluded: true` in manifest

### Available Modules

| Module ID | Description | Platform | Required |
|-----------|-------------|----------|----------|
| `marketing` | Public marketing pages | web | No |
| `auth` | Authentication flows | both | **Yes** |
| `dashboard` | Core app shell | both | **Yes** |
| `settings` | User settings | both | **Yes** |
| `billing` | Stripe billing | web | No |
| `admin` | Admin panel | web | No |
| `aiChat` | AI chat interface | both | No |
| `crudExample` | Example CRUD module | both | No |
| `onboarding` | First-run experience | both | No |
| `notifications` | In-app notifications | both | No |
| `mobileOnboarding` | Mobile permissions & welcome | mobile | No |
| `purchases` | RevenueCat purchases | mobile | No |
| `errorStates` | Error pages | both | **Yes** |

---

## 🎤 Inputs to Capture

```
Let's create your new project!

1. **Which template?**
   - nextjs-saas (Full SaaS with Supabase + Stripe + AI)
   - expo-mobile (Mobile app with RevenueCat)
   - nextjs-ai (AI-first with Convex)
   - nextjs-portable (Self-hostable with Drizzle)
   - tanstack-saas (TanStack Start + Supabase)

2. **Project name?**
   (kebab-case, e.g., my-awesome-app)

3. **Where to create?**
   (Leave blank for current directory)

4. **Use flow-tree for module selection?**
   - Yes, read from product/flows/flow-tree.json
   - No, use template defaults
   - Custom: specify modules to include
```

---

## 🔄 Execution Flow

### Phase 1: Validation

```typescript
// Validate inputs
function validateProjectName(name: string): boolean {
  const kebabCase = /^[a-z][a-z0-9-]*$/;
  return kebabCase.test(name);
}

function validateTemplate(template: string): boolean {
  const valid = ['nextjs-saas', 'expo-mobile', 'nextjs-ai', 'nextjs-portable', 'tanstack-saas'];
  return valid.includes(template);
}

// Check directory doesn't exist
const projectPath = path.join(directory, projectName);
if (fs.existsSync(projectPath)) {
  throw new Error(`Directory ${projectPath} already exists`);
}
```

### Phase 2: Clone Template

```bash
# Clone from GitHub
git clone https://github.com/your-org/sss-${template}.git ${projectName}

# Navigate to project
cd ${projectName}
```

### Phase 3: Module Selection

```typescript
// Determine which modules to include
function selectModules(
  flowTreePath?: string,
  explicitModules?: string[],
  platform?: 'web' | 'mobile' | 'both'
): string[] {
  // 1. Explicit modules take priority
  if (explicitModules?.length) {
    return validateModules(explicitModules);
  }
  
  // 2. Read from flow-tree.json if exists
  if (flowTreePath && fs.existsSync(flowTreePath)) {
    const flowTree = JSON.parse(fs.readFileSync(flowTreePath));
    const moduleIds = flowTree.modules
      .filter((m: any) => !platform || m.platform === platform || m.platform === 'both')
      .map((m: any) => m.id);
    return moduleIds;
  }
  
  // 3. Use template defaults
  const manifest = loadManifest(template);
  return Object.entries(manifest.modules)
    .filter(([_, config]) => config.enabled)
    .map(([id, _]) => id);
}
```

### Phase 4: Module Pruning

```typescript
// Prune modules not selected
function pruneModules(projectPath: string, selectedModules: string[]) {
  const manifest = loadManifest(template);
  
  for (const [moduleId, config] of Object.entries(manifest.modules)) {
    if (!selectedModules.includes(moduleId) && !config.required) {
      // Remove module files
      for (const file of config.files) {
        const filePath = path.join(projectPath, file);
        if (fs.existsSync(filePath)) {
          fs.rmSync(filePath, { recursive: true });
        }
      }
      
      // Update navigation config
      updateNavigation(projectPath, moduleId, 'remove');
      
      console.log(`  Removed module: ${moduleId}`);
    }
  }
}

// Update sidebar/tabs config after pruning
function updateNavigation(projectPath: string, moduleId: string, action: 'add' | 'remove') {
  // Read nav config
  const navConfigPath = path.join(projectPath, 'src/config/navigation.ts');
  if (!fs.existsSync(navConfigPath)) return;
  
  let content = fs.readFileSync(navConfigPath, 'utf-8');
  
  if (action === 'remove') {
    // Comment out or remove nav items for this module
    const regex = new RegExp(`^.*${moduleId}.*$`, 'gm');
    content = content.replace(regex, (match) => `// PRUNED: ${match}`);
  }
  
  fs.writeFileSync(navConfigPath, content);
}
```

### Phase 5: Update Provenance

```typescript
// Record selected modules in provenance
function updateProvenance(projectPath: string, selectedModules: string[]) {
  const provenancePath = path.join(projectPath, '.sigma', 'boilerplate.json');
  const provenance = JSON.parse(fs.readFileSync(provenancePath, 'utf-8'));
  
  provenance.modules = {
    selected: selectedModules,
    pruned: getAllModules(template).filter(m => !selectedModules.includes(m)),
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(provenancePath, JSON.stringify(provenance, null, 2));
}
```

### Phase 6: Run Setup (unless --skip-setup)

```bash
# Install dependencies
npm install

# Run interactive setup
npm run setup
```

### Phase 7: Verification

```typescript
// Verify provenance file exists
const provenancePath = path.join(projectPath, '.sigma', 'boilerplate.json');
const provenance = JSON.parse(fs.readFileSync(provenancePath));

// Verify SSS commands bundled
const commandsPath = path.join(projectPath, '.cursor', 'commands');
const hasCommands = fs.existsSync(commandsPath);

console.log(`
✅ Project created successfully!

Template: ${provenance.template}
Version: ${provenance.template_version}
Commands: ${hasCommands ? 'Bundled' : 'Missing'}
Modules: ${provenance.modules.selected.join(', ')}
Pruned: ${provenance.modules.pruned.join(', ') || 'None'}

Next: cd ${projectName} && npm run dev
`);
```

---

## 📋 Task List

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NEW PROJECT SCAFFOLDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] 1. Collect project information
    - Template selection
    - Project name
    - Target directory
    - Module selection method

[ ] 2. Validate inputs
    - Name format (kebab-case)
    - Template exists
    - Directory available
    - Flow-tree exists (if specified)

[ ] 3. Clone template
    - Clone from GitHub
    - Verify clone success

[ ] 4. Determine module selection
    - Read flow-tree.json (if exists)
    - OR use explicit --modules
    - OR use template defaults

[ ] 5. Prune unused modules
    - Remove module files
    - Update navigation config
    - Update imports

[ ] 6. Update provenance
    - Record selected modules
    - Record pruned modules
    - Set timestamp

[ ] 7. Run setup script
    - npm install
    - npm run setup (interactive)

[ ] 8. Verification
    - Check provenance file
    - Verify SSS commands bundled
    - List active modules
    - Test npm run dev works

⏸️  COMPLETE: Project ready for development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧩 Module Pruning Details

### What Gets Removed

For each pruned module:
1. **Route files** - Pages/screens for that module
2. **Module folder** - `src/modules/<moduleId>/`
3. **Nav items** - Sidebar/header/tab entries
4. **Related hooks** - If module-specific

### What Stays

- **Core files** - Layout, providers, utilities
- **Required modules** - auth, dashboard, settings, errorStates
- **Dependencies** - Modules that other selected modules depend on

### Example: Prune `aiChat` Module

```bash
# Files removed:
src/app/(app)/chat/
src/modules/ai-chat/
src/hooks/use-chat.ts

# Config updated:
# - Sidebar: AI Chat nav item commented out
# - package.json: ai-sdk deps remain (may be used elsewhere)
```

---

## 🔗 Flow-Tree Integration

### Reading from Step 4 Output

If `product/flows/flow-tree.json` exists:

```json
{
  "modules": [
    { "id": "marketing", "platform": "web", "required": false },
    { "id": "auth", "platform": "both", "required": true },
    { "id": "dashboard", "platform": "both", "required": true },
    { "id": "billing", "platform": "web", "required": false }
  ]
}
```

Generator will:
1. Include: `marketing`, `auth`, `dashboard`, `billing`
2. Prune: `admin`, `aiChat`, `crudExample`, `notifications` (not in flow-tree)

### Creating New Flow-Tree

If no flow-tree exists, generator can create a starter:

```bash
@new-project --template=nextjs-saas --modules=auth,dashboard,billing
# Creates product/flows/flow-tree.json with selected modules
```

---

## 🔗 Template Repositories

| Template | Repository |
|----------|------------|
| nextjs-saas | `github.com/your-org/sss-nextjs-starter` |
| expo-mobile | `github.com/your-org/sss-expo-starter` |
| nextjs-ai | `github.com/your-org/sss-nextjs-ai` |
| nextjs-portable | `github.com/your-org/sss-nextjs-portable` |
| tanstack-saas | `github.com/your-org/sss-tanstack-starter` |

---

## 🎯 Post-Scaffolding Workflow

After scaffolding, continue with SSS methodology:

1. **Step 1** - Refine your product idea
2. **Step 2** - Architecture is pre-decided by template
3. **Step 3-4** - UX/Design and Flow Tree
4. **Step 5** - Reconcile modules if flows changed (see `@step-5-wireframe-prototypes`)
5. **Step 6-12** - Design system, specs, and implementation

The boilerplate handles foundational concerns (auth, payments, AI, etc.), so you can focus on your unique product features.

---

## 🚫 Error Handling

### Git Not Installed

```
❌ Git is required but not found.
Install: https://git-scm.com/downloads
```

### Network Error

```
❌ Failed to clone template.
Check internet connection and try again.
```

### Directory Exists

```
❌ Directory "my-app" already exists.
Choose a different name or delete the existing directory.
```

### Invalid Template

```
❌ Unknown template: "invalid-name"
Available: nextjs-saas, expo-mobile, nextjs-ai, nextjs-portable, tanstack-saas
```

### Invalid Module

```
❌ Unknown module: "invalid-module"
Available: marketing, auth, dashboard, settings, billing, admin, aiChat, crudExample, ...
```

### Flow-Tree Parse Error

```
❌ Failed to parse flow-tree.json
Error: [JSON parse error details]
Check that product/flows/flow-tree.json is valid JSON.
```

---

## 🔗 Related Commands

- `@step-0-environment-setup` - Ensure prerequisites
- `@step-2-architecture` - Architecture decisions (template selection)
- `@step-4-flow-tree` - Generate flow-tree.json for module selection
- `@step-5-wireframe-prototypes` - Reconcile modules as flows evolve
- `@holes` - Gap analysis before building
- `@status` - Check project status

$END$
