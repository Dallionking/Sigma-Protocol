"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AI Chat Page
 * 
 * Chat interface with AI. Uses Vercel AI SDK for streaming.
 * Shows empty state when API key is not configured.
 * 
 * @module aiChat
 */
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if API key is configured
  const hasApiKey = !!process.env.NEXT_PUBLIC_HAS_OPENAI_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual AI SDK call)
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: "This is a demo response. Connect your OpenAI API key to enable real AI conversations. The boilerplate uses Vercel AI SDK for streaming responses.",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  if (!hasApiKey) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Powered by OpenAI</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-muted-foreground">
                Ask me anything! I can help with coding, writing, analysis, and more.
              </p>
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-3 max-w-3xl",
              message.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.role === "user"
                  ? "bg-primary"
                  : "bg-gradient-to-br from-purple-500 to-blue-500"
              )}
            >
              {message.role === "user" ? (
                <User className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>
            <div
              className={cn(
                "rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-4 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center max-w-md p-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">AI Not Configured</h2>
        <p className="text-muted-foreground mb-6">
          Add your OpenAI API key to enable AI conversations.
        </p>
        <div className="bg-muted rounded-lg p-4 text-left">
          <p className="text-sm font-mono text-muted-foreground">
            # Add to .env.local
            <br />
            OPENAI_API_KEY=sk-...
          </p>
        </div>
        <Button variant="outline" className="mt-6">
          View Documentation
        </Button>
      </div>
    </div>
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

