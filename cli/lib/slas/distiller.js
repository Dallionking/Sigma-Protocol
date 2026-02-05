#!/usr/bin/env node

/**
 * SLAS Distiller Module
 *
 * Extracts patterns from Claude session transcripts for learning user preferences.
 * Analyzes communication style, autonomy level, frustration triggers, and domain expertise.
 */

import fs from "fs-extra";
import path from "path";

/**
 * Pattern definitions for extraction
 */
const PATTERNS = {
  frustration: [
    /(?:no|don't|stop|wrong|incorrect|that's not|not what|already told|again\?|why did)/i,
    /(?:frustrated|annoying|annoyed|ugh|sigh|come on|seriously)/i,
    /(?:i said|like i said|as i mentioned|i already)/i,
  ],
  preference: [
    /(?:i prefer|always use|never use|i like|i want|don't ask|just do)/i,
    /(?:my style|the way i|how i usually|i typically)/i,
  ],
  autonomyHigh: [
    /(?:just do it|don't ask|go ahead|proceed|execute)/i,
    /(?:stop asking|no confirmation|autonomous|auto)/i,
  ],
  autonomyLow: [
    /(?:ask first|confirm|check with me|wait for|approval)/i,
    /(?:step by step|one at a time|slowly)/i,
  ],
  topics: {
    typescript: /\b(?:typescript|ts|tsx)\b/i,
    react: /\b(?:react|jsx|component|hook)\b/i,
    api: /\b(?:api|endpoint|rest|graphql)\b/i,
    database: /\b(?:database|sql|postgres|mongo|supabase)\b/i,
    testing: /\b(?:test|jest|vitest|cypress)\b/i,
    styling: /\b(?:css|tailwind|style|theme)\b/i,
    git: /\b(?:git|commit|branch|merge|pr)\b/i,
    deployment: /\b(?:deploy|vercel|aws|docker)\b/i,
  }
};

/**
 * Parse a single JSONL transcript file
 * @param {string} filePath - Path to JSONL file
 * @returns {Promise<Object>} - Parsed messages
 */
async function parseTranscript(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n").filter(line => line.trim());

  const messages = {
    user: [],
    assistant: [],
    all: []
  };

  for (const line of lines) {
    try {
      const msg = JSON.parse(line);
      const text = extractText(msg);

      if (msg.type === "human" && text) {
        messages.user.push(text);
      } else if (msg.type === "assistant" && text) {
        messages.assistant.push(text);
      }

      if (text) {
        messages.all.push({ type: msg.type, text, timestamp: msg.timestamp });
      }
    } catch (e) {
      // Skip invalid JSON lines
    }
  }

  return messages;
}

/**
 * Extract text content from message structure
 * @param {Object} msg - Message object
 * @returns {string} - Extracted text
 */
function extractText(msg) {
  const content = msg.message?.content || msg.content || "";

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === "text" || typeof item === "string")
      .map(item => typeof item === "string" ? item : item.text || "")
      .join(" ");
  }

  return "";
}

/**
 * Extract frustration instances from messages
 * @param {string[]} messages - User messages
 * @returns {Object[]} - Frustration instances
 */
function extractFrustrations(messages) {
  const frustrations = [];

  for (const msg of messages) {
    for (const pattern of PATTERNS.frustration) {
      const matches = msg.match(pattern);
      if (matches) {
        frustrations.push({
          trigger: msg.slice(0, 200),
          pattern: pattern.toString(),
          timestamp: new Date().toISOString()
        });
        break; // One frustration per message
      }
    }
  }

  return frustrations;
}

/**
 * Extract explicit preferences from messages
 * @param {string[]} messages - User messages
 * @returns {Object[]} - Preference statements
 */
function extractPreferences(messages) {
  const preferences = [];

  for (const msg of messages) {
    for (const pattern of PATTERNS.preference) {
      if (pattern.test(msg)) {
        preferences.push({
          statement: msg.slice(0, 300),
          category: categorizePreference(msg)
        });
        break;
      }
    }
  }

  return preferences;
}

/**
 * Categorize a preference statement
 * @param {string} text - Preference text
 * @returns {string} - Category
 */
function categorizePreference(text) {
  const lower = text.toLowerCase();

  if (/code|typescript|function|class/.test(lower)) return "coding_style";
  if (/explain|verbose|brief|concise/.test(lower)) return "communication";
  if (/test|verify|check/.test(lower)) return "quality";
  if (/fast|quick|slow|careful/.test(lower)) return "pace";
  return "general";
}

/**
 * Calculate autonomy preference score
 * @param {string[]} messages - User messages
 * @returns {number} - Score 0-1 (0=low autonomy, 1=high)
 */
function calculateAutonomyScore(messages) {
  let highCount = 0;
  let lowCount = 0;

  for (const msg of messages) {
    for (const pattern of PATTERNS.autonomyHigh) {
      if (pattern.test(msg)) highCount++;
    }
    for (const pattern of PATTERNS.autonomyLow) {
      if (pattern.test(msg)) lowCount++;
    }
  }

  const total = highCount + lowCount;
  if (total === 0) return 0.5;

  return highCount / total;
}

/**
 * Analyze verbosity preference
 * @param {string[]} messages - User messages
 * @returns {string} - minimal|standard|detailed
 */
function analyzeVerbosity(messages) {
  if (messages.length === 0) return "standard";

  const avgLen = messages.reduce((sum, m) => sum + m.length, 0) / messages.length;

  // Check for explicit preferences
  for (const msg of messages) {
    const lower = msg.toLowerCase();
    if (/brief|concise|short|less|minimal/.test(lower)) return "minimal";
    if (/explain|detail|verbose|thorough/.test(lower)) return "detailed";
  }

  // Infer from message lengths
  if (avgLen < 50) return "minimal";
  if (avgLen > 200) return "detailed";
  return "standard";
}

/**
 * Extract topic frequencies
 * @param {string[]} messages - All messages
 * @returns {Object} - Topic counts
 */
function extractTopics(messages) {
  const counts = {};
  const allText = messages.join(" ").toLowerCase();

  for (const [topic, pattern] of Object.entries(PATTERNS.topics)) {
    const matches = allText.match(new RegExp(pattern, "gi"));
    if (matches) {
      counts[topic] = matches.length;
    }
  }

  // Sort by frequency
  return Object.fromEntries(
    Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
  );
}

/**
 * Analyze a single transcript
 * @param {string} filePath - Path to transcript
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeTranscript(filePath) {
  const messages = await parseTranscript(filePath);

  return {
    file: path.basename(filePath),
    messageCount: {
      user: messages.user.length,
      assistant: messages.assistant.length,
      total: messages.all.length
    },
    autonomyScore: calculateAutonomyScore(messages.user),
    verbosity: analyzeVerbosity(messages.user),
    frustrations: extractFrustrations(messages.user),
    preferences: extractPreferences(messages.user),
    topics: extractTopics([...messages.user, ...messages.assistant])
  };
}

/**
 * Aggregate analysis across multiple transcripts
 * @param {Object[]} analyses - Individual transcript analyses
 * @returns {Object} - Aggregated patterns
 */
function aggregatePatterns(analyses) {
  // Filter out empty analyses
  const valid = analyses.filter(a => a.messageCount.total > 0);

  if (valid.length === 0) {
    return {
      sessions_analyzed: 0,
      patterns: {},
      confidence: 0
    };
  }

  // Aggregate autonomy scores (weighted by message count)
  const totalMessages = valid.reduce((sum, a) => sum + a.messageCount.user, 0);
  const weightedAutonomy = valid.reduce(
    (sum, a) => sum + (a.autonomyScore * a.messageCount.user),
    0
  ) / Math.max(totalMessages, 1);

  // Aggregate verbosity (mode)
  const verbosityCounts = { minimal: 0, standard: 0, detailed: 0 };
  for (const a of valid) {
    verbosityCounts[a.verbosity]++;
  }
  const dominantVerbosity = Object.entries(verbosityCounts)
    .sort(([, a], [, b]) => b - a)[0][0];

  // Aggregate frustrations
  const allFrustrations = valid.flatMap(a => a.frustrations);
  const frustrationGroups = {};
  for (const f of allFrustrations) {
    const key = f.pattern;
    if (!frustrationGroups[key]) {
      frustrationGroups[key] = { trigger: f.trigger, count: 0 };
    }
    frustrationGroups[key].count++;
  }
  const topFrustrations = Object.values(frustrationGroups)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Aggregate preferences
  const allPreferences = valid.flatMap(a => a.preferences);
  const preferencesByCategory = {};
  for (const p of allPreferences) {
    if (!preferencesByCategory[p.category]) {
      preferencesByCategory[p.category] = [];
    }
    preferencesByCategory[p.category].push(p.statement);
  }

  // Aggregate topics
  const topicCounts = {};
  for (const a of valid) {
    for (const [topic, count] of Object.entries(a.topics)) {
      topicCounts[topic] = (topicCounts[topic] || 0) + count;
    }
  }
  const topTopics = Object.fromEntries(
    Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
  );

  // Calculate confidence based on data volume
  const confidence = Math.min(0.95, 0.5 + (valid.length / 100) * 0.45);

  return {
    sessions_analyzed: valid.length,
    total_messages: totalMessages,
    patterns: {
      autonomy_level: {
        score: Math.round(weightedAutonomy * 100) / 100,
        label: weightedAutonomy > 0.7 ? "high" : weightedAutonomy < 0.3 ? "low" : "medium",
        confidence: Math.min(0.95, 0.5 + (totalMessages / 1000) * 0.45)
      },
      communication: {
        verbosity: dominantVerbosity,
        tone: "direct", // Default, would need more analysis
        confidence: Math.min(0.9, valid.length / 50)
      },
      frustration_triggers: topFrustrations,
      preferences: preferencesByCategory,
      domain_expertise: topTopics
    },
    confidence: Math.round(confidence * 100) / 100
  };
}

/**
 * Recursively find JSONL files in a directory
 * @param {string} dir - Directory to search
 * @param {string[]} files - Accumulated files
 * @returns {Promise<string[]>} - JSONL file paths
 */
async function findJsonlFiles(dir, files = []) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        await findJsonlFiles(fullPath, files);
      } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory not accessible, skip
  }

  return files;
}

/**
 * Find transcript files in a directory
 * @param {string} basePath - Base path to search
 * @param {number} limit - Max files to return
 * @returns {Promise<string[]>} - Transcript file paths
 */
async function findTranscripts(basePath, limit = 100) {
  const files = await findJsonlFiles(basePath);

  // Sort by modification time (most recent first)
  const withStats = await Promise.all(
    files.map(async f => {
      try {
        const stats = await fs.stat(f);
        return { path: f, mtime: stats.mtime };
      } catch {
        return null;
      }
    })
  );

  return withStats
    .filter(f => f !== null)
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, limit)
    .map(f => f.path);
}

/**
 * Run full distillation process
 * @param {Object} options - Distillation options
 * @returns {Promise<Object>} - Distillation results
 */
export async function distill(options = {}) {
  const {
    transcriptsPath = path.join(process.env.HOME, ".claude", "projects"),
    sessionsLimit = 50,
    bootstrap = false
  } = options;

  // Find transcript files
  const limit = bootstrap ? 500 : sessionsLimit;
  const transcripts = await findTranscripts(transcriptsPath, limit);

  if (transcripts.length === 0) {
    return {
      success: false,
      error: "No transcript files found",
      searchPath: transcriptsPath
    };
  }

  // Analyze each transcript
  const analyses = [];
  for (const file of transcripts) {
    try {
      const analysis = await analyzeTranscript(file);
      analyses.push(analysis);
    } catch (e) {
      // Skip files that can't be parsed
    }
  }

  // Aggregate patterns
  const aggregated = aggregatePatterns(analyses);

  return {
    success: true,
    transcriptsPath,
    filesFound: transcripts.length,
    filesAnalyzed: analyses.length,
    ...aggregated
  };
}

/**
 * Generate YAML profile from distillation results
 * @param {Object} results - Distillation results
 * @returns {string} - YAML content
 */
export function generateProfileYAML(results) {
  const { patterns, sessions_analyzed, confidence } = results;

  const yaml = `# Developer Preferences Profile
# Auto-generated by SLAS Distiller
# Last updated: ${new Date().toISOString()}

metadata:
  sessions_analyzed: ${sessions_analyzed}
  confidence: ${confidence}
  generated_at: "${new Date().toISOString()}"

communication:
  verbosity: ${patterns.communication?.verbosity || "standard"}
  tone: ${patterns.communication?.tone || "direct"}
  confidence: ${patterns.communication?.confidence || 0.5}

autonomy:
  level: ${patterns.autonomy_level?.label || "medium"}
  score: ${patterns.autonomy_level?.score || 0.5}
  confidence: ${patterns.autonomy_level?.confidence || 0.5}

quality:
  testing_preference: medium
  type_safety: strict
  documentation: minimal

frustrations:
${(patterns.frustration_triggers || []).map(f =>
  `  - trigger: "${f.trigger.replace(/"/g, '\\"').slice(0, 100)}..."
    frequency: ${f.count}`
).join("\n") || "  []"}

domain_expertise:
${Object.entries(patterns.domain_expertise || {}).map(([topic, count]) =>
  `  ${topic}: ${count > 50 ? "expert" : count > 20 ? "intermediate" : "familiar"}`
).join("\n") || "  {}"}
`;

  return yaml;
}

/**
 * Generate skill markdown from distillation results
 * @param {Object} results - Distillation results
 * @returns {string} - Markdown content
 */
export function generateSkillMarkdown(results) {
  const { patterns, sessions_analyzed, confidence } = results;

  const autonomyRules = patterns.autonomy_level?.label === "high"
    ? "- Execute tasks without confirmation for routine operations\n- Only ask for clarification on ambiguous requirements\n- Proceed autonomously with best judgment"
    : patterns.autonomy_level?.label === "low"
    ? "- Always confirm before making changes\n- Explain proposed actions before executing\n- Wait for explicit approval"
    : "- Use judgment for routine tasks\n- Confirm for significant changes\n- Ask when genuinely uncertain";

  const verbosityRules = patterns.communication?.verbosity === "minimal"
    ? "- Keep responses concise and action-focused\n- Avoid over-explanation\n- Get to the point quickly"
    : patterns.communication?.verbosity === "detailed"
    ? "- Provide thorough explanations\n- Include context and rationale\n- Offer detailed breakdowns"
    : "- Balance brevity with clarity\n- Explain when helpful\n- Adapt to context";

  const frustrationRules = (patterns.frustration_triggers || [])
    .slice(0, 5)
    .map(f => `- Avoid: ${f.trigger.slice(0, 80)}...`)
    .join("\n") || "- No specific frustration patterns detected";

  return `---
name: developer-preferences
description: Auto-generated developer preferences from session analysis
generated_at: ${new Date().toISOString()}
sessions_analyzed: ${sessions_analyzed}
confidence: ${Math.round(confidence * 100)}%
---

# Developer Preferences

> Auto-generated by SLAS from ${sessions_analyzed} sessions
> Confidence: ${Math.round(confidence * 100)}%
> Last updated: ${new Date().toISOString().split("T")[0]}

## Communication Style

${verbosityRules}

## Autonomy Level

${autonomyRules}

## Anti-Patterns to Avoid

${frustrationRules}

## Domain Context

Primary technologies used:
${Object.entries(patterns.domain_expertise || {})
  .slice(0, 5)
  .map(([topic, count]) => `- **${topic}**: ${count} references`)
  .join("\n") || "- No specific domain patterns detected"}

---

_This file is auto-generated. Run \`/session-distill\` to update._
`;
}

export default {
  distill,
  generateProfileYAML,
  generateSkillMarkdown,
  parseTranscript,
  analyzeTranscript,
  aggregatePatterns,
  findTranscripts
};
