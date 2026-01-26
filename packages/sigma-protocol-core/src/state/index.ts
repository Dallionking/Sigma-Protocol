/**
 * Sigma Protocol State Module
 * State persistence and management
 * @module @sigma-protocol/core/state
 */

export {
  type FileSystem,
  type StateManagerConfig,
  StateManager,
  createStateManager,
  createCustomStateManager,
} from "./manager.js";
