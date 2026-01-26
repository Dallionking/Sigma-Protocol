---
name: pptx
description: "Presentation creation, editing, and analysis. Use when working with presentations (.pptx files) for creating slides, modifying content, working with layouts, or adding speaker notes."
version: "1.0.0"
source: "@anthropics/skills"
triggers:
  - presentation-creation
  - slide-generation
  - pitch-deck
  - client-handoff
  - documentation-export
---

# PPTX Skill

Presentation creation, editing, and analysis for PowerPoint files (.pptx).

## When to Invoke

Invoke this skill when:

- Creating new presentations
- Modifying or editing presentation content
- Working with slide layouts
- Adding comments or speaker notes
- Generating pitch decks or client deliverables
- Exporting documentation as presentations

---

## Presentation Creation

### Using PptxGenJS

```javascript
import PptxGenJS from "pptxgenjs";

// Create presentation
const pptx = new PptxGenJS();

// Set metadata
pptx.author = "Sigma Protocol";
pptx.title = "Project Overview";
pptx.subject = "Technical Documentation";

// Define master slide
pptx.defineSlideMaster({
  title: "MAIN",
  background: { color: "FFFFFF" },
  objects: [
    // Header bar
    { rect: { x: 0, y: 0, w: "100%", h: 0.75, fill: { color: "0F172A" } } },
    // Logo placeholder
    { image: { x: 0.5, y: 0.15, w: 1.5, h: 0.45, path: "logo.png" } },
    // Footer
    {
      text: {
        text: "© 2025 Company",
        options: { x: 0.5, y: 7.0, fontSize: 10, color: "666666" },
      },
    },
  ],
});
```

### Creating Slides

```javascript
// Title slide
const titleSlide = pptx.addSlide();
titleSlide.addText("Project Kickoff", {
  x: 0.5,
  y: 2.5,
  w: "90%",
  fontSize: 44,
  bold: true,
  color: "0F172A",
  align: "center",
});
titleSlide.addText("Q1 2025 Initiative", {
  x: 0.5,
  y: 3.5,
  w: "90%",
  fontSize: 24,
  color: "64748B",
  align: "center",
});

// Content slide
const contentSlide = pptx.addSlide({ masterName: "MAIN" });
contentSlide.addText("Agenda", {
  x: 0.5,
  y: 1.0,
  w: "90%",
  fontSize: 32,
  bold: true,
  color: "0F172A",
});
contentSlide.addText(
  [
    { text: "1. Project Overview", options: { bullet: true } },
    { text: "2. Timeline & Milestones", options: { bullet: true } },
    { text: "3. Technical Architecture", options: { bullet: true } },
    { text: "4. Next Steps", options: { bullet: true } },
  ],
  {
    x: 0.5,
    y: 2.0,
    w: "90%",
    fontSize: 18,
    color: "334155",
    lineSpacing: 28,
  },
);
```

### Adding Charts

```javascript
// Bar chart
const chartSlide = pptx.addSlide({ masterName: "MAIN" });
chartSlide.addText("Performance Metrics", {
  x: 0.5,
  y: 1.0,
  w: "90%",
  fontSize: 28,
  bold: true,
});

chartSlide.addChart(
  pptx.ChartType.bar,
  [
    {
      name: "Revenue",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      values: [1200, 1500, 1800, 2100],
    },
    {
      name: "Costs",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      values: [800, 900, 1000, 1100],
    },
  ],
  {
    x: 0.5,
    y: 1.8,
    w: 9,
    h: 4.5,
    showLegend: true,
    legendPos: "b",
    chartColors: ["3B82F6", "EF4444"],
  },
);

// Pie chart
chartSlide.addChart(
  pptx.ChartType.pie,
  [
    {
      name: "Market Share",
      labels: ["Product A", "Product B", "Product C"],
      values: [45, 30, 25],
    },
  ],
  {
    x: 6,
    y: 1.8,
    w: 3.5,
    h: 3.5,
    showPercent: true,
  },
);
```

### Adding Tables

```javascript
const tableSlide = pptx.addSlide({ masterName: "MAIN" });
tableSlide.addText("Feature Comparison", {
  x: 0.5,
  y: 1.0,
  fontSize: 28,
  bold: true,
});

tableSlide.addTable(
  [
    // Header row
    [
      {
        text: "Feature",
        options: { bold: true, fill: { color: "0F172A" }, color: "FFFFFF" },
      },
      {
        text: "Basic",
        options: { bold: true, fill: { color: "0F172A" }, color: "FFFFFF" },
      },
      {
        text: "Pro",
        options: { bold: true, fill: { color: "0F172A" }, color: "FFFFFF" },
      },
      {
        text: "Enterprise",
        options: { bold: true, fill: { color: "0F172A" }, color: "FFFFFF" },
      },
    ],
    // Data rows
    ["Users", "5", "25", "Unlimited"],
    ["Storage", "10 GB", "100 GB", "1 TB"],
    ["Support", "Email", "24/7 Chat", "Dedicated"],
    ["API Access", "❌", "✓", "✓"],
  ],
  {
    x: 0.5,
    y: 1.8,
    w: 9,
    colW: [3, 2, 2, 2],
    border: { pt: 1, color: "E2E8F0" },
    fontFace: "Arial",
    fontSize: 14,
  },
);
```

---

## Slide Templates

### Title Slide

```javascript
function createTitleSlide(pptx, { title, subtitle, date }) {
  const slide = pptx.addSlide();

  // Background gradient effect
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { type: "solid", color: "0F172A" },
  });

  // Title
  slide.addText(title, {
    x: 0.5,
    y: 2.5,
    w: "90%",
    fontSize: 48,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 3.5,
      w: "90%",
      fontSize: 24,
      color: "94A3B8",
      align: "center",
    });
  }

  // Date
  if (date) {
    slide.addText(date, {
      x: 0.5,
      y: 6.5,
      w: "90%",
      fontSize: 14,
      color: "64748B",
      align: "center",
    });
  }

  return slide;
}
```

### Two-Column Layout

```javascript
function createTwoColumnSlide(pptx, { title, leftContent, rightContent }) {
  const slide = pptx.addSlide({ masterName: "MAIN" });

  // Title
  slide.addText(title, {
    x: 0.5,
    y: 1.0,
    w: "90%",
    fontSize: 28,
    bold: true,
    color: "0F172A",
  });

  // Left column
  slide.addText(leftContent, {
    x: 0.5,
    y: 1.8,
    w: 4.25,
    fontSize: 16,
    color: "334155",
    valign: "top",
  });

  // Right column
  slide.addText(rightContent, {
    x: 5.25,
    y: 1.8,
    w: 4.25,
    fontSize: 16,
    color: "334155",
    valign: "top",
  });

  return slide;
}
```

### Image + Text Layout

```javascript
function createImageTextSlide(
  pptx,
  { title, imagePath, text, imageLeft = true },
) {
  const slide = pptx.addSlide({ masterName: "MAIN" });

  slide.addText(title, {
    x: 0.5,
    y: 1.0,
    w: "90%",
    fontSize: 28,
    bold: true,
  });

  const imageX = imageLeft ? 0.5 : 5.25;
  const textX = imageLeft ? 5.25 : 0.5;

  slide.addImage({
    path: imagePath,
    x: imageX,
    y: 1.8,
    w: 4.25,
    h: 4,
  });

  slide.addText(text, {
    x: textX,
    y: 1.8,
    w: 4.25,
    fontSize: 16,
    color: "334155",
    valign: "top",
  });

  return slide;
}
```

---

## Presentation Structure Templates

### Pitch Deck

```javascript
function createPitchDeck(pptx, data) {
  // 1. Title
  createTitleSlide(pptx, {
    title: data.companyName,
    subtitle: data.tagline,
  });

  // 2. Problem
  createContentSlide(pptx, {
    title: "The Problem",
    bullets: data.problems,
  });

  // 3. Solution
  createContentSlide(pptx, {
    title: "Our Solution",
    bullets: data.solutions,
  });

  // 4. Market Size
  createChartSlide(pptx, {
    title: "Market Opportunity",
    chartData: data.marketData,
  });

  // 5. Business Model
  createTwoColumnSlide(pptx, {
    title: "Business Model",
    leftContent: data.revenueStreams,
    rightContent: data.pricing,
  });

  // 6. Traction
  createMetricsSlide(pptx, {
    title: "Traction",
    metrics: data.metrics,
  });

  // 7. Team
  createTeamSlide(pptx, {
    title: "Our Team",
    members: data.team,
  });

  // 8. Ask
  createTitleSlide(pptx, {
    title: `Raising ${data.fundingAmount}`,
    subtitle: data.fundingPurpose,
  });
}
```

### Project Status Report

```javascript
function createStatusReport(pptx, data) {
  // 1. Title with date
  createTitleSlide(pptx, {
    title: "Project Status Report",
    subtitle: data.projectName,
    date: data.reportDate,
  });

  // 2. Executive Summary
  createContentSlide(pptx, {
    title: "Executive Summary",
    bullets: [
      `Status: ${data.overallStatus}`,
      `Timeline: ${data.timelineStatus}`,
      `Budget: ${data.budgetStatus}`,
    ],
  });

  // 3. Accomplishments
  createContentSlide(pptx, {
    title: "This Period's Accomplishments",
    bullets: data.accomplishments,
  });

  // 4. Upcoming Milestones
  createTimelineSlide(pptx, {
    title: "Upcoming Milestones",
    milestones: data.milestones,
  });

  // 5. Risks & Issues
  createTableSlide(pptx, {
    title: "Risks & Issues",
    headers: ["Item", "Impact", "Mitigation"],
    rows: data.risks,
  });

  // 6. Next Steps
  createContentSlide(pptx, {
    title: "Next Steps",
    bullets: data.nextSteps,
  });
}
```

---

## Speaker Notes

```javascript
// Add speaker notes to slide
slide.addNotes(
  "Key talking points:\n\n" +
    "• Emphasize the 40% growth rate\n" +
    "• Mention the new enterprise clients\n" +
    "• Transition to next slide by asking about questions",
);
```

---

## Best Practices

### Design

- Use consistent fonts (2-3 max)
- Limit colors to brand palette
- One main idea per slide
- Use high-quality images (min 150 DPI)
- Leave white space

### Content

- 6x6 rule: Max 6 bullets, 6 words each
- Use visuals over text when possible
- Include speaker notes for context
- Number slides for reference

### Accessibility

- Minimum 24pt font for body text
- High contrast colors
- Alt text for images
- Logical reading order

---

## Integration with Sigma Protocol

### @client-handoff

Generate client-facing presentations from project documentation.

### Pitch Decks

Create investor presentations from business model documentation.

### Status Reports

Export project status as presentation format.

### Documentation

Convert technical docs to presentation format for stakeholders.

---

_Remember: Good presentations tell a story. Each slide should have one clear message that advances the narrative._
