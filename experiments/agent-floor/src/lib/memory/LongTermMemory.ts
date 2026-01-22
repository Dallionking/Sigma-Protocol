/**
 * LongTermMemory - Memory persistence to AGENTS.md file
 *
 * Provides long-term memory storage for AI agents using a markdown file format.
 * Stores patterns, conventions, learnings, and project knowledge that persists
 * across sessions.
 *
 * @module LongTermMemory
 */

import { promises as fs } from "fs";
import * as path from "path";

/**
 * Result of a search operation
 */
export interface SearchResult {
  section: string;
  line: number;
  content: string;
  context: string;
}

/**
 * Parsed section from the memory file
 */
export interface MemorySection {
  name: string;
  level: number;
  content: string;
  startLine: number;
  endLine: number;
}

/**
 * Options for LongTermMemory configuration
 */
export interface LongTermMemoryOptions {
  /**
   * Path to the AGENTS.md file
   * @default 'docs/AGENTS.md' relative to workspace root
   */
  filePath?: string;
  /**
   * Workspace root directory
   * @default process.cwd()
   */
  workspaceRoot?: string;
  /**
   * Whether to auto-create the file if it doesn't exist
   * @default true
   */
  autoCreate?: boolean;
}

/**
 * Default AGENTS.md template for new files
 */
const DEFAULT_TEMPLATE = `# AGENTS.md - Long-Term Memory

Long-term memory for AI agents working on this project.

## Project Structure

<!-- Add project structure documentation here -->

## Coding Patterns

<!-- Add coding patterns and conventions here -->

## Known Issues

<!-- Document known issues and workarounds here -->

## Completed Stories

<!-- Track completed work here -->

## Learnings

<!-- Document learnings and insights here -->
`;

/**
 * LongTermMemory class for persistent memory storage in AGENTS.md format.
 *
 * This class provides methods to read, write, search, and manage
 * long-term memory stored in a markdown file format.
 *
 * @example
 * ```typescript
 * const memory = new LongTermMemory({ workspaceRoot: '/path/to/project' });
 * await memory.read();
 * const patterns = memory.getSection('Coding Patterns');
 * await memory.write('Learnings', '- Discovered that X works better than Y');
 * const results = memory.search('pathfinding');
 * ```
 */
export class LongTermMemory {
  private filePath: string;
  private workspaceRoot: string;
  private autoCreate: boolean;
  private content: string = "";
  private sections: MemorySection[] = [];
  private loaded: boolean = false;

  constructor(options: LongTermMemoryOptions = {}) {
    this.workspaceRoot = options.workspaceRoot ?? process.cwd();
    this.filePath = options.filePath
      ? path.resolve(this.workspaceRoot, options.filePath)
      : path.resolve(this.workspaceRoot, "docs", "AGENTS.md");
    this.autoCreate = options.autoCreate ?? true;
  }

  /**
   * Get the full path to the memory file
   */
  getFilePath(): string {
    return this.filePath;
  }

  /**
   * Check if the memory file exists
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read the memory file and parse its contents.
   * If the file doesn't exist and autoCreate is true, creates it with default template.
   *
   * @returns The raw content of the memory file
   * @throws Error if file doesn't exist and autoCreate is false
   */
  async read(): Promise<string> {
    const fileExists = await this.exists();

    if (!fileExists) {
      if (this.autoCreate) {
        await this.createDefaultFile();
      } else {
        throw new Error(`Memory file not found: ${this.filePath}`);
      }
    }

    this.content = await fs.readFile(this.filePath, "utf-8");
    this.sections = this.parseSections(this.content);
    this.loaded = true;

    return this.content;
  }

  /**
   * Create the memory file with default template
   */
  private async createDefaultFile(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.filePath, DEFAULT_TEMPLATE, "utf-8");
    this.content = DEFAULT_TEMPLATE;
    this.sections = this.parseSections(this.content);
  }

  /**
   * Parse markdown content into sections
   */
  private parseSections(content: string): MemorySection[] {
    const lines = content.split("\n");
    const sections: MemorySection[] = [];
    let currentSection: MemorySection | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headerMatch) {
        // Close previous section
        if (currentSection) {
          currentSection.endLine = i - 1;
          currentSection.content = lines
            .slice(currentSection.startLine + 1, i)
            .join("\n")
            .trim();
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          name: headerMatch[2].trim(),
          level: headerMatch[1].length,
          content: "",
          startLine: i,
          endLine: lines.length - 1,
        };
      }
    }

    // Close last section
    if (currentSection) {
      currentSection.endLine = lines.length - 1;
      currentSection.content = lines
        .slice(currentSection.startLine + 1)
        .join("\n")
        .trim();
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Write (append) content to a specific section.
   * If the section doesn't exist, creates it at the end of the file.
   *
   * @param section - The section name to write to (e.g., "Learnings", "Coding Patterns")
   * @param content - The content to append to the section
   * @param level - The header level for new sections (default: 2 for ##)
   */
  async write(section: string, content: string, level: number = 2): Promise<void> {
    if (!this.loaded) {
      await this.read();
    }

    const existingSection = this.sections.find(
      (s) => s.name.toLowerCase() === section.toLowerCase()
    );

    if (existingSection) {
      // Append to existing section
      const lines = this.content.split("\n");
      const insertLine = existingSection.endLine;

      // Find the end of actual content in the section (skip trailing empty lines)
      let actualEndLine = existingSection.endLine;
      while (actualEndLine > existingSection.startLine && lines[actualEndLine].trim() === "") {
        actualEndLine--;
      }

      // Insert new content after actual content
      const newContent = content.startsWith("\n") ? content : `\n${content}`;
      lines.splice(actualEndLine + 1, 0, newContent);

      this.content = lines.join("\n");
    } else {
      // Create new section at end
      const headerPrefix = "#".repeat(level);
      const newSection = `\n\n${headerPrefix} ${section}\n\n${content}\n`;
      this.content = this.content.trimEnd() + newSection;
    }

    await fs.writeFile(this.filePath, this.content, "utf-8");
    this.sections = this.parseSections(this.content);
  }

  /**
   * Get the content of a specific section by name.
   * Section matching is case-insensitive.
   *
   * @param name - The section name to retrieve (e.g., "Coding Patterns")
   * @returns The section content or null if not found
   */
  getSection(name: string): string | null {
    if (!this.loaded) {
      throw new Error("Memory not loaded. Call read() first.");
    }

    const section = this.sections.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );

    return section?.content ?? null;
  }

  /**
   * Get all sections with their names and content
   */
  getAllSections(): MemorySection[] {
    if (!this.loaded) {
      throw new Error("Memory not loaded. Call read() first.");
    }
    return [...this.sections];
  }

  /**
   * Search for entries containing the given keyword.
   * Returns matching lines with context.
   *
   * @param keyword - The keyword to search for (case-insensitive)
   * @param contextLines - Number of lines of context to include (default: 2)
   * @returns Array of search results with line numbers and context
   */
  search(keyword: string, contextLines: number = 2): SearchResult[] {
    if (!this.loaded) {
      throw new Error("Memory not loaded. Call read() first.");
    }

    const results: SearchResult[] = [];
    const lines = this.content.split("\n");
    const lowerKeyword = keyword.toLowerCase();

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(lowerKeyword)) {
        // Find which section this line belongs to
        const section = this.sections.find(
          (s) => i >= s.startLine && i <= s.endLine
        );

        // Get context lines
        const startContext = Math.max(0, i - contextLines);
        const endContext = Math.min(lines.length - 1, i + contextLines);
        const context = lines.slice(startContext, endContext + 1).join("\n");

        results.push({
          section: section?.name ?? "Unknown",
          line: i + 1, // 1-indexed for human readability
          content: lines[i],
          context,
        });
      }
    }

    return results;
  }

  /**
   * Check if a section exists
   */
  hasSection(name: string): boolean {
    if (!this.loaded) {
      throw new Error("Memory not loaded. Call read() first.");
    }
    return this.sections.some(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Get the raw content of the memory file
   */
  getRawContent(): string {
    if (!this.loaded) {
      throw new Error("Memory not loaded. Call read() first.");
    }
    return this.content;
  }

  /**
   * Clear the loaded state (useful for reloading)
   */
  reset(): void {
    this.content = "";
    this.sections = [];
    this.loaded = false;
  }

  /**
   * Check if memory has been loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }
}

/**
 * Create a new LongTermMemory instance with default options
 */
export function createLongTermMemory(
  options?: LongTermMemoryOptions
): LongTermMemory {
  return new LongTermMemory(options);
}

export default LongTermMemory;
