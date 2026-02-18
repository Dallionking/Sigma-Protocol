# Getting Started with Sigma Protocol

A practical guide for non-technical founders who want to turn a product idea into a complete, buildable specification -- using AI.

---

## What You'll Build

Most founders start building too early. They jump straight into code (or tell an AI to start coding) without a clear plan, and end up rewriting things three times. Sigma Protocol fixes that.

It walks you through 13 steps. By the end, you'll have everything a development team (or AI coding tool) needs to build your product -- the first time, the right way. Here's what you'll walk away with:

**A complete product specification** -- think of this as the "blueprint" for your product. It captures your idea, your target users, the problem you're solving, and every feature you want to build. This is what investors, co-founders, and developers will reference to understand your vision.

**System architecture** -- this is the "floor plan" for your product. It shows what pieces exist (database, user accounts, payment system) and how they connect to each other. You don't need to understand the technical details -- the AI handles that. But you'll be able to hand this to any developer and they'll know exactly how to build it.

**UX design and user flows** -- the "user experience map." This documents every screen a user will see, every button they'll tap, and every journey they'll take through your product. It's like a storyboard for your app.

**A design system** -- your product's "style guide." Colors, fonts, spacing, button styles, card layouts. This ensures your product looks consistent and professional, no matter who builds it.

**Technical specifications** -- the engineering details that translate your product vision into developer-ready instructions. Think of it as the construction manual that goes with the floor plan.

**Feature PRDs** -- individual feature specs (PRD stands for "Product Requirements Document"). Each one describes a single feature in enough detail that a developer -- or an AI coding tool -- can build it without guessing. These are the building blocks of your product.

**Optionally: autonomous AI implementation** -- after generating your specs, you can use the Ralph Loop to have AI agents actually build your features, one by one, with no manual coding required.

**Optionally: a landing page** -- if you want to start marketing before you finish building, Step 9 generates persuasive landing page copy with headlines, feature descriptions, and calls to action.

That's 13 steps from "I have an idea" to "I have a complete specification package ready for development."

---

## Before You Start

You need three things:

**An AI coding tool.** Sigma Protocol works with Claude Code (recommended), Codex, Cursor, OpenCode, or Factory Droid. If you don't have one yet, Claude Code is the easiest place to start.

**A product idea.** It can be rough -- even a single sentence like "an app that helps dog walkers find clients." Step 1 will help you refine it through market research and competitive analysis.

**Time.** The full workflow takes 2-4 hours, but you don't have to do it all at once. You can pause after any step and come back later. Your progress is saved as files in your project folder.

No coding experience is required. The AI does the technical work. Your job is to make the business decisions -- and Sigma Protocol will ask you for those decisions at every important moment.

---

## Step-by-Step Guide

Here's what happens at each step. Don't worry about memorizing this -- the AI guides you through it. This is just so you know what to expect.

### Step 0: Environment Setup

**What it does:** Checks that your tools are installed and working correctly.

**What you'll be asked:** Nothing -- this is automatic. The AI verifies your setup and tells you if anything needs fixing.

**What it produces:** A validated environment ready for the workflow. Think of it as the AI doing a pre-flight check before takeoff.

### Step 1: Ideation

**What it does:** Takes your rough idea and turns it into a thorough product specification through research-backed analysis.

**What you'll be asked:** About your product idea, target users, the problem you're solving, and your business model. The AI will research your market, analyze competitors, and present findings for your review.

**What it produces:** A Master PRD -- your product's blueprint. It captures your vision, target audience, key features, competitive advantages, and success metrics. This is the foundation everything else builds on.

### Step 1.5: Offer Architecture (conditional)

**What it does:** If your product involves charging users (subscriptions, one-time purchases, freemium tiers), this step designs your pricing and offer structure.

**What you'll be asked:** About your pricing strategy, what value each tier provides, and how you want to package your offering.

**What it produces:** An offer architecture document that defines your pricing tiers, what's included in each, and the logic behind your monetization strategy. This only runs if your product involves payments -- otherwise it's skipped automatically.

### Step 2: Architecture

**What it does:** Designs the technical structure of your product -- the "floor plan" that shows how all the pieces fit together.

**What you'll be asked:** The AI will present technical options and ask for your preferences on things like: should this be a web app, mobile app, or both? Do you need user accounts? Will you handle payments?

**What it produces:** An architecture document that any developer can read to understand how your product is built. It covers the technology choices, database design, security approach, and how different parts of the system communicate.

### Step 3: UX Design

**What it does:** Maps out the complete user experience -- every screen, every interaction, every journey a user takes through your product.

**What you'll be asked:** About your users' goals, what the most important actions are, and how you want the experience to feel. The AI will research design patterns from successful products in your space.

**What it produces:** A UX design document with user journeys (step-by-step paths through your product), interaction patterns, and emotional design considerations. Think of it as the storyboard for your product's user experience.

### Step 4: Flow Tree and Screen Architecture

**What it does:** Creates a complete inventory of every single screen in your product and maps how they connect to each other.

**What you'll be asked:** To review the screen list and confirm nothing is missing. The AI maps every flow -- login, onboarding, settings, error pages, everything.

**What it produces:** A flow tree (a visual map of your product's screens), a screen inventory (a complete list with names and descriptions), and a transition map (how users move between screens). This ensures nothing gets forgotten when it's time to build.

### Step 5: Wireframe Prototypes (optional)

**What it does:** Creates detailed wireframe specifications for each screen -- layout descriptions, component placements, and interaction notes.

**What you'll be asked:** To review the wireframe specs and approve the layout decisions for key screens.

**What it produces:** Wireframe documents that describe what each screen looks like and how it behaves. These are text-based blueprints that developers use to build the actual UI. If you choose, you can use the Ralph Loop at this point to have AI build a clickable prototype.

### Step 6: Design System

**What it does:** Creates your product's visual identity -- the colors, fonts, spacing, and component styles that make your product look polished and consistent.

**What you'll be asked:** About your brand preferences. Do you want it to feel modern and minimal? Bold and energetic? The AI will research design trends and present options.

**What it produces:** A design system document with exact color codes, font choices, spacing rules, and component specifications. This is your product's style guide -- it ensures every screen looks like it belongs to the same product.

### Step 7: Interface States

**What it does:** Defines what every screen looks like in every possible situation -- not just the "happy path" but also when things are loading, when there's an error, when there's no data yet, and when something succeeds.

**What you'll be asked:** To review the state specifications. The AI identifies every possible state for every screen and asks you to confirm the approach for each.

**What it produces:** A state specification document. This is what separates amateur products from professional ones. Instead of just designing the ideal case, you'll have specs for empty states ("No messages yet"), loading states, error states, and success confirmations.

### Step 8: Technical Specification

**What it does:** Combines everything from the previous steps into one comprehensive development blueprint -- the "construction manual" for your product.

**What you'll be asked:** To review technical decisions. The AI synthesizes your architecture, UX, design system, and states into a single document and asks you to confirm the approach.

**What it produces:** A technical specification that covers API design (how your product's pieces talk to each other), database structure (how your data is stored), authentication (how users log in), and implementation details. This is the most detailed document in the workflow.

### Step 9: Landing Page (optional)

**What it does:** Creates marketing copy and structure for a landing page that sells your product.

**What you'll be asked:** About your ideal customer, their pain points, and what makes your product the solution. The AI researches conversion strategies and builds persuasive copy.

**What it produces:** Landing page copy with headlines, feature descriptions, testimonials structure, call-to-action buttons, and FAQ sections. You can skip this step if you don't need a marketing page yet.

### Step 10: Feature Breakdown

**What it does:** Takes all the features from your product spec and organizes them into buildable chunks with priorities and dependencies.

**What you'll be asked:** To review the priority order and confirm which features should be built first. The AI assesses complexity and dependencies to suggest the smartest build order.

**What it produces:** A feature breakdown document that groups features by priority, estimates their complexity, and maps dependencies (which features need to be built before others). This is your product's construction schedule.

### Step 11: PRD Generation

**What it does:** Creates individual, implementation-ready PRDs for each feature -- detailed enough that a developer or AI coding tool can build directly from them.

**What you'll be asked:** To review each PRD as it's generated. The AI asks for your approval before moving to the next feature.

**What it produces:** A set of feature PRDs (one per feature) in your project's `docs/prds/` folder. Each PRD is a complete specification: what the feature does, how it looks, how it behaves, what data it needs, and how to test it. These are the documents that turn into actual code.

### Step 12: Context Engine

**What it does:** Generates configuration files that teach AI coding tools about your specific project -- your architecture decisions, design patterns, and coding conventions.

**What you'll be asked:** To confirm the generated rules. The AI reads all your previous documents and creates rules that ensure any AI tool building your product stays consistent with your specifications.

**What it produces:** Configuration files for your AI coding tool that inject your project's context. When you (or a developer) uses an AI tool to write code, it will automatically know about your design system, architecture, and conventions.

### Step 13: Skillpack Generator

**What it does:** Creates project-specific AI skills that make your AI coding tool an expert on your particular product.

**What you'll be asked:** To review the generated skills. The AI creates specialized knowledge modules based on your project's unique needs.

**What it produces:** A set of skills tailored to your project -- covering your frontend patterns, backend conventions, and database design. These ensure that AI tools working on your code have deep knowledge of your specific product, not just generic programming knowledge.

---

## Setting Up Your Project

### Option A: Quick Setup (Recommended)

This is the fastest way to get started. Copy the SIGMA-GUIDE.md file into your project and let your AI tool handle the rest.

1. Create a new project folder (or open an existing one)
2. Download `SIGMA-GUIDE.md` from the repository at `https://github.com/dallionking/sigma-protocol`
3. Place it in your project's skills folder:
   - **Claude Code:** `.claude/skills/sigma/SKILL.md`
   - **Cursor:** `.cursor/rules/sigma-guide.mdc`
   - **Codex:** `.codex/skills/sigma/SKILL.md`
   - **OpenCode:** `.opencode/skill/sigma/SKILL.md`
4. Open your AI coding tool and tell it: "I want to use Sigma Protocol to build [your product idea]"

That's it. The AI will read the guide and walk you through the workflow step by step.

### Option B: Full Setup with CLI

For power users who want the complete toolset with additional features like step verification and the Ralph Loop for autonomous implementation.

```bash
curl -fsSL https://raw.githubusercontent.com/dallionking/sigma-protocol/main/install.sh | bash
sigma init my-project
cd my-project
```

This installs the Sigma CLI and scaffolds your project with all the necessary folders and configuration files.

### Verify Your Setup

After either setup option, confirm these things are in place:

- [ ] Your AI coding tool can read the Sigma guide file
- [ ] You can start a conversation with your AI tool and mention "Sigma Protocol" -- it should recognize it
- [ ] Your project folder exists and you can create files in it
- [ ] If using the CLI: running `sigma --version` shows the installed version

If any of these fail, ask your AI tool: "Help me set up Sigma Protocol." It will walk you through troubleshooting.

---

## Running Your First Step

Once your project is set up, starting is simple. Open your AI coding tool and type:

```
Run step 1 ideation for [describe your product idea here]
```

For example: "Run step 1 ideation for a marketplace that connects freelance dog walkers with pet owners in urban areas."

**What to expect:** The AI will begin researching your market. It will look at competitors, analyze trends, and assess the opportunity. This takes a few minutes. Then it will start asking you questions about your vision, users, and business model.

**Checkpoints:** At key moments, the AI will pause and show you what it has so far. It will ask for your approval before continuing. This is where your expertise as the founder matters most.

**How to approve:** Just say "approved" or "looks good" or "continue." If you want changes, explain what you'd like different -- for example, "I want to focus more on the subscription model" or "Add a social feature where walkers can share photos."

**Moving to the next step:** When Step 1 is complete, the AI will tell you. Then just say: "Continue to step 2." The AI picks up where you left off and uses everything from Step 1 as its foundation.

**If you make a mistake or want to change direction:** No problem. You can re-run any step. The AI will regenerate the output based on your new input. Everything downstream will need to be updated too, but the AI handles that -- you just keep moving forward.

**Checking your progress:** After each step, you'll see new files appear in your project's `docs/` folder. These are your deliverables. You can open them in any text editor to review what's been created.

---

## Tips for Non-Technical Founders

**You don't need to understand the code.** The AI generates technical documents, but your role is to make business decisions. Focus on questions like "Is this the right feature?" and "Does this match my vision?" -- not on the technical implementation details.

**The checkpoints are where your expertise matters.** Sigma Protocol pauses at key moments specifically to get your input. When the AI asks for approval, it's asking about business decisions: Is this the right market? Are these the right features? Does this pricing make sense? You are the expert on your product and your users.

**If something sounds too technical, ask the AI to explain.** You can always say "Explain that in simpler terms" or "What does that mean for my product?" The AI will rephrase without jargon. There is no such thing as a dumb question when you're building a product.

**You can pause between steps and come back later.** Every step saves its output as files in your project folder. When you return, the AI reads those files and picks up right where you left off. You don't lose progress. Some founders complete the whole workflow in one afternoon. Others spread it across a week, doing a couple of steps per session.

**Save your files -- they are your product documentation.** The documents generated by Sigma Protocol are yours. Back them up. They represent weeks of product thinking compressed into hours. These files live in your project's `docs/` folder.

**Each step builds on the last, so don't skip ahead.** Step 3 needs Step 2's output. Step 8 needs everything from Steps 1-7. The workflow is designed to be sequential because each step adds a layer of detail that the next step relies on. If you're eager to jump ahead, resist the urge -- the sequential approach is what makes the final output so thorough.

**Don't worry about getting everything perfect on the first pass.** You can always re-run a step if you change your mind about something. The AI will regenerate the outputs based on your updated direction. Early steps are fast to re-run; later steps benefit from the refinement.

**Trust the process.** It might feel like a lot of documents, but every one serves a purpose. When it's time to build, your developer (or AI tool) will thank you for the thoroughness. Founders who have used Sigma Protocol consistently say the same thing: "I can't believe how much clarity I have about my product now."

---

## What Happens After Step 13?

Congratulations -- you have a complete specification package. Here's what you can do with it.

**Option 1: Hand the specs to developers.** Your docs folder now contains everything a development team needs to build your product. The architecture document tells them how to structure the code. The design system tells them how it should look. The feature PRDs tell them exactly what to build, feature by feature. Developers will appreciate the level of detail -- it eliminates the usual back-and-forth of "what did you mean by this?"

**Option 2: Use the Ralph Loop for autonomous AI implementation.** This is where it gets exciting. The Ralph Loop takes your feature PRDs and has AI agents implement them one by one, automatically. You run a single command and the AI builds each feature, verifies it works, and moves on to the next. You review the results and approve.

To use the Ralph Loop after Step 11 or Step 13:

```bash
# Convert your PRDs to a machine-readable format
"Run /prd-json"

# Start autonomous implementation
./ralph/sigma-ralph.sh --workspace=. --mode=implementation
```

The Ralph Loop uses a verify-and-fix cycle: it builds a feature, checks its own work, fixes any issues, and only moves on when everything passes. You don't need to supervise every line of code -- just review the completed features.

**Option 3: Use the specs for pitching and alignment.** Your specification package is also a powerful communication tool. Use the Master PRD for investor presentations. Share the architecture document with potential technical co-founders. Give the feature breakdown to advisors for feedback. These documents prove you've thought deeply about your product.

**The specs are platform-agnostic.** Any developer, using any technology stack, can implement from your Sigma Protocol specifications. The documents describe *what* to build and *how it should work* -- not which specific programming language to use. This gives you maximum flexibility in choosing your development team or platform.

Whether you hire a freelancer, bring on a technical co-founder, use an agency, or continue building with AI tools -- your specification package is the single source of truth that keeps everyone aligned on what you're building and why.

---

## Need Help?

If you get stuck at any point:

- **Ask your AI tool.** It has full context on the Sigma Protocol workflow and can answer questions, explain outputs, or help you troubleshoot.
- **Check the docs.** The [WORKFLOW-OVERVIEW.md](./WORKFLOW-OVERVIEW.md) has detailed information about every step, and [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) is a handy cheat sheet.
- **Re-run a step.** If a step's output doesn't look right, just run it again. The AI will overwrite the previous output with a fresh version based on your updated input.
- **Open an issue.** If you find a bug or have a suggestion, open an issue at `https://github.com/dallionking/sigma-protocol/issues`.

You've got this. The hardest part of building a product isn't the code -- it's the clarity. And that's exactly what Sigma Protocol gives you.
