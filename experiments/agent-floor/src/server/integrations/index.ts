/**
 * Server Integrations Module
 *
 * Exports external service integrations for agent use.
 */

// GitHub Integration
export {
  GitHubService,
  createGitHubService,
  type GitHubServiceOptions,
  type CommandResult,
  type BranchResult,
  type CommitResult,
  type PRResult,
  type PRStatus,
} from "./github";
