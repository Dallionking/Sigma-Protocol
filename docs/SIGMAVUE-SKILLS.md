# SigmaVue Skills & Agents Reference

> **Version:** 2.0.0  
> **Created:** January 8, 2026  
> **Updated:** January 8, 2026 - Added MiniMax background agents  
> **Purpose:** Reference document for SigmaVue-specific OpenCode skills and agents

This document describes the specialized skills and agents created for the SigmaVue autonomous trading platform. These encapsulate best practices for data integration, strategy development, quantitative analysis, and prop firm trading.

---

## Background Agents (Auto-Invoked with MiniMax Models)

These agents are **automatically triggered** when you mention relevant keywords. They use MiniMax models for cost-effective, fast responses.

| Agent ID | Name | Model | Auto-Triggers |
|----------|------|-------|---------------|
| `sigmavue-databento` | Databento | MiniMax-02 | @databento, databento, ohlcv, market data, historical data, live streaming |
| `sigmavue-chart` | Chart Analyst | MiniMax-4.7 | @chart, chart capture, tradingview, mtf, ben kim, playwright |
| `sigmavue-strategy` | Strategy Architect | MiniMax-02 | @strategy, trading strategy, basestrategy, on_bar, TradingSignal |
| `sigmavue-quant` | Quant Analyst | MiniMax-4.7 | @quant, sharpe, backtesting, drawdown, risk management, position sizing |
| `sigmavue-basehit` | Base Hit Coach | MiniMax-02 | @basehit, prop firm, mfe, daily target, cash exit, apex, topstep |

### Direct Invocation

You can also invoke agents directly:
- `@databento` - Market data questions
- `@chart` - Chart analysis tasks
- `@strategy` - Strategy development
- `@quant` - Quantitative analysis
- `@basehit` - Prop firm methodology

---

## Skills Overview

SigmaVue skills are located in `/src/skills/` and provide knowledge-based guidance for specific domains.

| Skill | Triggers | Description |
|-------|----------|-------------|
| `sigmavue-databento` | `databento`, `market-data`, `ohlcv` | Databento market data integration patterns |
| `sigmavue-chart-capture` | `chart-capture`, `tradingview`, `ben-kim` | TradingView chart automation & MTF analysis |
| `sigmavue-strategy` | `trading-strategy`, `basestrategy`, `on-bar` | BaseStrategy pattern & TradingSignal |
| `sigmavue-quant` | `quant`, `sharpe-ratio`, `backtesting` | Quantitative trading knowledge base |
| `sigmavue-base-hit` | `base-hit`, `prop-firm`, `mfe` | Base Hit Trading Methodology |

---

## Detailed Skill Descriptions

### 1. sigmavue-databento

**Path:** `src/skills/sigmavue-databento.md`

**Triggers:** `databento`, `market-data`, `ohlcv`, `historical-data`, `live-streaming`, `futures-data`

**When to Use:**
- Fetching historical OHLCV data for backtesting
- Setting up live market data streams
- Implementing symbol mapping (ES → ES.c.0)
- Handling UTC timezone normalization
- Resampling unsupported intervals (5m, 15m, 4h)

**Key Patterns:**
- `DatabentoService` for historical data
- `DatabentoLiveClient` for streaming
- Symbol mapping to continuous contracts
- UTC normalization (PRD-14.8.07.2)

### 2. sigmavue-chart-capture

**Path:** `src/skills/sigmavue-chart-capture.md`

**Triggers:** `chart-capture`, `tradingview`, `mtf-analysis`, `ben-kim`, `screenshot`, `playwright`

**When to Use:**
- Implementing chart screenshot capture via Playwright
- Managing TradingView session cookies
- Building multi-timeframe (MTF) analysis pipelines
- Integrating vision models for chart pattern recognition

**Key Patterns:**
- `ChartCaptureService` singleton
- Cookie persistence for session management
- MTF capture for 4 timeframes (5m, 15m, 1h, 4h)
- `ChartAnalyzer` for vision model integration

### 3. sigmavue-strategy

**Path:** `src/skills/sigmavue-strategy.md`

**Triggers:** `trading-strategy`, `basestrategy`, `trading-signal`, `strategy-registry`, `on-bar`, `futures-trading`

**When to Use:**
- Creating new trading strategies
- Implementing the BaseStrategy abstract class
- Generating TradingSignals with proper validation
- Registering strategies with Django integration

**Key Patterns:**
- `BaseStrategy` class with required methods
- `TradingSignal` dataclass with validation
- `@register_strategy` decorator
- Strategy lifecycle (configure → initialize → on_bar)

### 4. sigmavue-quant

**Path:** `src/skills/sigmavue-quant.md`

**Triggers:** `quant`, `sharpe-ratio`, `backtesting`, `risk-management`, `position-sizing`, `drawdown`, `performance-metrics`

**When to Use:**
- Evaluating strategy performance metrics
- Implementing risk management systems
- Setting up backtesting infrastructure
- Calculating position sizes
- Validating statistical significance

**Key Patterns:**
- Performance metrics (Sharpe, Sortino, Calmar)
- Kelly Criterion position sizing
- Walk-forward optimization
- Data validation and quality checks

### 5. sigmavue-base-hit

**Path:** `src/skills/sigmavue-base-hit.md`

**Triggers:** `base-hit`, `prop-firm`, `mfe`, `daily-target`, `cash-exit`, `consistent-profits`

**When to Use:**
- Optimizing strategies for prop firm challenges
- Implementing MFE-based take profits
- Setting up daily profit targets and cash exits
- Ensuring prop firm compliance

**Key Patterns:**
- MFE analysis and 80% TP rule
- NY session filtering (9:30 AM - 4:00 PM ET)
- $250/day target with cash exits
- Prop firm consistency rules

---

## Agents Overview

SigmaVue agents are located in `/src/agents/` and provide action-oriented assistance for specific roles.

| Agent | Mode | Description |
|-------|------|-------------|
| `sigmavue-quant-strategist` | subagent | Strategy development with statistical rigor |
| `sigmavue-market-data-engineer` | subagent | Data integration (Databento + TradingView) |

---

## Detailed Agent Descriptions

### 1. sigmavue-quant-strategist

**Path:** `src/agents/sigmavue-quant-strategist.md`

**Mode:** subagent

**Persona:** Senior Quantitative Strategist with expertise in futures trading strategy development.

**Responsibilities:**
- Develop new trading strategies following BaseStrategy pattern
- Optimize strategies for MFE-based take profits
- Implement statistical validation and backtesting
- Ensure prop firm compliance
- Apply Base Hit methodology

**Workflow:**
1. Strategy Analysis - Review requirements and historical data
2. Development - Implement BaseStrategy with required methods
3. Backtesting - Walk-forward with transaction costs
4. Base Hit Optimization - Set TP at 80% of average MFE
5. Prop Firm Validation - Verify compliance rules

**Referenced Skills:** `sigmavue-strategy`, `sigmavue-quant`, `sigmavue-base-hit`

### 2. sigmavue-market-data-engineer

**Path:** `src/agents/sigmavue-market-data-engineer.md`

**Mode:** subagent

**Persona:** Senior Market Data Engineer specializing in financial data integration.

**Responsibilities:**
- Integrate Databento for historical and live market data
- Manage TradingView chart capture (Ben Kim system)
- Ensure UTC timezone normalization
- Handle symbol mapping
- Implement data quality validation

**Workflow:**
1. Requirements Analysis - Understand data needs
2. Databento Integration - Configure service and fetching
3. Chart Capture - Set up TradingView automation
4. Data Validation - Check quality and consistency
5. Integration Testing - Verify accuracy and reliability

**Referenced Skills:** `sigmavue-databento`, `sigmavue-chart-capture`

---

## Installation

These skills and agents are part of the SSS Protocol. To use them with OpenCode:

### Option 1: Copy to Project

```bash
# Copy skills to your project
cp SSS-Protocol/src/skills/sigmavue-*.md your-project/.opencode/skill/

# Copy agents to your project  
cp SSS-Protocol/src/agents/sigmavue-*.md your-project/.opencode/agent/
```

### Option 2: Use SSS Protocol Plugin

If using the SSS Protocol plugin, skills and agents are automatically available.

---

## Usage Examples

### Invoking Skills

Skills are automatically invoked when relevant triggers are mentioned:

```
"I need to implement Databento data fetching for the new strategy"
→ sigmavue-databento skill provides patterns

"How should I structure the BaseStrategy for my ORB variant?"
→ sigmavue-strategy skill provides templates

"What metrics should I use to evaluate this backtest?"
→ sigmavue-quant skill provides guidance
```

### Invoking Agents

Agents can be explicitly invoked for complex tasks:

```
"@sigmavue-quant-strategist - Develop a new momentum strategy for NQ"

"@sigmavue-market-data-engineer - Set up live streaming for ES and NQ"
```

---

## Swarm Communication

The SigmaVue agents are designed to work together:

```
┌─────────────────────────────────────────────────────────────┐
│                    User Request                              │
│         "Develop a new Base Hit strategy for NQ"            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               sigmavue-quant-strategist                      │
│   • Develops strategy using BaseStrategy pattern            │
│   • Optimizes for MFE-based take profits                    │
│   • Requests data from market-data-engineer                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ "Need 6 months of NQ 5m data"
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              sigmavue-market-data-engineer                   │
│   • Fetches historical data from Databento                  │
│   • Validates data quality                                  │
│   • Returns normalized DataFrame                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Documentation

| Document | Path | Description |
|----------|------|-------------|
| FOUNDATION-SKILLS.md | `/docs/FOUNDATION-SKILLS.md` | Core SSS Protocol skills |
| skill-creator.md | `/src/foundation-skills/skill-creator.md` | How to create skills |
| opencode-agent-generator.md | `/src/foundation-skills/opencode-agent-generator.md` | How to create agents |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-08 | Initial release with 5 skills and 2 agents |

---

_These skills and agents encapsulate SigmaVue's best practices for autonomous trading strategy development._

