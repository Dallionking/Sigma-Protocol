---
name: superdesign-integration
description: "Integrate Superdesign AI Design Agent for rapid UI mockups, wireframes, and component generation. Works with Cursor, Claude Code, VSCode."
version: "1.0.0"
triggers:
  - step-3-ux-design
  - step-5-wireframe-prototypes
  - step-6-design-system
  - step-9-landing-page
  - ui design
  - wireframe generation
  - component design
sources:
  - "https://github.com/superdesigndev/superdesign"
  - "https://app.superdesign.dev/library"
  - "https://github.com/jonthebeef/superdesign-mcp-claude-code"
---

# Superdesign Integration Skill

This skill integrates **[Superdesign](https://superdesign.dev)** — the first open-source AI Design Agent — into the SSS Protocol workflow. Generate UI mockups, wireframes, and components directly from natural language prompts.

## What is Superdesign?

[Superdesign](https://github.com/superdesigndev/superdesign) by [AI Jason](https://x.com/jasonzhou1993) is an open-source design agent that:
- Lives inside your IDE (Cursor, VSCode, Windsurf, Claude Code)
- Generates UI designs from natural language
- Creates multiple variations in parallel ("Why design 1 when you can explore 10?")
- Outputs production-ready HTML/React/Vue components

**GitHub:** [superdesigndev/superdesign](https://github.com/superdesigndev/superdesign) (5.5k+ stars)

---

## Installation Options

### Option 1: VSCode/Cursor Extension (Recommended)

1. Install from marketplace: Search "Superdesign" in Cursor/VSCode extensions
2. Open Superdesign sidebar panel
3. Start prompting

**Prompt Library:** [app.superdesign.dev/library](https://app.superdesign.dev/library)

### Option 2: MCP Server (Claude Code/Advanced)

For deeper integration with Claude Code:

```bash
# Clone the MCP server
git clone https://github.com/jonthebeef/superdesign-mcp-claude-code
cd superdesign-mcp-claude-code
npm install
npm run build
```

Add to `~/.cursor/mcp.json` or Claude Code config:

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
| Tool | Description |
|------|-------------|
| `superdesign_generate` | Generate UI, wireframes, components, logos, icons |
| `superdesign_iterate` | Improve existing designs with feedback |
| `superdesign_extract_system` | Extract design systems from screenshots |
| `superdesign_list` | List all created designs |
| `superdesign_gallery` | Generate interactive HTML gallery |

### Option 3: Chrome Extension (Clone Any Website)

[Superdesign Chrome Extension](https://chromewebstore.google.com/detail/obpjaonipoaomjnokbimppohbpjibflm) - Clone any website UI

---

## Superdesign Capabilities

### 1. Product Mocks
Generate full UI screens from prompts:
```
"Design a modern SaaS dashboard with analytics cards, user activity feed, and dark theme"
```

### 2. UI Components
Create reusable components:
```
"Create a React pricing card component with 3 tiers, toggle for monthly/annual, and CTA buttons"
```

### 3. Wireframes
Low-fidelity layouts for fast iteration:
```
"Wireframe a mobile checkout flow with cart review, shipping form, payment, and confirmation"
```

### 4. Logos & Icons
SVG design generation:
```
"Design a minimalist logo for a fintech startup called 'Quantum'"
```

---

## Integration with SSS Protocol Steps

### Step 3 (UX Design)
Use Superdesign to rapidly prototype user journey screens:

```markdown
## Superdesign Prompt for User Journey

"Generate 5 variations of the [JOURNEY_NAME] flow:
1. [Screen 1 description]
2. [Screen 2 description]
3. [Screen 3 description]

Style: [UI Profile from Step 3]
Theme: [Dark/Light]
Framework: [React/HTML/Vue]"
```

### Step 5 (Wireframe Prototypes)
Generate wireframes for all screens in Flow Tree:

```markdown
## Superdesign Wireframe Generation

For each screen in /docs/flows/SCREEN-INVENTORY.md:

"Create a wireframe for [SCREEN_NAME]:
- Purpose: [screen purpose]
- Entry: [how users arrive]
- Key elements: [list UI elements]
- Actions: [user actions available]

Style: Black and white, minimal
Output: HTML with Tailwind"
```

### Step 6 (Design System)
Extract design tokens from Superdesign outputs:

```markdown
## Design System Extraction

After generating UI mocks, use superdesign_extract_system:
"Extract design system from [design_file.html]:
- Color palette
- Typography scale
- Spacing system
- Border radii
- Shadow definitions

Output: JSON format for CSS variables"
```

### Step 9 (Landing Page)
Generate landing page sections:

```markdown
## Landing Page Generation

"Generate a hero section for [PRODUCT_NAME]:
- Headline: [from Part 3 copy]
- Subheadline: [value prop]
- CTA: [primary action]
- Social proof: [testimonials/logos area]
- Image: [product screenshot placeholder]

Style: Premium, modern
Animation: Subtle fade-in"
```

---

## Prompt Patterns for Superdesign

### Pattern 1: Multi-Variation Generation

```
"Generate 5 variations of [COMPONENT/SCREEN]:
- Variation 1: Minimal, lots of whitespace
- Variation 2: Information-dense, dashboard style
- Variation 3: Playful, rounded corners, bright accents
- Variation 4: Corporate, professional, serif typography
- Variation 5: Dark theme, neon accents

All should include: [required elements]"
```

### Pattern 2: Style Transfer

```
"Design [COMPONENT] in the style of [REFERENCE]:
- Reference: Linear.app / Stripe / Vercel / Notion
- Keep: [elements to preserve]
- Change: [elements to modify]
- Add: [new elements]"
```

### Pattern 3: Responsive Variations

```
"Create responsive variations of [SCREEN]:
- Desktop (1440px): [layout description]
- Tablet (768px): [layout changes]
- Mobile (375px): [layout changes]

Include: Breakpoint annotations, component stacking notes"
```

### Pattern 4: Component Library

```
"Generate a component library for [FEATURE]:
1. Button variants (primary, secondary, ghost, destructive)
2. Input fields (text, email, password, with validation states)
3. Cards (basic, interactive, with image)
4. Modals (confirmation, form, alert)

Style: shadcn-inspired
Framework: React with Tailwind"
```

---

## Design Prompt Resources

### AI Design Prompt Templates Collection
Curated by [@eonist](https://gist.github.com/eonist/166bf55c1c61b99d5712e826c6df0d15):

| Category | Resource |
|----------|----------|
| **shadcn** | [Design Principles](https://gist.github.com/eonist/c1103bab5245b418fe008643c08fa272) |
| **shadcn** | [UI/UX Design System](https://gist.github.com/eonist/ba6ae8f590d909634f9a90a155570f93) |
| **Aceternity** | [UI Design Principles](https://gist.github.com/eonist/f131274670b1481ccfd5eb1450071461) |
| **Apple HIG** | [Guidelines Summary](https://gist.github.com/eonist/f4ba31012815731284d867232f6c70e4) |
| **Apple HIG** | [Typography Guide](https://gist.github.com/eonist/b9c180a67980c6e18a5184f19bff68fa) |
| **Figma** | [Auto Layout Guide](https://gist.github.com/eonist/a54c2edb0bdb705dffd47bd9ed598e90) |
| **Role** | [Senior UX/UI Specialist](https://gist.github.com/eonist/81a138cdb88941478e30bf9890de6918) |

### Superdesign Prompt Library
Community prompts: [app.superdesign.dev/library](https://app.superdesign.dev/library)

---

## File Organization

Superdesign saves files locally:

```
.superdesign/                    # Superdesign workspace
├── design_iterations/           # Generated designs
│   ├── dashboard_v1.html
│   ├── dashboard_v2.html
│   └── login_wireframe.html
└── design_system/              # Extracted design systems
    └── extracted_tokens.json
```

**Integration with SSS Protocol:**
```
/docs/wireframes/               # Step 5 outputs
├── screenshots/                # Visual captures
└── [flow]-wireframes.md        # Documentation

/wireframes/                    # Runnable prototypes (from Superdesign)
└── [flow]/
    ├── index.html
    └── components/
```

---

## Best Practices

### 1. Start with Wireframes
```
Wireframes (low-fidelity) → UI Mocks (high-fidelity) → Components (production)
```

### 2. Use UI Profile from Step 3
Reference your UI Profile when prompting:
```
"Style: Cool Professional palette, Satin Dark depth
Typography: [font from UI Profile]
Colors: [colors from UI Profile]"
```

### 3. Generate Multiple Variations
Always ask for 3-5 variations to explore options.

### 4. Iterate with Feedback
Use `superdesign_iterate` to refine:
```
"Improve this dashboard:
- More whitespace around cards
- Larger typography for headings
- Add subtle shadows for depth"
```

### 5. Extract Before Coding
Use `superdesign_extract_system` to create design tokens before implementation.

---

## Troubleshooting

### Extension Not Loading
```bash
# Restart Cursor/VSCode
# Check extension is enabled
# Open Superdesign sidebar from View menu
```

### MCP Server Issues
```bash
# Check server is running
node dist/index.js

# Verify registration
claude mcp list

# Re-register if needed
claude mcp remove superdesign -s user
claude mcp add --scope user superdesign /path/to/dist/index.js
```

### Designs Not Saving
Check write permissions for `.superdesign/` folder.

---

## Related Resources

- **Superdesign GitHub:** [github.com/superdesigndev/superdesign](https://github.com/superdesigndev/superdesign)
- **Prompt Library:** [app.superdesign.dev/library](https://app.superdesign.dev/library)
- **MCP Server:** [github.com/jonthebeef/superdesign-mcp-claude-code](https://github.com/jonthebeef/superdesign-mcp-claude-code)
- **Discord:** [discord.gg/FYr49d6cQ9](https://discord.gg/FYr49d6cQ9)
- **Twitter:** [@SuperDesignDev](https://x.com/SuperDesignDev)

---

*Superdesign brings "vibe coding" to design. Generate 10 options instead of 1, iterate rapidly, and implement the best.*



