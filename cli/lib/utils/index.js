/**
 * Utility exports for Sigma CLI
 */

// Backup utilities
export { backupFile, restoreFromBackup, cleanupBackup } from "./backup.js";

// File utilities
export { makeScriptsExecutable, countFilesByExt, findSkillDirs } from "./files.js";

// Validation utilities
export {
  validateJsonSchema,
  checkPlatformPrerequisites,
  validateSourceFiles,
  validateSkillDirectory,
  validateAllSkills,
} from "./validation.js";

// Detection utilities
export {
  detectInstallations,
  detectMissingAssets,
  detectStreamCount,
  autoDetectPlatform,
  detectPRDStories,
} from "./detection.js";

// Environment utilities
export { loadEnvFile, loadEnvFiles } from "./env.js";
