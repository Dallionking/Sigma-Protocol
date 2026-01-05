"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MessageLoading } from "@/components/ui/message-loading";

/**
 * Chat Bubble Components
 * 
 * A set of components for building chat interfaces.
 * Inspired by 21st.dev chat components with theme-aware styling.
 * 
 * @module ui
 */

interface ChatBubbleProps {
  variant?: "sent" | "received";
  className?: string;
  children: React.ReactNode;
}

export function ChatBubble({
  variant = "received",
  className,
  children,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 mb-4",
        variant === "sent" && "flex-row-reverse",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ChatBubbleMessageProps {
  variant?: "sent" | "received";
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ChatBubbleMessage({
  variant = "received",
  isLoading,
  className,
  children,
}: ChatBubbleMessageProps) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 max-w-[80%]",
        variant === "sent"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

interface ChatBubbleAvatarProps {
  src?: string;
  fallback?: string;
  className?: string;
}

export function ChatBubbleAvatar({
  src,
  fallback = "AI",
  className,
}: ChatBubbleAvatarProps) {
  return (
    <div
      className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
        "bg-gradient-to-br from-emerald-400 to-cyan-400 text-white",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={fallback} className="h-full w-full rounded-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  );
}

interface ChatBubbleActionProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ChatBubbleAction({
  icon,
  onClick,
  className,
}: ChatBubbleActionProps) {
  return (
    <button
      className={cn(
        "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
        className
      )}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

export function ChatBubbleActionWrapper({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-1 mt-2", className)}>
      {children}
    </div>
  );
}











