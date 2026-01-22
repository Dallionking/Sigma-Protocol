# Boilerplate Distribution Guide

## GitHub Repository Setup

### Step 1: Create Standalone Repositories

Create these public repositories:

| Template | Repository Name | URL |
|----------|----------------|-----|
| nextjs-saas | sss-nextjs-starter | `github.com/your-org/sss-nextjs-starter` |
| expo-mobile | sss-expo-starter | `github.com/your-org/sss-expo-starter` |
| nextjs-ai | sss-nextjs-ai | `github.com/your-org/sss-nextjs-ai` |
| nextjs-portable | sss-nextjs-portable | `github.com/your-org/sss-nextjs-portable` |
| tanstack-saas | sss-tanstack-starter | `github.com/your-org/sss-tanstack-starter` |

### Step 2: Configure Deploy Keys

For the GitHub Action to sync to all repos:

1. Generate SSH key pair:
```bash
ssh-keygen -t ed25519 -C "boilerplate-sync" -f boilerplate_deploy_key
```

2. Add public key as deploy key to each boilerplate repo (with write access)

3. Add private key as `BOILERPLATE_DEPLOY_KEY` secret in commands repo

### Step 3: Initial Sync

Run the GitHub Action manually:

1. Go to Actions tab in commands repo
2. Select "Sync Boilerplates" workflow
3. Click "Run workflow"
4. Select "all" for target

### Step 4: Verify Sync

For each boilerplate repo, verify:

- [ ] App code present in root
- [ ] SSS commands in `.cursor/commands/`
- [ ] `.sigma/boilerplate.json` present
- [ ] `scripts/setup.js` present
- [ ] README updated

---

## QA Checklist

### Per-Template Verification

Run these checks for each boilerplate:

#### 1. Clone & Setup Test

```bash
# Clone fresh
git clone https://github.com/your-org/sss-[template].git test-app
cd test-app

# Run setup
npm run setup
# Enter: test-project, Test Project, Test description, Author

# Verify provenance
cat .sigma/boilerplate.json
# Should show project_name: "test-project"
```

#### 2. Install & Build Test

```bash
npm install
npm run build
# Should complete without errors
```

#### 3. Dev Server Test

```bash
npm run dev
# Should start without errors
# Visit localhost:3000 (or appropriate port)
```

#### 4. Lint Test

```bash
npm run lint
# Should complete without errors
```

#### 5. TypeCheck Test

```bash
npm run typecheck
# Should complete without errors
```

#### 6. SSS Commands Test

Verify commands are bundled:

```bash
ls -la .cursor/commands/
# Should show: audit, deploy, dev, generators, marketing, ops, steps, Magic UI
```

Open in Cursor and test:
- [ ] `@step-1-ideation` command works
- [ ] `@security-audit` command works
- [ ] `@holes` command works

---

## Template-Specific QA

### nextjs-saas

- [ ] Auth flows work (login, signup, logout)
- [ ] Theme toggle works
- [ ] Credits hook returns data
- [ ] Subscription hook returns data

### expo-mobile

- [ ] `expo start` launches
- [ ] iOS Simulator runs (macOS)
- [ ] Android Emulator runs
- [ ] Auth hook works
- [ ] RevenueCat hook initializes

### nextjs-ai

- [ ] Convex dev starts
- [ ] Auth works
- [ ] Query subscriptions update in real-time

### nextjs-portable

- [ ] `db:push` works with local Postgres
- [ ] Better Auth initializes
- [ ] Drizzle Studio opens

### tanstack-saas

- [ ] Vinxi dev starts
- [ ] Type-safe routing works
- [ ] Auth flows work

---

## Release Process

### Version Bumping

When updating boilerplates:

1. Update version in `boilerplates/[template]/.sigma/boilerplate.json`
2. Update version in `boilerplates/[template]/package.json`
3. Update IMPLEMENTATION-TRACKER.md
4. Push to main branch
5. GitHub Action syncs automatically

### Changelog

Maintain changelog in each template's README:

```markdown
## Changelog

### 1.1.0 (2025-01-15)
- Added feature X
- Fixed issue Y

### 1.0.0 (2025-12-20)
- Initial release
```

---

## Troubleshooting

### Sync Failed

1. Check GitHub Actions logs
2. Verify deploy key has write access
3. Ensure target repo exists
4. Check for merge conflicts

### Build Failed in Template

1. Run locally: `npm run build`
2. Fix any errors
3. Push fix to commands repo
4. Re-run sync

### Commands Not Bundled

1. Verify files not in `.boilerplate-ignore`
2. Check sync action logs
3. Manually verify source files exist

---

## Monitoring

### Sync Status Dashboard

Create a simple status page or GitHub issue that tracks:

- Last sync date
- Sync success/failure
- Template versions
- Known issues

### User Feedback

Monitor:
- GitHub Issues on template repos
- Discord community feedback
- Clone/star statistics

