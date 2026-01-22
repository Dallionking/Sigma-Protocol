"use client";

import { useState, useCallback } from "react";
import { ThumbsUp, Eye, Check } from "lucide-react";

// Reaction type definitions
export type ReactionType = "thumbsUp" | "eyes" | "checkmark";

export interface Reaction {
  type: ReactionType;
  count: number;
  hasReacted: boolean; // Current user has reacted
}

export interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  onToggleReaction: (messageId: string, reactionType: ReactionType) => void;
}

// Reaction icon mapping
const REACTION_ICONS: Record<ReactionType, typeof ThumbsUp> = {
  thumbsUp: ThumbsUp,
  eyes: Eye,
  checkmark: Check,
};

// Reaction labels for accessibility
const REACTION_LABELS: Record<ReactionType, string> = {
  thumbsUp: "Thumbs up",
  eyes: "Eyes",
  checkmark: "Checkmark",
};

// Default reactions when none exist
const DEFAULT_REACTIONS: Reaction[] = [
  { type: "thumbsUp", count: 0, hasReacted: false },
  { type: "eyes", count: 0, hasReacted: false },
  { type: "checkmark", count: 0, hasReacted: false },
];

export default function MessageReactions({
  messageId,
  reactions,
  onToggleReaction,
}: MessageReactionsProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);

  // Merge provided reactions with defaults
  const mergedReactions = DEFAULT_REACTIONS.map((defaultReaction) => {
    const provided = reactions.find((r) => r.type === defaultReaction.type);
    return provided || defaultReaction;
  });

  // Only show reactions that have counts > 0
  const activeReactions = mergedReactions.filter((r) => r.count > 0);

  const handleToggle = useCallback(
    (type: ReactionType) => {
      onToggleReaction(messageId, type);
    },
    [messageId, onToggleReaction]
  );

  return (
    <div
      className="relative inline-flex items-center gap-1 mt-1"
      onMouseEnter={() => setIsPickerVisible(true)}
      onMouseLeave={() => {
        setIsPickerVisible(false);
        setHoveredReaction(null);
      }}
    >
      {/* Existing reactions display */}
      {activeReactions.length > 0 && (
        <div className="flex items-center gap-0.5">
          {activeReactions.map((reaction) => {
            const Icon = REACTION_ICONS[reaction.type];
            return (
              <button
                key={reaction.type}
                onClick={() => handleToggle(reaction.type)}
                aria-label={`${REACTION_LABELS[reaction.type]}: ${reaction.count} reaction${reaction.count !== 1 ? "s" : ""}. ${reaction.hasReacted ? "Remove your reaction" : "Add reaction"}`}
                className={`
                  group/reaction
                  inline-flex items-center gap-1
                  px-2 py-0.5
                  text-xs
                  rounded-full
                  transition-all duration-200 ease-out
                  ${
                    reaction.hasReacted
                      ? "bg-floor-highlight/20 text-floor-highlight border border-floor-highlight/40"
                      : "bg-floor-accent text-floor-muted border border-transparent hover:border-floor-border"
                  }
                  hover:scale-105
                  active:scale-95
                `}
              >
                <Icon
                  className={`
                    w-3 h-3
                    transition-transform duration-200
                    group-hover/reaction:scale-110
                    ${reaction.hasReacted ? "text-floor-highlight" : ""}
                  `}
                />
                <span className="font-medium tabular-nums">{reaction.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reaction picker - appears on hover */}
      <div
        className={`
          flex items-center gap-0.5
          p-1
          bg-floor-card/95 backdrop-blur-sm
          border border-floor-border
          rounded-full
          shadow-lg shadow-black/20
          transition-all duration-200 ease-out
          ${
            isPickerVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-2 pointer-events-none"
          }
        `}
      >
        {mergedReactions.map((reaction) => {
          const Icon = REACTION_ICONS[reaction.type];
          const isHovered = hoveredReaction === reaction.type;

          return (
            <button
              key={reaction.type}
              onClick={() => handleToggle(reaction.type)}
              onMouseEnter={() => setHoveredReaction(reaction.type)}
              onMouseLeave={() => setHoveredReaction(null)}
              aria-label={`React with ${REACTION_LABELS[reaction.type]}`}
              className={`
                relative
                p-1.5
                rounded-full
                transition-all duration-150 ease-out
                ${
                  reaction.hasReacted
                    ? "text-floor-highlight bg-floor-highlight/10"
                    : "text-floor-muted hover:text-floor-text hover:bg-floor-accent"
                }
                ${isHovered ? "scale-125" : "scale-100"}
                active:scale-90
              `}
            >
              <Icon className="w-4 h-4" />

              {/* Pulse effect on hover */}
              {isHovered && (
                <span
                  className="
                    absolute inset-0
                    rounded-full
                    bg-floor-highlight/20
                    animate-ping
                  "
                  style={{ animationDuration: "0.6s" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Utility hook for managing reactions state
export function useMessageReactions(initialReactions: Record<string, Reaction[]> = {}) {
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>(initialReactions);

  const toggleReaction = useCallback((messageId: string, reactionType: ReactionType) => {
    setReactions((prev) => {
      const messageReactions = prev[messageId] || DEFAULT_REACTIONS.map((r) => ({ ...r }));

      const updatedReactions = messageReactions.map((reaction) => {
        if (reaction.type === reactionType) {
          return {
            ...reaction,
            count: reaction.hasReacted ? reaction.count - 1 : reaction.count + 1,
            hasReacted: !reaction.hasReacted,
          };
        }
        return reaction;
      });

      return {
        ...prev,
        [messageId]: updatedReactions,
      };
    });
  }, []);

  const getReactions = useCallback(
    (messageId: string): Reaction[] => {
      return reactions[messageId] || DEFAULT_REACTIONS;
    },
    [reactions]
  );

  return {
    reactions,
    toggleReaction,
    getReactions,
  };
}
