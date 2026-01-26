/**
 * State Manager
 * Platform-agnostic state persistence with atomic writes and snapshots
 * @module @sigma-protocol/core/state/manager
 */

import type {
  SigmaState,
  StepExecutionState,
  StepStatus,
  HITLDecision,
  StateSnapshot,
} from "../types/state.js";
import { createInitialState, validateState } from "../types/state.js";

/**
 * File system interface for platform abstraction
 */
export interface FileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  unlink(path: string): Promise<void>;
  readdir(path: string): Promise<string[]>;
}

/**
 * State manager configuration
 */
export interface StateManagerConfig {
  /**
   * Project root directory
   */
  projectRoot: string;

  /**
   * State directory name (default: .sigma)
   */
  stateDir?: string;

  /**
   * State file name (default: state.json)
   */
  stateFile?: string;

  /**
   * Enable auto-save on state changes
   */
  autoSave?: boolean;

  /**
   * Create snapshots before destructive operations
   */
  snapshotOnChange?: boolean;

  /**
   * Maximum number of snapshots to keep
   */
  maxSnapshots?: number;

  /**
   * File system implementation (for platform abstraction)
   */
  fs?: FileSystem;
}

/**
 * Default Node.js file system implementation
 */
async function getDefaultFileSystem(): Promise<FileSystem> {
  const fs = await import("fs/promises");
  const { existsSync } = await import("fs");

  return {
    readFile: (path: string) => fs.readFile(path, "utf-8"),
    writeFile: (path: string, content: string) => fs.writeFile(path, content, "utf-8"),
    exists: async (path: string) => existsSync(path),
    mkdir: (path: string, options?: { recursive?: boolean }) =>
      fs.mkdir(path, options).then(() => undefined),
    rename: (oldPath: string, newPath: string) => fs.rename(oldPath, newPath),
    unlink: (path: string) => fs.unlink(path),
    readdir: (path: string) => fs.readdir(path),
  };
}

/**
 * State Manager for Sigma Protocol
 */
export class StateManager {
  private state: SigmaState | null = null;
  private config: Omit<Required<StateManagerConfig>, "fs"> & { fs?: FileSystem };
  private fs: FileSystem | null = null;
  private dirty = false;

  constructor(config: StateManagerConfig) {
    this.config = {
      projectRoot: config.projectRoot,
      stateDir: config.stateDir ?? ".sigma",
      stateFile: config.stateFile ?? "state.json",
      autoSave: config.autoSave ?? true,
      snapshotOnChange: config.snapshotOnChange ?? true,
      maxSnapshots: config.maxSnapshots ?? 10,
      fs: config.fs,
    };
  }

  /**
   * Initialize the state manager
   */
  async initialize(): Promise<void> {
    if (!this.fs) {
      this.fs = this.config.fs ?? (await getDefaultFileSystem());
    }

    const { join } = await import("path");
    const stateDir = join(this.config.projectRoot, this.config.stateDir);

    // Create state directory if it doesn't exist
    if (!(await this.fs.exists(stateDir))) {
      await this.fs.mkdir(stateDir, { recursive: true });
    }

    // Load or create state
    await this.load();
  }

  /**
   * Get the state file path
   */
  private async getStatePath(): Promise<string> {
    const { join } = await import("path");
    return join(this.config.projectRoot, this.config.stateDir, this.config.stateFile);
  }

  /**
   * Get the snapshots directory path
   */
  private async getSnapshotsDir(): Promise<string> {
    const { join } = await import("path");
    return join(this.config.projectRoot, this.config.stateDir, "snapshots");
  }

  /**
   * Load state from disk
   */
  async load(): Promise<SigmaState> {
    const statePath = await this.getStatePath();

    if (await this.fs!.exists(statePath)) {
      try {
        const content = await this.fs!.readFile(statePath);
        const parsed = JSON.parse(content);

        if (validateState(parsed)) {
          this.state = parsed;
          this.dirty = false;
          return this.state;
        }
      } catch {
        // Invalid state, create new
      }
    }

    // Create new state
    const { basename } = await import("path");
    const projectId = basename(this.config.projectRoot);
    this.state = createInitialState(projectId, this.config.projectRoot);
    this.dirty = true;

    if (this.config.autoSave) {
      await this.save();
    }

    return this.state;
  }

  /**
   * Save state to disk (atomic write)
   */
  async save(): Promise<void> {
    if (!this.state) {
      throw new Error("State not initialized. Call load() first.");
    }

    const statePath = await this.getStatePath();
    const tempPath = `${statePath}.tmp`;
    const { dirname } = await import("path");

    // Update metadata
    this.state.metadata = {
      ...this.state.metadata,
      lastSavedAt: new Date().toISOString(),
      createdAt: this.state.metadata?.createdAt ?? new Date().toISOString(),
    };

    // Ensure directory exists
    const dir = dirname(statePath);
    if (!(await this.fs!.exists(dir))) {
      await this.fs!.mkdir(dir, { recursive: true });
    }

    // Atomic write: write to temp, then rename
    const content = JSON.stringify(this.state, null, 2);
    await this.fs!.writeFile(tempPath, content);
    await this.fs!.rename(tempPath, statePath);

    this.dirty = false;
  }

  /**
   * Get current state (read-only)
   */
  getState(): Readonly<SigmaState> {
    if (!this.state) {
      throw new Error("State not initialized. Call initialize() first.");
    }
    return this.state;
  }

  /**
   * Update step status
   */
  async updateStepStatus(
    stepNumber: number,
    status: StepStatus,
    score?: number | null
  ): Promise<void> {
    if (!this.state) {
      throw new Error("State not initialized.");
    }

    const now = new Date().toISOString();
    const existing = this.state.workflow.steps[stepNumber];

    const stepState: StepExecutionState = {
      number: stepNumber,
      name: existing?.name ?? `Step ${stepNumber}`,
      status,
      score: score ?? existing?.score ?? null,
      startedAt: status === "in_progress" ? now : existing?.startedAt ?? null,
      completedAt: status === "completed" ? now : existing?.completedAt ?? null,
      outputs: existing?.outputs ?? [],
      hitlDecisions: existing?.hitlDecisions ?? [],
      error: status === "failed" ? existing?.error : undefined,
    };

    this.state.workflow.steps[stepNumber] = stepState;
    this.state.workflow.currentStep = stepNumber;

    // Update progress
    const completedSteps = Object.values(this.state.workflow.steps).filter(
      (s) => s.status === "completed"
    ).length;
    const totalSteps = 14; // Steps 0-13
    this.state.workflow.progress = Math.round((completedSteps / totalSteps) * 100);

    this.dirty = true;

    if (this.config.autoSave) {
      await this.save();
    }
  }

  /**
   * Record HITL decision
   */
  async recordHITLDecision(
    checkpointId: string,
    stepNumber: number,
    decision: HITLDecision
  ): Promise<void> {
    if (!this.state) {
      throw new Error("State not initialized.");
    }

    // Add to history
    this.state.hitl.history.push({
      checkpointId,
      stepNumber,
      decision,
    });

    // Remove from pending
    this.state.hitl.pending = this.state.hitl.pending.filter(
      (p) => p.checkpointId !== checkpointId
    );

    // Add to step's HITL decisions
    const stepState = this.state.workflow.steps[stepNumber];
    if (stepState) {
      stepState.hitlDecisions.push(decision);
    }

    this.dirty = true;

    if (this.config.autoSave) {
      await this.save();
    }
  }

  /**
   * Create a snapshot
   */
  async createSnapshot(reason: string): Promise<StateSnapshot> {
    if (!this.state) {
      throw new Error("State not initialized.");
    }

    const { join } = await import("path");
    const snapshotsDir = await this.getSnapshotsDir();

    // Ensure snapshots directory exists
    if (!(await this.fs!.exists(snapshotsDir))) {
      await this.fs!.mkdir(snapshotsDir, { recursive: true });
    }

    const id = `snapshot-${Date.now()}`;
    const snapshotPath = join(snapshotsDir, `${id}.json`);

    const snapshot: StateSnapshot = {
      id,
      createdAt: new Date().toISOString(),
      reason,
      stepNumber: this.state.workflow.currentStep,
      path: snapshotPath,
    };

    // Save snapshot
    await this.fs!.writeFile(snapshotPath, JSON.stringify(this.state, null, 2));

    // Add to state
    this.state.snapshots.push(snapshot);

    // Prune old snapshots
    await this.pruneSnapshots();

    this.dirty = true;

    if (this.config.autoSave) {
      await this.save();
    }

    return snapshot;
  }

  /**
   * Restore from a snapshot
   */
  async restoreSnapshot(snapshotId: string): Promise<void> {
    if (!this.state) {
      throw new Error("State not initialized.");
    }

    const snapshot = this.state.snapshots.find((s) => s.id === snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    if (!(await this.fs!.exists(snapshot.path))) {
      throw new Error(`Snapshot file not found: ${snapshot.path}`);
    }

    // Create backup before restore
    if (this.config.snapshotOnChange) {
      await this.createSnapshot(`Backup before restoring ${snapshotId}`);
    }

    // Load snapshot
    const content = await this.fs!.readFile(snapshot.path);
    const restored = JSON.parse(content);

    if (!validateState(restored)) {
      throw new Error("Invalid snapshot state");
    }

    this.state = restored;
    this.dirty = true;

    if (this.config.autoSave) {
      await this.save();
    }
  }

  /**
   * Prune old snapshots
   */
  private async pruneSnapshots(): Promise<void> {
    if (!this.state) return;

    while (this.state.snapshots.length > this.config.maxSnapshots) {
      const oldest = this.state.snapshots.shift();
      if (oldest && (await this.fs!.exists(oldest.path))) {
        try {
          await this.fs!.unlink(oldest.path);
        } catch {
          // Ignore deletion errors
        }
      }
    }
  }

  /**
   * Check if state has unsaved changes
   */
  isDirty(): boolean {
    return this.dirty;
  }

  /**
   * Reset state to initial
   */
  async reset(): Promise<void> {
    if (this.config.snapshotOnChange && this.state) {
      await this.createSnapshot("Before reset");
    }

    const { basename } = await import("path");
    const projectId = basename(this.config.projectRoot);
    this.state = createInitialState(projectId, this.config.projectRoot);
    this.dirty = true;

    if (this.config.autoSave) {
      await this.save();
    }
  }
}

/**
 * Create a state manager with default settings
 */
export function createStateManager(projectRoot: string): StateManager {
  return new StateManager({ projectRoot });
}

/**
 * Create a state manager with custom configuration
 */
export function createCustomStateManager(config: StateManagerConfig): StateManager {
  return new StateManager(config);
}
