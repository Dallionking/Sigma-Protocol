/**
 * Sigma Protocol Core
 * Platform-agnostic core for Sigma Protocol workflow execution
 * @module @sigma-protocol/core
 */

// Re-export all types
export * from "./types/index.js";

// Re-export steps module
export * from "./steps/index.js";

// Re-export skills module
export * from "./skills/index.js";

// Re-export quality module
export * from "./quality/index.js";

// Re-export state module
export * from "./state/index.js";

// Re-export adapters
export * from "./adapters/index.js";

// Re-export generators
export * from "./generators/index.js";

// Version info
export const VERSION = "1.0.0-alpha.1";
export const PROTOCOL_VERSION = "5.0";
