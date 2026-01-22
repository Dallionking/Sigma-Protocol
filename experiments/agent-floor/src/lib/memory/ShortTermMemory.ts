/**
 * ShortTermMemory - Session-level memory stored in JSON
 *
 * Provides short-term memory storage for AI agents using JSON files.
 * Stores current task context, recent decisions, and conversation history
 * for the duration of a session.
 *
 * @module ShortTermMemory
 */

import { promises as fs } from "fs";
import * as path from "path";

/**
 * Maximum number of messages to retain in conversation history
 */
const MAX_HISTORY_SIZE = 50;

/**
 * Represents a single message in conversation history
 */
export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system" | "agent";
  content: string;
  timestamp: number;
  agentId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Represents a decision made during the session
 */
export interface Decision {
  id: string;
  description: string;
  reasoning: string;
  timestamp: number;
  context?: string;
  alternatives?: string[];
}

/**
 * Represents the current task context
 */
export interface TaskContext {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in_progress" | "blocked" | "completed";
  startedAt: number;
  updatedAt: number;
  assignedTo?: string;
  metadata?: Record<string, unknown>;
}

/**
 * The session data structure stored in JSON
 */
export interface SessionData {
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  currentTask: TaskContext | null;
  decisions: Decision[];
  history: ConversationMessage[];
}

/**
 * Options for ShortTermMemory configuration
 */
export interface ShortTermMemoryOptions {
  /**
   * Base directory for session files
   * @default 'docs/ralph/session' relative to workspace root
   */
  baseDir?: string;
  /**
   * Workspace root directory
   * @default process.cwd()
   */
  workspaceRoot?: string;
  /**
   * Whether to auto-create the directory if it doesn't exist
   * @default true
   */
  autoCreate?: boolean;
  /**
   * Maximum number of messages to keep in history
   * @default 50
   */
  maxHistorySize?: number;
}

/**
 * Generate a unique ID for entries
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * ShortTermMemory class for session-level memory storage in JSON format.
 *
 * This class provides methods to store and retrieve current task context,
 * recent decisions, and conversation history for a single session.
 *
 * @example
 * ```typescript
 * const memory = new ShortTermMemory({ workspaceRoot: '/path/to/project' });
 * await memory.load('session-001');
 *
 * // Store current task
 * memory.setCurrentTask({
 *   id: 'task-1',
 *   name: 'Implement feature X',
 *   description: 'Build the login form',
 *   status: 'in_progress',
 *   startedAt: Date.now(),
 *   updatedAt: Date.now()
 * });
 *
 * // Add a decision
 * memory.addDecision({
 *   id: 'dec-1',
 *   description: 'Use React Hook Form',
 *   reasoning: 'Better performance than Formik',
 *   timestamp: Date.now()
 * });
 *
 * // Add conversation message
 * memory.addMessage({
 *   id: 'msg-1',
 *   role: 'user',
 *   content: 'Please implement the login form',
 *   timestamp: Date.now()
 * });
 *
 * await memory.save('session-001');
 * ```
 */
export class ShortTermMemory {
  private baseDir: string;
  private workspaceRoot: string;
  private autoCreate: boolean;
  private maxHistorySize: number;
  private data: SessionData | null = null;
  private loaded: boolean = false;
  private currentSessionId: string | null = null;

  constructor(options: ShortTermMemoryOptions = {}) {
    this.workspaceRoot = options.workspaceRoot ?? process.cwd();
    this.baseDir = options.baseDir
      ? path.resolve(this.workspaceRoot, options.baseDir)
      : path.resolve(this.workspaceRoot, "docs", "ralph", "session");
    this.autoCreate = options.autoCreate ?? true;
    this.maxHistorySize = options.maxHistorySize ?? MAX_HISTORY_SIZE;
  }

  /**
   * Get the full path to a session file
   */
  getSessionPath(sessionId: string): string {
    return path.join(this.baseDir, `${sessionId}.json`);
  }

  /**
   * Get the base directory for session files
   */
  getBaseDir(): string {
    return this.baseDir;
  }

  /**
   * Check if a session file exists
   */
  async exists(sessionId: string): Promise<boolean> {
    try {
      await fs.access(this.getSessionPath(sessionId));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create an empty session data structure
   */
  private createEmptySession(sessionId: string): SessionData {
    const now = Date.now();
    return {
      sessionId,
      createdAt: now,
      updatedAt: now,
      currentTask: null,
      decisions: [],
      history: [],
    };
  }

  /**
   * Ensure the base directory exists
   */
  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  /**
   * Load session data from file.
   * If the file doesn't exist, creates an empty session.
   *
   * @param sessionId - The session identifier
   * @returns The loaded session data
   */
  async load(sessionId: string): Promise<SessionData> {
    const sessionPath = this.getSessionPath(sessionId);
    const fileExists = await this.exists(sessionId);

    if (fileExists) {
      const content = await fs.readFile(sessionPath, "utf-8");
      this.data = JSON.parse(content) as SessionData;
    } else {
      if (this.autoCreate) {
        await this.ensureDir();
        this.data = this.createEmptySession(sessionId);
      } else {
        throw new Error(`Session file not found: ${sessionPath}`);
      }
    }

    this.loaded = true;
    this.currentSessionId = sessionId;
    return this.data;
  }

  /**
   * Save session data to file.
   *
   * @param sessionId - The session identifier (optional, uses current session if not provided)
   */
  async save(sessionId?: string): Promise<void> {
    const targetSessionId = sessionId ?? this.currentSessionId;

    if (!targetSessionId) {
      throw new Error("No session ID provided and no session loaded");
    }

    if (!this.data) {
      throw new Error("No session data to save. Call load() first or create a new session.");
    }

    await this.ensureDir();

    // Update sessionId if saving to a different session
    if (sessionId && sessionId !== this.data.sessionId) {
      this.data.sessionId = sessionId;
    }

    this.data.updatedAt = Date.now();
    const sessionPath = this.getSessionPath(targetSessionId);
    await fs.writeFile(sessionPath, JSON.stringify(this.data, null, 2), "utf-8");
  }

  /**
   * Get the current task context
   */
  getCurrentTask(): TaskContext | null {
    this.ensureLoaded();
    return this.data!.currentTask;
  }

  /**
   * Set the current task context
   */
  setCurrentTask(task: TaskContext): void {
    this.ensureLoaded();
    task.updatedAt = Date.now();
    this.data!.currentTask = task;
    this.data!.updatedAt = Date.now();
  }

  /**
   * Update the current task status
   */
  updateTaskStatus(status: TaskContext["status"]): void {
    this.ensureLoaded();
    if (this.data!.currentTask) {
      this.data!.currentTask.status = status;
      this.data!.currentTask.updatedAt = Date.now();
      this.data!.updatedAt = Date.now();
    }
  }

  /**
   * Clear the current task (mark as completed or abandoned)
   */
  clearCurrentTask(): void {
    this.ensureLoaded();
    this.data!.currentTask = null;
    this.data!.updatedAt = Date.now();
  }

  /**
   * Get all recent decisions
   */
  getDecisions(): Decision[] {
    this.ensureLoaded();
    return [...this.data!.decisions];
  }

  /**
   * Add a new decision
   */
  addDecision(decision: Omit<Decision, "id" | "timestamp"> & Partial<Pick<Decision, "id" | "timestamp">>): Decision {
    this.ensureLoaded();
    const fullDecision: Decision = {
      id: decision.id ?? generateId(),
      timestamp: decision.timestamp ?? Date.now(),
      ...decision,
    };
    this.data!.decisions.push(fullDecision);
    this.data!.updatedAt = Date.now();
    return fullDecision;
  }

  /**
   * Get the most recent N decisions
   */
  getRecentDecisions(count: number = 10): Decision[] {
    this.ensureLoaded();
    return this.data!.decisions.slice(-count);
  }

  /**
   * Get conversation history (last 50 messages by default)
   */
  getHistory(): ConversationMessage[] {
    this.ensureLoaded();
    return [...this.data!.history];
  }

  /**
   * Add a message to conversation history.
   * Automatically trims to maxHistorySize.
   */
  addMessage(message: Omit<ConversationMessage, "id" | "timestamp"> & Partial<Pick<ConversationMessage, "id" | "timestamp">>): ConversationMessage {
    this.ensureLoaded();
    const fullMessage: ConversationMessage = {
      id: message.id ?? generateId(),
      timestamp: message.timestamp ?? Date.now(),
      ...message,
    };
    this.data!.history.push(fullMessage);

    // Trim history to max size
    if (this.data!.history.length > this.maxHistorySize) {
      this.data!.history = this.data!.history.slice(-this.maxHistorySize);
    }

    this.data!.updatedAt = Date.now();
    return fullMessage;
  }

  /**
   * Get the most recent N messages
   */
  getRecentMessages(count: number = 10): ConversationMessage[] {
    this.ensureLoaded();
    return this.data!.history.slice(-count);
  }

  /**
   * Search history for messages containing keyword
   */
  searchHistory(keyword: string): ConversationMessage[] {
    this.ensureLoaded();
    const lowerKeyword = keyword.toLowerCase();
    return this.data!.history.filter((msg) =>
      msg.content.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Get full session data
   */
  getSessionData(): SessionData {
    this.ensureLoaded();
    return { ...this.data! };
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Check if session has been loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Clear the loaded state (useful for switching sessions)
   */
  reset(): void {
    this.data = null;
    this.loaded = false;
    this.currentSessionId = null;
  }

  /**
   * Delete a session file
   */
  async delete(sessionId: string): Promise<void> {
    const sessionPath = this.getSessionPath(sessionId);
    try {
      await fs.unlink(sessionPath);
      if (this.currentSessionId === sessionId) {
        this.reset();
      }
    } catch {
      // File might not exist, ignore error
    }
  }

  /**
   * List all session files
   */
  async listSessions(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.baseDir);
      return files
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(".json", ""));
    } catch {
      return [];
    }
  }

  /**
   * Ensure session is loaded before operations
   */
  private ensureLoaded(): void {
    if (!this.loaded || !this.data) {
      throw new Error("Session not loaded. Call load(sessionId) first.");
    }
  }
}

/**
 * Create a new ShortTermMemory instance with default options
 */
export function createShortTermMemory(
  options?: ShortTermMemoryOptions
): ShortTermMemory {
  return new ShortTermMemory(options);
}

export default ShortTermMemory;
