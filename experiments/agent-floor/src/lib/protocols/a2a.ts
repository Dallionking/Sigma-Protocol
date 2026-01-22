/**
 * A2A Protocol Utilities - JSON-RPC 2.0 based agent-to-agent protocol helpers
 *
 * Implements PRD-010-002: A2A protocol utilities for agent communication
 *
 * Based on JSON-RPC 2.0 specification: https://www.jsonrpc.org/specification
 * Inspired by Google's A2A (Agent-to-Agent) protocol
 *
 * Features:
 * - createA2AMessage: Create properly formatted A2A requests
 * - createA2AResponse: Create properly formatted A2A responses (success/error)
 * - parseA2AMessage: Parse JSON string into typed A2A message
 * - validateA2AMessage: Validate message structure and required fields
 */

// =============================================================================
// TypeScript Types for A2A Protocol
// =============================================================================

/** JSON-RPC 2.0 version string */
export const JSONRPC_VERSION = "2.0" as const;

/** A2A Context for conversation tracking and priority */
export interface A2AContext {
  /** Associated task ID */
  taskId?: string;
  /** Conversation thread ID */
  conversationId?: string;
  /** Parent message ID for threading */
  parentMessageId?: string;
  /** Message priority level */
  priority?: A2APriority;
  /** Additional custom metadata */
  metadata?: Record<string, unknown>;
}

/** Priority levels for A2A messages */
export type A2APriority = "low" | "normal" | "high" | "urgent";

/** A2A Request parameters */
export interface A2AParams<T = unknown> {
  /** Sender agent ID */
  from: string;
  /** Recipient agent ID (or "broadcast" for all agents) */
  to: string;
  /** Message content/payload */
  content: T;
  /** Optional context for the message */
  context?: A2AContext;
}

/** A2A Request message (JSON-RPC 2.0 request) */
export interface A2AMessage<T = unknown> {
  /** JSON-RPC version - always "2.0" */
  jsonrpc: "2.0";
  /** Unique message identifier */
  id: string;
  /** Method name (action being requested) */
  method: string;
  /** Request parameters */
  params: A2AParams<T>;
}

/** A2A Response message (JSON-RPC 2.0 response) */
export interface A2AResponse<T = unknown> {
  /** JSON-RPC version - always "2.0" */
  jsonrpc: "2.0";
  /** Message ID this response corresponds to */
  id: string;
  /** Success result (mutually exclusive with error) */
  result?: T;
  /** Error object (mutually exclusive with result) */
  error?: A2AError;
}

/** A2A Error object (JSON-RPC 2.0 error) */
export interface A2AError {
  /** Error code (negative numbers for JSON-RPC errors) */
  code: A2AErrorCode | number;
  /** Human-readable error message */
  message: string;
  /** Additional error data */
  data?: unknown;
}

/** Standard JSON-RPC 2.0 error codes */
export enum A2AErrorCode {
  /** Invalid JSON was received */
  PARSE_ERROR = -32700,
  /** Request is not a valid JSON-RPC Request */
  INVALID_REQUEST = -32600,
  /** Method does not exist or is unavailable */
  METHOD_NOT_FOUND = -32601,
  /** Invalid method parameters */
  INVALID_PARAMS = -32602,
  /** Internal error */
  INTERNAL_ERROR = -32603,
  // Custom A2A error codes (application-defined: -32000 to -32099)
  /** Agent not found */
  AGENT_NOT_FOUND = -32001,
  /** Agent unavailable (busy, offline) */
  AGENT_UNAVAILABLE = -32002,
  /** Task not found */
  TASK_NOT_FOUND = -32003,
  /** Permission denied */
  PERMISSION_DENIED = -32004,
  /** Rate limit exceeded */
  RATE_LIMITED = -32005,
  /** Message too large */
  MESSAGE_TOO_LARGE = -32006,
  /** Invalid content type */
  INVALID_CONTENT = -32007,
}

/** Notification message (no response expected) */
export interface A2ANotification<T = unknown> {
  /** JSON-RPC version - always "2.0" */
  jsonrpc: "2.0";
  /** Method name */
  method: string;
  /** Notification parameters */
  params: A2AParams<T>;
  // Note: Notifications MUST NOT have an "id" field
}

/** Common A2A method names */
export type A2AMethod =
  | "message"
  | "task.assign"
  | "task.update"
  | "task.complete"
  | "review.request"
  | "review.complete"
  | "handoff"
  | "status.update"
  | "ping"
  | "capability.query"
  | string; // Allow custom methods

/** Validation result */
export interface ValidationResult {
  /** Whether the message is valid */
  valid: boolean;
  /** Validation errors (empty if valid) */
  errors: ValidationError[];
}

/** Individual validation error */
export interface ValidationError {
  /** Field path (e.g., "params.from") */
  field: string;
  /** Error message */
  message: string;
  /** Error code */
  code: string;
}

/** Parse result for messages */
export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: A2AError };

// =============================================================================
// Message ID Generation
// =============================================================================

/** Counter for generating unique IDs */
let messageIdCounter = 0;

/**
 * Generate a unique message ID
 * Format: a2a-{timestamp}-{counter}
 */
export function generateMessageId(): string {
  return `a2a-${Date.now()}-${messageIdCounter++}`;
}

/**
 * Reset message ID counter (useful for testing)
 */
export function resetMessageIdCounter(): void {
  messageIdCounter = 0;
}

// =============================================================================
// createA2AMessage - AC1
// =============================================================================

/** Options for creating an A2A message */
export interface CreateMessageOptions<T = unknown> {
  /** Custom message ID (auto-generated if not provided) */
  id?: string;
  /** Message context */
  context?: A2AContext;
  /** Content payload */
  content?: T;
}

/**
 * Create a properly formatted A2A request message
 *
 * @param from - Sender agent ID
 * @param to - Recipient agent ID (or "broadcast")
 * @param method - Method name (action being requested)
 * @param params - Additional parameters or content
 * @returns Formatted A2A message
 *
 * @example
 * ```ts
 * const msg = createA2AMessage("agent-1", "agent-2", "message", {
 *   content: "Hello, can you help with this task?",
 *   context: { taskId: "task-123" }
 * });
 * ```
 */
export function createA2AMessage<T = unknown>(
  from: string,
  to: string,
  method: A2AMethod,
  params?: CreateMessageOptions<T>
): A2AMessage<T> {
  const id = params?.id ?? generateMessageId();
  const content = params?.content ?? ({} as T);
  const context = params?.context;

  const message: A2AMessage<T> = {
    jsonrpc: JSONRPC_VERSION,
    id,
    method,
    params: {
      from,
      to,
      content,
    },
  };

  // Only include context if provided
  if (context) {
    message.params.context = context;
  }

  return message;
}

/**
 * Create an A2A notification (no response expected)
 * Notifications do not have an ID field
 *
 * @param from - Sender agent ID
 * @param to - Recipient agent ID (or "broadcast")
 * @param method - Method name
 * @param params - Notification parameters
 */
export function createA2ANotification<T = unknown>(
  from: string,
  to: string,
  method: A2AMethod,
  params?: Omit<CreateMessageOptions<T>, "id">
): A2ANotification<T> {
  const content = params?.content ?? ({} as T);
  const context = params?.context;

  const notification: A2ANotification<T> = {
    jsonrpc: JSONRPC_VERSION,
    method,
    params: {
      from,
      to,
      content,
    },
  };

  if (context) {
    notification.params.context = context;
  }

  return notification;
}

// =============================================================================
// createA2AResponse - AC2
// =============================================================================

/**
 * Create a success response for an A2A request
 *
 * @param id - Message ID this response corresponds to
 * @param result - Success result data
 * @returns Formatted A2A response
 *
 * @example
 * ```ts
 * const response = createA2AResponse("a2a-123", { status: "completed" });
 * ```
 */
export function createA2AResponse<T = unknown>(
  id: string,
  result: T
): A2AResponse<T> {
  return {
    jsonrpc: JSONRPC_VERSION,
    id,
    result,
  };
}

/**
 * Create an error response for an A2A request
 *
 * @param id - Message ID this response corresponds to
 * @param code - Error code (use A2AErrorCode enum)
 * @param message - Human-readable error message
 * @param data - Optional additional error data
 * @returns Formatted A2A error response
 *
 * @example
 * ```ts
 * const error = createA2AErrorResponse(
 *   "a2a-123",
 *   A2AErrorCode.AGENT_NOT_FOUND,
 *   "Agent 'agent-99' does not exist"
 * );
 * ```
 */
export function createA2AErrorResponse(
  id: string,
  code: A2AErrorCode | number,
  message: string,
  data?: unknown
): A2AResponse<never> {
  const response: A2AResponse<never> = {
    jsonrpc: JSONRPC_VERSION,
    id,
    error: {
      code,
      message,
    },
  };

  if (data !== undefined) {
    response.error!.data = data;
  }

  return response;
}

// =============================================================================
// parseA2AMessage - AC3
// =============================================================================

/**
 * Parse a JSON string into a typed A2A message
 *
 * @param json - JSON string to parse
 * @returns Parse result with either the parsed message or an error
 *
 * @example
 * ```ts
 * const result = parseA2AMessage(jsonString);
 * if (result.success) {
 *   console.log(result.data.method);
 * } else {
 *   console.error(result.error.message);
 * }
 * ```
 */
export function parseA2AMessage<T = unknown>(
  json: string
): ParseResult<A2AMessage<T>> {
  // Try to parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      success: false,
      error: {
        code: A2AErrorCode.PARSE_ERROR,
        message: "Invalid JSON: Failed to parse message",
      },
    };
  }

  // Validate structure
  const validation = validateA2AMessage(parsed);
  if (!validation.valid) {
    return {
      success: false,
      error: {
        code: A2AErrorCode.INVALID_REQUEST,
        message: `Invalid A2A message: ${validation.errors.map((e) => e.message).join(", ")}`,
        data: validation.errors,
      },
    };
  }

  return {
    success: true,
    data: parsed as A2AMessage<T>,
  };
}

/**
 * Parse a JSON string into a typed A2A response
 *
 * @param json - JSON string to parse
 * @returns Parse result with either the parsed response or an error
 */
export function parseA2AResponse<T = unknown>(
  json: string
): ParseResult<A2AResponse<T>> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      success: false,
      error: {
        code: A2AErrorCode.PARSE_ERROR,
        message: "Invalid JSON: Failed to parse response",
      },
    };
  }

  // Basic response validation
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as Record<string, unknown>).jsonrpc !== JSONRPC_VERSION
  ) {
    return {
      success: false,
      error: {
        code: A2AErrorCode.INVALID_REQUEST,
        message: "Invalid JSON-RPC response: missing or invalid jsonrpc field",
      },
    };
  }

  const response = parsed as A2AResponse<T>;
  if (typeof response.id !== "string") {
    return {
      success: false,
      error: {
        code: A2AErrorCode.INVALID_REQUEST,
        message: "Invalid JSON-RPC response: missing or invalid id field",
      },
    };
  }

  // A response must have either result or error, but not both
  const hasResult = "result" in response;
  const hasError = "error" in response;
  if (hasResult === hasError) {
    return {
      success: false,
      error: {
        code: A2AErrorCode.INVALID_REQUEST,
        message:
          "Invalid JSON-RPC response: must have either result or error, not both or neither",
      },
    };
  }

  return {
    success: true,
    data: response,
  };
}

// =============================================================================
// validateA2AMessage - AC4
// =============================================================================

/**
 * Validate an A2A message structure and required fields
 *
 * @param message - Message to validate (unknown type)
 * @returns Validation result with errors if invalid
 *
 * @example
 * ```ts
 * const result = validateA2AMessage(maybeMessage);
 * if (result.valid) {
 *   // Message is valid A2A format
 * } else {
 *   console.error("Validation errors:", result.errors);
 * }
 * ```
 */
export function validateA2AMessage(message: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if message is an object
  if (typeof message !== "object" || message === null) {
    errors.push({
      field: "",
      message: "Message must be a non-null object",
      code: "NOT_OBJECT",
    });
    return { valid: false, errors };
  }

  const msg = message as Record<string, unknown>;

  // Validate jsonrpc version
  if (msg.jsonrpc !== JSONRPC_VERSION) {
    errors.push({
      field: "jsonrpc",
      message: `jsonrpc must be "${JSONRPC_VERSION}"`,
      code: "INVALID_VERSION",
    });
  }

  // Validate id (required for requests, absent for notifications)
  // For this validator, we're checking requests which must have id
  if ("id" in msg) {
    if (typeof msg.id !== "string" || msg.id.length === 0) {
      errors.push({
        field: "id",
        message: "id must be a non-empty string",
        code: "INVALID_ID",
      });
    }
  }

  // Validate method
  if (typeof msg.method !== "string" || msg.method.length === 0) {
    errors.push({
      field: "method",
      message: "method must be a non-empty string",
      code: "INVALID_METHOD",
    });
  }

  // Validate params
  if (typeof msg.params !== "object" || msg.params === null) {
    errors.push({
      field: "params",
      message: "params must be a non-null object",
      code: "INVALID_PARAMS",
    });
  } else {
    const params = msg.params as Record<string, unknown>;

    // Validate params.from
    if (typeof params.from !== "string" || params.from.length === 0) {
      errors.push({
        field: "params.from",
        message: "params.from must be a non-empty string (sender agent ID)",
        code: "INVALID_FROM",
      });
    }

    // Validate params.to
    if (typeof params.to !== "string" || params.to.length === 0) {
      errors.push({
        field: "params.to",
        message:
          "params.to must be a non-empty string (recipient agent ID or 'broadcast')",
        code: "INVALID_TO",
      });
    }

    // Validate params.content (must exist, can be any type)
    if (!("content" in params)) {
      errors.push({
        field: "params.content",
        message: "params.content is required",
        code: "MISSING_CONTENT",
      });
    }

    // Validate params.context if present
    if ("context" in params && params.context !== undefined) {
      if (typeof params.context !== "object" || params.context === null) {
        errors.push({
          field: "params.context",
          message: "params.context must be an object if provided",
          code: "INVALID_CONTEXT",
        });
      } else {
        const context = params.context as Record<string, unknown>;

        // Validate priority if present
        if ("priority" in context) {
          const validPriorities = ["low", "normal", "high", "urgent"];
          if (!validPriorities.includes(context.priority as string)) {
            errors.push({
              field: "params.context.priority",
              message: `priority must be one of: ${validPriorities.join(", ")}`,
              code: "INVALID_PRIORITY",
            });
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Type guard to check if an unknown value is a valid A2A message
 *
 * @param value - Value to check
 * @returns True if value is a valid A2AMessage
 */
export function isA2AMessage(value: unknown): value is A2AMessage {
  return validateA2AMessage(value).valid && "id" in (value as object);
}

/**
 * Type guard to check if an unknown value is a valid A2A notification
 *
 * @param value - Value to check
 * @returns True if value is a valid A2ANotification
 */
export function isA2ANotification(value: unknown): value is A2ANotification {
  if (typeof value !== "object" || value === null) return false;
  const msg = value as Record<string, unknown>;

  // Notification must NOT have id
  if ("id" in msg) return false;

  // Must have jsonrpc and method
  if (msg.jsonrpc !== JSONRPC_VERSION) return false;
  if (typeof msg.method !== "string") return false;

  return true;
}

/**
 * Type guard to check if an A2A response is an error response
 */
export function isA2AErrorResponse(
  response: A2AResponse
): response is A2AResponse<never> & { error: A2AError } {
  return "error" in response && response.error !== undefined;
}

/**
 * Type guard to check if an A2A response is a success response
 */
export function isA2ASuccessResponse<T>(
  response: A2AResponse<T>
): response is A2AResponse<T> & { result: T } {
  return "result" in response && !("error" in response);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Serialize an A2A message to JSON string
 */
export function serializeA2AMessage(message: A2AMessage | A2AResponse): string {
  return JSON.stringify(message);
}

/**
 * Get the error message from an A2AError code
 */
export function getErrorMessage(code: A2AErrorCode): string {
  const messages: Record<A2AErrorCode, string> = {
    [A2AErrorCode.PARSE_ERROR]: "Parse error: Invalid JSON",
    [A2AErrorCode.INVALID_REQUEST]: "Invalid request",
    [A2AErrorCode.METHOD_NOT_FOUND]: "Method not found",
    [A2AErrorCode.INVALID_PARAMS]: "Invalid params",
    [A2AErrorCode.INTERNAL_ERROR]: "Internal error",
    [A2AErrorCode.AGENT_NOT_FOUND]: "Agent not found",
    [A2AErrorCode.AGENT_UNAVAILABLE]: "Agent unavailable",
    [A2AErrorCode.TASK_NOT_FOUND]: "Task not found",
    [A2AErrorCode.PERMISSION_DENIED]: "Permission denied",
    [A2AErrorCode.RATE_LIMITED]: "Rate limit exceeded",
    [A2AErrorCode.MESSAGE_TOO_LARGE]: "Message too large",
    [A2AErrorCode.INVALID_CONTENT]: "Invalid content type",
  };
  return messages[code] ?? "Unknown error";
}

/**
 * Create a batch of A2A messages (JSON-RPC 2.0 batch)
 */
export function createA2ABatch(messages: A2AMessage[]): string {
  return JSON.stringify(messages);
}

/**
 * Parse a batch of A2A messages
 */
export function parseA2ABatch<T = unknown>(
  json: string
): ParseResult<A2AMessage<T>[]> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      success: false,
      error: {
        code: A2AErrorCode.PARSE_ERROR,
        message: "Invalid JSON: Failed to parse batch",
      },
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      success: false,
      error: {
        code: A2AErrorCode.INVALID_REQUEST,
        message: "Batch must be an array",
      },
    };
  }

  // Validate each message in the batch
  const errors: ValidationError[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const validation = validateA2AMessage(parsed[i]);
    if (!validation.valid) {
      errors.push(
        ...validation.errors.map((e) => ({
          ...e,
          field: `[${i}].${e.field}`,
        }))
      );
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        code: A2AErrorCode.INVALID_REQUEST,
        message: `Invalid batch: ${errors.length} validation error(s)`,
        data: errors,
      },
    };
  }

  return {
    success: true,
    data: parsed as A2AMessage<T>[],
  };
}
