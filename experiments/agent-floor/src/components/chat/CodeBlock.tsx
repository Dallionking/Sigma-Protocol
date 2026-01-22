"use client";

import { useEffect, useState, useCallback } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

// Map common language aliases to shiki language IDs
const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  py: "python",
  rb: "ruby",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  json: "json",
  css: "css",
  html: "html",
  sql: "sql",
  go: "go",
  rust: "rust",
  rs: "rust",
  cpp: "cpp",
  c: "c",
  java: "java",
  kotlin: "kotlin",
  kt: "kotlin",
  swift: "swift",
  php: "php",
  dockerfile: "dockerfile",
  docker: "dockerfile",
  graphql: "graphql",
  gql: "graphql",
};

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  python: "Python",
  ruby: "Ruby",
  bash: "Bash",
  yaml: "YAML",
  markdown: "Markdown",
  json: "JSON",
  css: "CSS",
  html: "HTML",
  sql: "SQL",
  go: "Go",
  rust: "Rust",
  cpp: "C++",
  c: "C",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  php: "PHP",
  dockerfile: "Dockerfile",
  graphql: "GraphQL",
  text: "Plain Text",
};

export default function CodeBlock({ code, language = "text", filename }: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize the language
  const normalizedLang = LANGUAGE_ALIASES[language.toLowerCase()] || language.toLowerCase();
  const displayName = filename || LANGUAGE_NAMES[normalizedLang] || normalizedLang.toUpperCase();

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      setIsLoading(true);
      try {
        const html = await codeToHtml(code, {
          lang: normalizedLang,
          theme: "github-dark-default",
        });
        if (!cancelled) {
          setHighlightedHtml(html);
        }
      } catch {
        // Fallback to plain text if language not supported
        try {
          const html = await codeToHtml(code, {
            lang: "text",
            theme: "github-dark-default",
          });
          if (!cancelled) {
            setHighlightedHtml(html);
          }
        } catch {
          // Ultimate fallback - render as pre
          if (!cancelled) {
            setHighlightedHtml("");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    highlight();

    return () => {
      cancelled = true;
    };
  }, [code, normalizedLang]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }, [code]);

  return (
    <div className="code-block my-2 rounded-lg overflow-hidden border border-floor-accent bg-[#0d1117]">
      {/* Header with language label and copy button */}
      <div className="flex items-center justify-between px-3 py-2 bg-floor-accent/50 border-b border-floor-accent">
        <div className="flex items-center gap-2 text-xs text-floor-muted">
          <Code2 className="w-3.5 h-3.5" />
          <span className="font-medium">{displayName}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-floor-muted hover:text-floor-text rounded transition-colors hover:bg-floor-accent"
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="code-content overflow-x-auto">
        {isLoading ? (
          <pre className="px-4 py-3 text-sm font-mono text-floor-text">
            <code>{code}</code>
          </pre>
        ) : highlightedHtml ? (
          <div
            className="shiki-wrapper [&>pre]:!bg-transparent [&>pre]:px-4 [&>pre]:py-3 [&>pre]:text-sm [&>pre]:overflow-x-auto [&_code]:font-mono"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="px-4 py-3 text-sm font-mono text-floor-text overflow-x-auto">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

// Utility to parse code blocks from markdown-style content
export function parseCodeBlocks(content: string): Array<{ type: "text" | "code"; content: string; language?: string }> {
  const parts: Array<{ type: "text" | "code"; content: string; language?: string }> = [];

  // Regex to match fenced code blocks: ```lang\ncode\n```
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before this code block
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push({ type: "text", content: textBefore });
      }
    }

    // Add the code block
    const language = match[1] || "text";
    const code = match[2].trim();
    parts.push({ type: "code", content: code, language });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last code block
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    if (remainingText.trim()) {
      parts.push({ type: "text", content: remainingText });
    }
  }

  // If no code blocks found, return the entire content as text
  if (parts.length === 0) {
    parts.push({ type: "text", content });
  }

  return parts;
}

// Check if content contains code blocks
export function hasCodeBlocks(content: string): boolean {
  return /```\w*\n[\s\S]*?```/.test(content);
}
