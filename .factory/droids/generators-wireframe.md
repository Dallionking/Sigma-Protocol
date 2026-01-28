---
name: wireframe
description: "Redirects to Step 5 for wireframe prototyping (replaces legacy HTML wireframe generation)"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# wireframe

**Source:** Sigma Protocol generators module
**Version:** 2.0.0

---


# @wireframe — Visual Prototyping (Redirects to Step 5)

**Status:** This command has been superseded by **Step 5 (Wireframe Prototypes)**.

---

## 🎯 What Changed?

**Old Approach (Deprecated):**
- Generated basic HTML wireframes from PRDs
- Static, non-interactive prototypes
- Limited visual fidelity
- No design iteration workflow

**New Approach (Step 5):**
- Creates runnable UI prototypes with Design DNA
- Interactive, high-fidelity designs using component libraries
- Includes Magic UI templates for landing pages
- Exports production-quality components + screenshots
- Informs design system (Step 6) and PRD generation (Step 11)

---

## 🚀 How to Use Visual Prototyping Now

### Option 1: Run Step 5 (Recommended)

If you haven't run Step 5 yet:

```bash
@step-5-wireframe-prototypes
```

This will:
1. Select Design DNA archetype for your project
2. Create runnable UI prototypes with component libraries
3. Build landing page wireframe using Magic UI templates
4. Export screenshots and component inventory
5. Create integration map for production

### Option 2: Review Existing Wireframe Exports

If you've already completed Step 5:

**Check these folders:**
- **Screen PRDs:** `/docs/wireframes/screen-prds/`
- **Screenshots:** `/docs/wireframes/screenshots/`
- **Landing Page:** `/docs/wireframes/LANDING-PAGE-WIREFRAME.md`
- **Summary:** `/docs/wireframes/PROTOTYPE-SUMMARY.md`

**Run the prototype:**
```bash
cd wireframes && npm run dev
```

### Option 3: Skip Visual Prototyping

If you want to skip prototyping:

1. Proceed directly to **Step 6 (Design System)** without visual prototyping
2. Design system will be created from scratch using research and best practices
3. You can still use the old wireframe approach (see Legacy section below)

---

## 📚 Documentation

**For full wireframe workflow, see:**
- **Step 5 Command:** `.cursor/commands/steps/step-5-wireframe-prototypes`
- **Design DNA Guide:** In Step 5 command file
- **Magic UI Templates:** `.cursor/commands/Magic UI/`

---

## 🔧 Legacy Wireframe Generation (Fallback)

If you need the old HTML wireframe generation (not recommended):

### Legacy Process
1. Read Frontend PRD
2. Generate single-file HTML with Tailwind CDN
3. Save to `/docs/wireframes/[feature-name].html`
4. Open in browser for review

**Note:** This approach is deprecated. Use Step 3.5 for better results.

**Legacy Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Feature Name] - Wireframe</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <!-- Basic wireframe structure -->
    <div class="container mx-auto p-8">
        <h1 class="text-3xl font-bold mb-4">[Feature Name]</h1>
        <!-- Add basic components here -->
    </div>
</body>
</html>
```

---

## 🎯 Recommendation

**Use Step 5 for:**
- ✅ High-fidelity visual prototypes with Design DNA
- ✅ Runnable Next.js/React Native demos
- ✅ Magic UI templates for landing pages
- ✅ Production-quality exports
- ✅ Design system foundation

**Use legacy wireframes for:**
- ⚠️ Quick mockups (if component libraries unavailable)
- ⚠️ Simple validation (not for production)

---

## 🔗 Next Steps

1. **If starting new project:** Run `@step-3-ux-design` → `@step-4-flow-tree` → `@step-5-wireframe-prototypes`
2. **If mid-project:** Review existing wireframe exports or run Step 5 now
3. **If skipping wireframes:** Proceed to `@step-6-design-system`

**Questions?** See `.cursor/commands/steps/step-5-wireframe-prototypes`
