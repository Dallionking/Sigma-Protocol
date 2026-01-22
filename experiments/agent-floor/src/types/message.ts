export type MessageType =
  | "chat"
  | "task"
  | "question"
  | "answer"
  | "broadcast"
  | "system"
  | "handoff"
  | "review-request"
  | "review-complete";

export interface FloorMessage {
  id: string;
  from: string; // agent id or "system"
  to: string; // agent id, "broadcast", or "user"
  content: string;
  timestamp: number;
  type: MessageType;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  taskId?: string;
  mentions?: string[]; // @mentioned agent ids
  replyTo?: string; // message id being replied to
  attachments?: Attachment[];
  codeBlocks?: CodeBlock[];
}

export interface Attachment {
  type: "file" | "image" | "link";
  name: string;
  url: string;
  size?: number;
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface ChatLog {
  messages: FloorMessage[];
  lastUpdated: number;
}

// A2A Protocol message format (inspired by Google's A2A)
export interface A2AMessage {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params: {
    from: string;
    to: string;
    content: unknown;
    context?: A2AContext;
  };
}

export interface A2AContext {
  taskId?: string;
  conversationId?: string;
  parentMessageId?: string;
  priority?: "low" | "normal" | "high" | "urgent";
}

export interface A2AResponse {
  jsonrpc: "2.0";
  id: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// Task-related messages
export interface TaskAssignment {
  taskId: string;
  title: string;
  description: string;
  assignee: string;
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: number;
}

export interface TaskUpdate {
  taskId: string;
  status: "todo" | "in-progress" | "review" | "done" | "blocked";
  progress?: number; // 0-100
  notes?: string;
}

export interface ReviewRequest {
  taskId: string;
  title: string;
  description: string;
  requester: string;
  reviewer: string;
  artifacts?: string[]; // file paths or URLs
}
