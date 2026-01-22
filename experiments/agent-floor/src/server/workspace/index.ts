/**
 * Workspace Module
 *
 * Exports sandboxed workspace services for team file system access.
 *
 * @see PRD-022: Terminal/File Access
 */

// SandboxedWorkspace
export {
  SandboxedWorkspace,
  createSandboxedWorkspace,
  type SandboxedWorkspaceOptions,
  type FileResult,
  type ReadResult,
  type WriteResult,
  type CommandResult,
  type FileEntry,
  type WorkspaceInfo,
} from "./SandboxedWorkspace";
