---
name: agentation
description: "Use when implementing visual feedback UI, human-in-the-loop review interfaces, or DOM-based annotation systems. Bridges visual elements to code locations."
version: 1.0.0
triggers:
  - visual feedback
  - HITL
  - DOM annotation
  - UI feedback
  - progress indicator
  - visual review
  - inline annotation
  - code location mapping
---

# Agentation Skill

DOM-based visual feedback injection for human-in-the-loop (HITL) workflows. This skill enables AI agents to communicate progress, validation states, and code context directly through the UI, creating a bridge between visual elements and their source code locations.

---

## Core Concept

Agentation injects temporary visual feedback into the DOM that:

1. **Maps visual elements to code locations** - Every annotation references a specific file, line, and column
2. **Enables human review with context** - Reviewers see AI work alongside the exact code that generated it
3. **Supports iterative refinement** - Feedback persists only during the review session
4. **Maintains separation of concerns** - Feedback layer is completely independent of application code

```
Application UI
+-------------------------------------------------------------+
|  Component                                                   |
|  +-------------------------------------------------------+  |
|  | [Annotation Overlay]                                  |  |
|  |  "AI modified this button"                            |  |
|  |  src/components/Button.tsx:42:5                       |  |
|  +-------------------------------------------------------+  |
|  +-------------------------------------------------------+  |
|  | [Progress Bar]                                        |  |
|  |  80% - Implementing feature                           |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

---

## Capabilities

### 1. Visual Selectors

Highlight specific DOM elements with contextual information:

```typescript
// agentation/selectors.ts
export interface VisualSelector {
  // CSS selector to target element
  selector: string;
  // Source code location
  source: {
    file: string;
    line: number;
    column?: number;
  };
  // Visual style
  style: 'highlight' | 'outline' | 'badge' | 'tooltip';
  // Annotation content
  annotation?: string;
}

export function highlightElement(config: VisualSelector): void {
  if (process.env.NODE_ENV !== 'development') return;

  const element = document.querySelector(config.selector);
  if (!element) return;

  // Create overlay using safe DOM methods
  const overlay = document.createElement('div');
  overlay.className = 'agentation-overlay';
  overlay.dataset.source = `${config.source.file}:${config.source.line}`;

  // Build badge using safe DOM construction
  const badge = document.createElement('div');
  badge.className = 'agentation-badge';

  const icon = document.createElement('span');
  icon.className = 'agentation-icon';
  icon.textContent = 'AI';

  const text = document.createElement('span');
  text.className = 'agentation-text';
  text.textContent = config.annotation || 'Modified';

  const source = document.createElement('code');
  source.className = 'agentation-source';
  source.textContent = `${config.source.file}:${config.source.line}`;

  badge.appendChild(icon);
  badge.appendChild(text);
  badge.appendChild(source);
  overlay.appendChild(badge);

  const rect = element.getBoundingClientRect();
  overlay.style.cssText = `
    position: fixed;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    pointer-events: none;
    z-index: 99999;
  `;

  document.body.appendChild(overlay);
}
```

### 2. Context Injection

Pass exact code location to the feedback context:

```typescript
// agentation/context.ts
export interface CodeContext {
  file: string;
  line: number;
  column: number;
  snippet: string;
  modification: 'added' | 'modified' | 'removed';
  confidence: number;
}

export interface AgentationContext {
  sessionId: string;
  timestamp: number;
  agent: string;
  task: string;
  changes: CodeContext[];
}

// Inject context into DOM for retrieval
export function injectContext(context: AgentationContext): void {
  if (process.env.NODE_ENV !== 'development') return;

  const script = document.createElement('script');
  script.type = 'application/json';
  script.id = 'agentation-context';
  script.textContent = JSON.stringify(context);
  document.head.appendChild(script);
}

// Retrieve context for analysis
export function getContext(): AgentationContext | null {
  const script = document.getElementById('agentation-context');
  if (!script) return null;
  try {
    return JSON.parse(script.textContent || '{}');
  } catch {
    return null;
  }
}
```

### 3. Feedback Types

```typescript
// agentation/feedback.ts

// Progress bar for long-running operations
export function showProgress(options: {
  taskId: string;
  label: string;
  progress: number; // 0-100
  status: 'running' | 'paused' | 'complete' | 'error';
}): void {
  if (process.env.NODE_ENV !== 'development') return;

  let container = document.getElementById('agentation-progress');
  if (!container) {
    container = document.createElement('div');
    container.id = 'agentation-progress';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1a1a2e;
      border: 1px solid #4a4a6a;
      border-radius: 8px;
      padding: 12px 16px;
      min-width: 280px;
      z-index: 99999;
      font-family: system-ui, sans-serif;
      color: #e0e0e0;
    `;
    document.body.appendChild(container);
  }

  // Clear existing content safely
  container.replaceChildren();

  const statusColors: Record<string, string> = {
    running: '#4CAF50',
    paused: '#FFC107',
    complete: '#2196F3',
    error: '#f44336'
  };

  // Build progress UI using safe DOM methods
  const header = document.createElement('div');
  header.style.cssText = 'font-size: 12px; margin-bottom: 8px; opacity: 0.7;';
  header.textContent = 'Agentation Progress';

  const labelEl = document.createElement('div');
  labelEl.style.cssText = 'font-weight: 500; margin-bottom: 8px;';
  labelEl.textContent = options.label;

  const progressTrack = document.createElement('div');
  progressTrack.style.cssText = 'background: #2a2a4e; border-radius: 4px; overflow: hidden; height: 8px;';

  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    width: ${Math.min(100, Math.max(0, options.progress))}%;
    height: 100%;
    background: ${statusColors[options.status] || '#4CAF50'};
    transition: width 0.3s ease;
  `;
  progressTrack.appendChild(progressBar);

  const statusEl = document.createElement('div');
  statusEl.style.cssText = 'font-size: 11px; margin-top: 6px; opacity: 0.6;';
  statusEl.textContent = `${options.progress}% - ${options.status}`;

  container.appendChild(header);
  container.appendChild(labelEl);
  container.appendChild(progressTrack);
  container.appendChild(statusEl);
}

// Validation state indicator
export function showValidation(options: {
  elementSelector: string;
  status: 'valid' | 'invalid' | 'warning' | 'pending';
  message: string;
  source: { file: string; line: number };
}): void {
  if (process.env.NODE_ENV !== 'development') return;

  const element = document.querySelector(options.elementSelector);
  if (!element || !(element instanceof HTMLElement)) return;

  const indicator = document.createElement('div');
  indicator.className = 'agentation-validation';
  indicator.dataset.source = `${options.source.file}:${options.source.line}`;

  const icons: Record<string, string> = {
    valid: '\u2714',      // checkmark
    invalid: '\u2718',    // X mark
    warning: '\u26A0',    // warning triangle
    pending: '\u231B'     // hourglass
  };

  const colors: Record<string, string> = {
    valid: '#4CAF50',
    invalid: '#f44336',
    warning: '#FFC107',
    pending: '#2196F3'
  };

  const badge = document.createElement('div');
  badge.className = 'agentation-validation-badge';

  const iconSpan = document.createElement('span');
  iconSpan.style.color = colors[options.status] || colors.pending;
  iconSpan.textContent = icons[options.status] || icons.pending;

  const textSpan = document.createElement('span');
  textSpan.textContent = options.message;

  badge.appendChild(iconSpan);
  badge.appendChild(textSpan);
  indicator.appendChild(badge);

  element.style.position = 'relative';
  indicator.style.cssText = `
    position: absolute;
    top: -24px;
    right: 0;
    font-size: 11px;
    background: rgba(0,0,0,0.8);
    padding: 2px 8px;
    border-radius: 4px;
    color: white;
  `;

  element.appendChild(indicator);
}

// Inline annotation
export function addAnnotation(options: {
  elementSelector: string;
  content: string;
  type: 'info' | 'suggestion' | 'question' | 'approval-needed';
  source: { file: string; line: number };
}): void {
  if (process.env.NODE_ENV !== 'development') return;

  const element = document.querySelector(options.elementSelector);
  if (!element) return;

  const annotation = document.createElement('div');
  annotation.className = `agentation-annotation agentation-${options.type}`;
  annotation.dataset.source = `${options.source.file}:${options.source.line}`;

  const typeColors: Record<string, string> = {
    info: '#2196F3',
    suggestion: '#9C27B0',
    question: '#FF9800',
    'approval-needed': '#f44336'
  };

  const color = typeColors[options.type] || typeColors.info;

  // Build annotation using safe DOM methods
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    border-left: 3px solid ${color};
    background: rgba(0,0,0,0.7);
    padding: 8px 12px;
    margin: 4px 0;
    font-size: 12px;
    border-radius: 0 4px 4px 0;
  `;

  const typeLabel = document.createElement('div');
  typeLabel.style.cssText = `font-weight: 600; margin-bottom: 4px; color: ${color};`;
  typeLabel.textContent = options.type.toUpperCase();

  const contentEl = document.createElement('div');
  contentEl.style.color = '#e0e0e0';
  contentEl.textContent = options.content;

  const sourceEl = document.createElement('code');
  sourceEl.style.cssText = 'font-size: 10px; opacity: 0.6; display: block; margin-top: 4px;';
  sourceEl.textContent = `${options.source.file}:${options.source.line}`;

  wrapper.appendChild(typeLabel);
  wrapper.appendChild(contentEl);
  wrapper.appendChild(sourceEl);
  annotation.appendChild(wrapper);

  element.insertAdjacentElement('afterend', annotation);
}
```

### 4. Screenshot Integration

Capture visual state for analysis:

```typescript
// agentation/screenshot.ts
export interface ScreenshotResult {
  dataUrl: string;
  timestamp: number;
  viewport: { width: number; height: number };
  annotations: Array<{
    selector: string;
    source: { file: string; line: number };
    rect: DOMRect;
  }>;
}

export async function captureWithAnnotations(): Promise<ScreenshotResult> {
  // Collect all agentation overlays
  const overlays = document.querySelectorAll('[data-source]');
  const annotations = Array.from(overlays).map(el => ({
    selector: el.className,
    source: parseSourceLocation(el.dataset.source || ''),
    rect: el.getBoundingClientRect()
  }));

  // Use html2canvas or similar for screenshot
  // (In practice, this integrates with Playwright/Puppeteer for server-side capture)

  return {
    dataUrl: '', // Screenshot data
    timestamp: Date.now(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    annotations
  };
}

function parseSourceLocation(source: string): { file: string; line: number } {
  const [file, lineStr] = source.split(':');
  return { file: file || '', line: parseInt(lineStr, 10) || 0 };
}
```

---

## Playwright Integration

Combine Agentation with Playwright MCP for visual auditing workflows:

### Visual Validation Loop

```typescript
// playwright-agentation-integration.ts
import { chromium, Browser, Page } from 'playwright';

interface ValidationCheck {
  name: string;
  selector: string;
  type: 'exists' | 'visible' | 'text-contains' | 'style';
  expected?: string;
  property?: string;
  source: { file: string; line: number };
}

interface CheckResult {
  name: string;
  passed: boolean;
  check: ValidationCheck;
}

interface ValidationResult {
  screenshot: Buffer;
  annotations: Array<{ source: string; content: string; rect: DOMRect }>;
  critique: string;
  passedChecks: string[];
  failedChecks: string[];
}

async function visualValidationLoop(
  url: string,
  checks: ValidationCheck[]
): Promise<ValidationResult> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Navigate and inject agentation
  await page.goto(url);
  await injectAgentationScript(page);

  // 2. Run visual checks and annotate
  const results = await runVisualChecks(page, checks);

  // 3. Capture screenshot with annotations
  const screenshot = await page.screenshot({ fullPage: true });

  // 4. Extract annotations from DOM
  const annotations = await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-source]');
    return Array.from(elements).map(el => ({
      source: el.dataset.source || '',
      content: el.textContent || '',
      rect: el.getBoundingClientRect().toJSON()
    }));
  });

  // 5. Generate critique based on findings
  const critique = generateCritique(results);

  await browser.close();

  return {
    screenshot,
    annotations,
    critique,
    passedChecks: results.filter(r => r.passed).map(r => r.name),
    failedChecks: results.filter(r => !r.passed).map(r => r.name)
  };
}

function generateCritique(results: CheckResult[]): string {
  const failed = results.filter(r => !r.passed);
  if (failed.length === 0) {
    return 'All visual checks passed.';
  }
  return `${failed.length} check(s) failed: ${failed.map(r => r.name).join(', ')}`;
}

async function injectAgentationScript(page: Page): Promise<void> {
  await page.addScriptTag({
    content: `
      window.__AGENTATION__ = {
        version: '1.0.0',
        annotations: [],
        addAnnotation(config) {
          this.annotations.push(config);
          const el = document.querySelector(config.selector);
          if (el) {
            const badge = document.createElement('div');
            badge.dataset.source = config.source.file + ':' + config.source.line;
            badge.textContent = config.message;
            badge.style.cssText = 'position:absolute;background:rgba(255,0,0,0.8);color:white;padding:2px 4px;font-size:10px;z-index:99999;pointer-events:none;';
            el.style.position = 'relative';
            el.appendChild(badge);
          }
        }
      };
    `
  });
}

async function runVisualChecks(
  page: Page,
  checks: ValidationCheck[]
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  for (const check of checks) {
    const passed = await page.evaluate((c) => {
      const el = document.querySelector(c.selector);
      if (!el) return false;

      switch (c.type) {
        case 'exists':
          return true;
        case 'visible':
          return (el as HTMLElement).offsetParent !== null;
        case 'text-contains':
          return el.textContent?.includes(c.expected || '') ?? false;
        case 'style':
          if (!c.property) return false;
          const style = getComputedStyle(el);
          return style.getPropertyValue(c.property) === c.expected;
        default:
          return false;
      }
    }, check);

    // Add annotation based on result
    await page.evaluate(({ c, p }) => {
      (window as any).__AGENTATION__.addAnnotation({
        selector: c.selector,
        source: c.source,
        message: p ? 'PASS' : 'FAIL: ' + c.name,
        type: p ? 'valid' : 'invalid'
      });
    }, { c: check, p: passed });

    results.push({ name: check.name, passed, check });
  }

  return results;
}
```

### Screenshot-Analyze-Annotate Workflow

```typescript
// workflows/visual-audit.ts
import { chromium } from 'playwright';

interface AuditIssue {
  elementId: string;
  selector: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
}

interface AnalysisResult {
  issues: AuditIssue[];
  summary: string;
  score: number;
}

interface AuditReport {
  url: string;
  timestamp: string;
  initialScreenshot: string;
  annotatedScreenshot: string;
  issues: Array<AuditIssue & { source?: { file: string; line: number } }>;
  summary: string;
  score: number;
}

/**
 * Complete visual audit workflow:
 * 1. Screenshot the page
 * 2. Analyze with AI vision
 * 3. Generate critique
 * 4. Annotate issues in DOM
 * 5. Capture final state
 */
export async function visualAuditWorkflow(config: {
  url: string;
  sourceMap: Map<string, { file: string; line: number }>;
  auditPrompt: string;
}): Promise<AuditReport> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(config.url);

  // Step 1: Initial screenshot
  const initialScreenshot = await page.screenshot();

  // Step 2: Analyze with AI (integrate with your AI provider)
  const analysis = await analyzeScreenshot(initialScreenshot, config.auditPrompt);

  // Step 3: Inject annotations based on analysis
  await injectAgentationScript(page);

  for (const issue of analysis.issues) {
    const sourceLocation = config.sourceMap.get(issue.elementId);

    await page.evaluate(({ issue, source }) => {
      (window as any).__AGENTATION__.addAnnotation({
        selector: issue.selector,
        source: source || { file: 'unknown', line: 0 },
        message: issue.description,
        type: issue.severity === 'error' ? 'invalid' : 'warning'
      });
    }, { issue, source: sourceLocation });
  }

  // Step 4: Final screenshot with annotations
  const annotatedScreenshot = await page.screenshot({ fullPage: true });

  // Step 5: Generate report
  const report: AuditReport = {
    url: config.url,
    timestamp: new Date().toISOString(),
    initialScreenshot: initialScreenshot.toString('base64'),
    annotatedScreenshot: annotatedScreenshot.toString('base64'),
    issues: analysis.issues.map(issue => ({
      ...issue,
      source: config.sourceMap.get(issue.elementId)
    })),
    summary: analysis.summary,
    score: analysis.score
  };

  await browser.close();

  return report;
}

// Placeholder - integrate with your AI vision provider
async function analyzeScreenshot(
  screenshot: Buffer,
  prompt: string
): Promise<AnalysisResult> {
  // Implementation depends on your AI provider
  return {
    issues: [],
    summary: 'Analysis complete',
    score: 100
  };
}

async function injectAgentationScript(page: any): Promise<void> {
  await page.addScriptTag({
    content: `
      window.__AGENTATION__ = {
        annotations: [],
        addAnnotation(config) {
          this.annotations.push(config);
          const el = document.querySelector(config.selector);
          if (el) {
            const badge = document.createElement('div');
            badge.dataset.source = config.source.file + ':' + config.source.line;
            badge.textContent = config.message;
            badge.style.cssText = 'position:absolute;background:rgba(255,0,0,0.8);color:white;padding:2px 4px;font-size:10px;z-index:99999;pointer-events:none;';
            el.style.position = 'relative';
            el.appendChild(badge);
          }
        }
      };
    `
  });
}
```

---

## Use Cases

### 1. UI Refinement Cycles

```typescript
// Track AI modifications during UI refinement
export function trackUIChange(change: {
  component: string;
  property: string;
  oldValue: string;
  newValue: string;
  file: string;
  line: number;
}): void {
  addAnnotation({
    elementSelector: `[data-component="${change.component}"]`,
    content: `Changed ${change.property}: "${change.oldValue}" -> "${change.newValue}"`,
    type: 'info',
    source: { file: change.file, line: change.line }
  });
}
```

### 2. Visual Bug Identification

```typescript
// Highlight visual bugs with source context
export function flagVisualBug(bug: {
  selector: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedFix: string;
  file: string;
  line: number;
}): void {
  const annotationType = bug.severity === 'critical' ? 'approval-needed' : 'suggestion';

  addAnnotation({
    elementSelector: bug.selector,
    content: `BUG: ${bug.description} | Severity: ${bug.severity} | Fix: ${bug.suggestedFix}`,
    type: annotationType,
    source: { file: bug.file, line: bug.line }
  });

  showValidation({
    elementSelector: bug.selector,
    status: 'invalid',
    message: bug.severity.toUpperCase(),
    source: { file: bug.file, line: bug.line }
  });
}
```

### 3. Design Review Annotations

```typescript
// Add design review comments
export function addDesignComment(comment: {
  selector: string;
  reviewer: string;
  text: string;
  type: 'approved' | 'needs-work' | 'question';
  file: string;
  line: number;
}): void {
  const typeMap: Record<string, 'info' | 'suggestion' | 'question'> = {
    'approved': 'info',
    'needs-work': 'suggestion',
    'question': 'question'
  };

  addAnnotation({
    elementSelector: comment.selector,
    content: `[${comment.reviewer}] ${comment.text}`,
    type: typeMap[comment.type],
    source: { file: comment.file, line: comment.line }
  });
}
```

### 4. Progress Tracking During Long Operations

```typescript
// Track multi-step implementation progress
interface ImplementationStep {
  taskId: string;
  description: string;
  affectedSelector?: string;
  source: { file: string; line: number };
  execute: () => Promise<void>;
}

export async function trackImplementationProgress(
  steps: ImplementationStep[]
): Promise<void> {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const progress = Math.round(((i + 1) / steps.length) * 100);

    showProgress({
      taskId: step.taskId,
      label: step.description,
      progress,
      status: 'running'
    });

    await step.execute();

    // Annotate completed component
    if (step.affectedSelector) {
      addAnnotation({
        elementSelector: step.affectedSelector,
        content: `Step ${i + 1}/${steps.length} complete`,
        type: 'info',
        source: step.source
      });
    }
  }

  showProgress({
    taskId: 'implementation',
    label: 'Implementation complete',
    progress: 100,
    status: 'complete'
  });
}
```

---

## Setup Instructions

### Next.js App Router

```typescript
// app/providers/agentation-provider.tsx
'use client';

import { useEffect } from 'react';

export function AgentationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize in development
    if (process.env.NODE_ENV !== 'development') return;

    // Load agentation styles
    const style = document.createElement('style');
    style.id = 'agentation-styles';
    style.textContent = `
      .agentation-overlay {
        border: 2px solid #4CAF50;
        background: rgba(76, 175, 80, 0.1);
        border-radius: 4px;
      }
      .agentation-badge {
        position: absolute;
        top: -28px;
        left: 0;
        background: #1a1a2e;
        border: 1px solid #4a4a6a;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 6px;
        color: #e0e0e0;
      }
      .agentation-icon {
        background: #4CAF50;
        color: white;
        padding: 1px 4px;
        border-radius: 2px;
        font-size: 9px;
        font-weight: bold;
      }
      .agentation-source {
        opacity: 0.6;
        font-size: 10px;
      }
      .agentation-annotation {
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    // Initialize global agentation object
    (window as any).__AGENTATION__ = {
      version: '1.0.0',
      annotations: [],
      context: null
    };

    return () => {
      // Cleanup on unmount
      document.getElementById('agentation-styles')?.remove();
      document.querySelectorAll('.agentation-overlay, .agentation-annotation').forEach(el => el.remove());
    };
  }, []);

  return <>{children}</>;
}
```

```typescript
// app/layout.tsx
import { AgentationProvider } from './providers/agentation-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {process.env.NODE_ENV === 'development' ? (
          <AgentationProvider>{children}</AgentationProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
```

### Pages Router

```typescript
// pages/_app.tsx
import { useEffect } from 'react';
import type { AppProps } from 'next/app';

function AgentationInit() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Initialize agentation using safe DOM construction
    (window as any).__AGENTATION__ = {
      version: '1.0.0',
      annotations: [],
      init() {
        console.log('[Agentation] Initialized in development mode');
      }
    };
    (window as any).__AGENTATION__.init();

    return () => {
      delete (window as any).__AGENTATION__;
    };
  }, []);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {process.env.NODE_ENV === 'development' && <AgentationInit />}
      <Component {...pageProps} />
    </>
  );
}
```

### Environment Guards

```typescript
// lib/agentation/guards.ts
import React from 'react';

/**
 * Ensure agentation only runs in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Wrap agentation functions with environment check
 */
export function withDevGuard<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>) => {
    if (!isDevelopment()) {
      console.warn('[Agentation] Attempted to use in non-development environment');
      return;
    }
    return fn(...args);
  }) as T;
}

/**
 * Higher-order component to conditionally render agentation UI
 */
export function withAgentation<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AgentationWrapper(props: P) {
    if (!isDevelopment()) {
      return null;
    }
    return React.createElement(Component, props);
  };
}
```

---

## Security Considerations

When implementing agentation, always follow these security practices:

1. **Use safe DOM methods** - Always use `textContent` for plain text and safe DOM construction methods (createElement, appendChild) instead of innerHTML
2. **Validate input** - Sanitize any user-provided content before displaying
3. **Development-only** - Never ship agentation code to production
4. **No sensitive data** - Never include credentials, tokens, or PII in annotations

```typescript
// SAFE: Using textContent and DOM construction
const badge = document.createElement('div');
badge.textContent = userMessage; // Safe - escapes HTML

// UNSAFE: Using innerHTML with untrusted content
// badge.innerHTML = userMessage; // XSS risk - avoid this pattern
```

---

## Anti-Patterns

### DO NOT: Inject Feedback in Production Builds

```typescript
// BAD - No environment check
export function showFeedback(message: string) {
  const el = document.createElement('div');
  el.textContent = message;
  document.body.appendChild(el); // Will show in production!
}

// GOOD - Always guard with environment check
export function showFeedback(message: string) {
  if (process.env.NODE_ENV !== 'development') return;

  const el = document.createElement('div');
  el.textContent = message;
  document.body.appendChild(el);
}
```

### DO NOT: Block User Interaction

```typescript
// BAD - Overlay captures clicks
overlay.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  /* Missing pointer-events: none */
`;

// GOOD - Overlay is non-interactive
overlay.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  pointer-events: none; /* Critical: allows clicks to pass through */
`;
```

### DO NOT: Persist Annotations to DOM

```typescript
// BAD - Annotations saved to localStorage/database
function addAnnotation(config: any) {
  const annotation = createAnnotation(config);
  const existing = JSON.parse(localStorage.getItem('annotations') || '[]');
  localStorage.setItem('annotations', JSON.stringify([...existing, annotation]));
  // Persists across sessions - bad!
}

// GOOD - Annotations are ephemeral, session-only
function addAnnotation(config: any) {
  const annotation = createAnnotation(config);
  // Only exists in current session memory
  (window as any).__AGENTATION__.annotations.push(annotation);
  renderAnnotation(annotation);
  // Will be cleared on page refresh
}
```

### DO NOT: Modify Application State

```typescript
// BAD - Agentation modifies component props/state
function annotateButton(buttonId: string) {
  const button = document.getElementById(buttonId) as HTMLButtonElement;
  if (!button) return;
  button.setAttribute('disabled', 'true'); // Modifies app behavior!
  button.textContent = '[AI] ' + button.textContent; // Modifies content!
}

// GOOD - Agentation only adds overlay layer
function annotateButton(buttonId: string) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  const overlay = document.createElement('div');
  overlay.className = 'agentation-overlay';
  overlay.style.cssText = `
    position: absolute;
    pointer-events: none;
  `;
  // Append to body, not to button - preserves app structure
  document.body.appendChild(overlay);
  positionOverlay(overlay, button);
}

function positionOverlay(overlay: HTMLElement, target: Element) {
  const rect = target.getBoundingClientRect();
  overlay.style.top = `${rect.top}px`;
  overlay.style.left = `${rect.left}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
}
```

---

## Integration Points

| Integration | Usage |
|------------|-------|
| Playwright MCP | Visual validation and screenshot capture |
| Ralph Loop | HITL checkpoints with visual feedback |
| Agent Browser | Lightweight DOM verification |
| PostToolUse Hooks | Auto-annotate after file changes |
| Step 11 PRDs | Visual acceptance criteria |
| Design Review | Collaborative annotation workflow |

---

## Related Skills

- `agent-browser-validation` - Lightweight UI testing
- `specialized-validation` - PRD validation patterns
- `verification` - Step completion verification
- `quality-gates` - Automated quality checks

---

*Agentation bridges the gap between AI code generation and human visual review, enabling efficient HITL workflows with full source context.*
