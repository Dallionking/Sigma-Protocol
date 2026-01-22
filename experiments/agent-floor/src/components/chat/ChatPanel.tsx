"use client";

import { useRef, useEffect, useState } from "react";
import { Send, AtSign } from "lucide-react";
import { useFloorStore } from "@/lib/store/floor-store";
import { formatDistanceToNow } from "date-fns";
import type { FloorMessage } from "@/types/message";
import CodeBlock, { parseCodeBlocks, hasCodeBlocks } from "./CodeBlock";
import MessageReactions, { useMessageReactions, type ReactionType } from "./MessageReactions";

export default function ChatPanel() {
  const { messages, agents, inputMessage, setInputMessage, sendMessage } =
    useFloorStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const { getReactions, toggleReaction } = useMessageReactions();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle input change and @mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    // Check for @mention trigger
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const afterAt = value.slice(lastAtIndex + 1);
      if (!afterAt.includes(" ")) {
        setShowMentions(true);
        setMentionFilter(afterAt.toLowerCase());
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Insert @mention
  const insertMention = (agentId: string, name: string) => {
    const lastAtIndex = inputMessage.lastIndexOf("@");
    const newMessage =
      inputMessage.slice(0, lastAtIndex) + `@${name} `;
    setInputMessage(newMessage);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  // Send message
  const handleSend = () => {
    if (!inputMessage.trim()) return;

    // Extract mentions from message
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(inputMessage)) !== null) {
      const agent = agents.find(
        (a) => a.name.toLowerCase() === match![1].toLowerCase()
      );
      if (agent) mentions.push(agent.id);
    }

    // If single mention, send as direct message
    const to = mentions.length === 1 ? mentions[0] : undefined;
    sendMessage(inputMessage, to);
  };

  // Filter agents for mention dropdown
  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(mentionFilter)
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-floor-accent">
        <h2 className="text-lg font-semibold">Team Chat</h2>
        <p className="text-sm text-floor-muted">
          Use @mentions to talk to specific agents
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            agents={agents}
            reactions={getReactions(message.id)}
            onToggleReaction={toggleReaction}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-floor-accent">
        {/* Mention dropdown */}
        {showMentions && filteredAgents.length > 0 && (
          <div className="mb-2 bg-floor-bg border border-floor-accent rounded-lg overflow-hidden">
            {filteredAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => insertMention(agent.id, agent.name)}
                className="w-full px-3 py-2 text-left hover:bg-floor-accent flex items-center gap-2"
              >
                <span
                  className={`w-2 h-2 rounded-full ${getStatusClass(
                    agent.status
                  )}`}
                />
                <span className="font-medium">{agent.name}</span>
                <span className="text-floor-muted text-sm">{agent.role}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setInputMessage(inputMessage + "@");
              setShowMentions(true);
              inputRef.current?.focus();
            }}
            className="p-2 rounded-lg hover:bg-floor-accent text-floor-muted hover:text-floor-text transition-colors"
          >
            <AtSign className="w-5 h-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-floor-bg border border-floor-accent rounded-lg px-4 py-2 focus:outline-none focus:border-floor-highlight"
          />

          <button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="p-2 rounded-lg bg-floor-highlight text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  agents,
  reactions,
  onToggleReaction,
}: {
  message: FloorMessage;
  agents: { id: string; name: string; status: string }[];
  reactions: import("./MessageReactions").Reaction[];
  onToggleReaction: (messageId: string, reactionType: ReactionType) => void;
}) {
  const fromAgent = agents.find((a) => a.id === message.from);
  const isSystem = message.type === "system";
  const isUser = message.from === "user";

  // Render text content with @mentions highlighted
  const renderTextWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span key={i} className="mention">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Render content with code blocks and @mentions
  const renderContent = (content: string) => {
    // If no code blocks, render with mentions only
    if (!hasCodeBlocks(content)) {
      return renderTextWithMentions(content);
    }

    // Parse code blocks and render each part
    const parts = parseCodeBlocks(content);
    return parts.map((part, i) => {
      if (part.type === "code") {
        return (
          <CodeBlock
            key={i}
            code={part.content}
            language={part.language}
          />
        );
      }
      // Text part - render with mentions
      return (
        <span key={i}>
          {renderTextWithMentions(part.content)}
        </span>
      );
    });
  };

  if (isSystem) {
    return (
      <div className="text-center py-2">
        <span className="text-floor-muted text-sm bg-floor-accent px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
          isUser
            ? "bg-floor-highlight"
            : `bg-floor-accent ${getStatusClass(fromAgent?.status || "idle")}`
        }`}
      >
        {isUser ? "U" : fromAgent?.name[0] || "?"}
      </div>

      {/* Message */}
      <div
        className={`flex-1 ${
          isUser ? "text-right" : "text-left"
        }`}
      >
        <div className="mb-1">
          <span className="font-medium text-sm">
            {isUser ? "You" : fromAgent?.name || "Unknown"}
          </span>
          <span className="text-floor-muted text-xs ml-2">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>
        <div
          className={`inline-block rounded-lg px-3 py-2 max-w-[80%] ${
            isUser
              ? "bg-floor-highlight text-white"
              : "bg-floor-accent"
          }`}
        >
          {renderContent(message.content)}
        </div>
        {/* Message Reactions */}
        <div className={isUser ? "flex justify-end" : "flex justify-start"}>
          <MessageReactions
            messageId={message.id}
            reactions={reactions}
            onToggleReaction={onToggleReaction}
          />
        </div>
      </div>
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status) {
    case "idle":
      return "bg-agent-idle";
    case "working":
      return "bg-agent-working";
    case "thinking":
      return "bg-agent-thinking";
    case "talking":
      return "bg-agent-talking";
    default:
      return "bg-floor-muted";
  }
}
