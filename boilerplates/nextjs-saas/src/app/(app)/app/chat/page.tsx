"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Copy, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAvatar,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
} from "@/components/ui/chat-bubble";
import { cn } from "@/lib/utils";

/**
 * AI Chat Page
 * 
 * Chat interface powered by Vercel AI SDK.
 * Features theme-aware styling and 21st.dev inspired components.
 * 
 * @module aiChat
 */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasApiKey = false; // Set to true when OPENAI_API_KEY is configured

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual AI SDK call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: hasApiKey
          ? "This would be a real AI response when your OpenAI API key is configured."
          : "🔑 To enable AI responses, add your OPENAI_API_KEY to .env.local and integrate with the Vercel AI SDK.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleRegenerate = () => {
    // TODO: Implement regenerate with actual AI SDK
    console.log("Regenerate last response");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -my-8 -mx-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">AI Chat</h1>
            <p className="text-sm text-muted-foreground">Powered by Vercel AI SDK</p>
          </div>
        </div>
        {!hasApiKey && (
          <span className="px-3 py-1 bg-warning/10 border border-warning/20 rounded-full text-warning text-xs font-medium">
            Demo Mode
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.role === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                fallback={message.role === "user" ? "You" : "AI"}
                className={
                  message.role === "assistant"
                    ? "bg-gradient-to-br from-emerald-500 to-cyan-500"
                    : "bg-gradient-to-br from-violet-500 to-purple-600"
                }
              />
              <div className="flex flex-col">
                <ChatBubbleMessage variant={message.role === "user" ? "sent" : "received"}>
                  {message.content}
                </ChatBubbleMessage>
                {message.role === "assistant" && (
                  <ChatBubbleActionWrapper className="ml-1">
                    <ChatBubbleAction
                      icon={<Copy className="h-3.5 w-3.5" />}
                      onClick={() => handleCopy(message.content)}
                    />
                    <ChatBubbleAction
                      icon={<RefreshCcw className="h-3.5 w-3.5" />}
                      onClick={handleRegenerate}
                    />
                  </ChatBubbleActionWrapper>
                )}
              </div>
            </ChatBubble>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                fallback="AI"
                className="bg-gradient-to-br from-emerald-500 to-cyan-500"
              />
              <ChatBubbleMessage variant="received" isLoading />
            </ChatBubble>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className={cn(
                "flex-1 px-4 py-3 rounded-xl transition-colors",
                "bg-background border border-border",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              )}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            AI responses are generated. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
}
