"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  User,
  Clock,
  AlertTriangle,
  Flag,
  Edit2,
  Check,
  ChevronDown,
  Activity,
  Tag,
  Calendar,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils/cn";

type TaskStatus = "todo" | "in-progress" | "review" | "done" | "blocked";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string | null;
  priority: TaskPriority;
  createdAt: number;
  updatedAt: number;
}

interface Agent {
  id: string;
  name: string;
}

interface ActivityEntry {
  id: string;
  type: "created" | "status_change" | "assignee_change" | "priority_change" | "edit";
  description: string;
  timestamp: number;
  actor?: string;
  oldValue?: string;
  newValue?: string;
}

interface TaskDetailModalProps {
  task: Task;
  agents: Agent[];
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onAssign: (taskId: string, agentId: string) => void;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  todo: { label: "To Do", color: "text-gray-400", bgColor: "bg-gray-500/20" },
  "in-progress": { label: "In Progress", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  review: { label: "Review", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  done: { label: "Done", color: "text-green-400", bgColor: "bg-green-500/20" },
  blocked: { label: "Blocked", color: "text-red-400", bgColor: "bg-red-500/20" },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string; icon: boolean }> = {
  low: { label: "Low", color: "text-green-400", bgColor: "bg-green-500/20", icon: false },
  medium: { label: "Medium", color: "text-yellow-400", bgColor: "bg-yellow-500/20", icon: false },
  high: { label: "High", color: "text-orange-400", bgColor: "bg-orange-500/20", icon: false },
  critical: { label: "Critical", color: "text-red-400", bgColor: "bg-red-500/20", icon: true },
};

export default function TaskDetailModal({
  task,
  agents,
  onClose,
  onUpdate,
  onAssign,
}: TaskDetailModalProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const assignee = agents.find((a) => a.id === task.assignee);

  // Generate activity history from task data
  const activityHistory: ActivityEntry[] = generateActivityHistory(task);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isEditingDescription]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isEditingTitle) {
          setIsEditingTitle(false);
          setEditTitle(task.title);
        } else if (isEditingDescription) {
          setIsEditingDescription(false);
          setEditDescription(task.description);
        } else if (showAssigneeDropdown || showPriorityDropdown || showStatusDropdown) {
          setShowAssigneeDropdown(false);
          setShowPriorityDropdown(false);
          setShowStatusDropdown(false);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isEditingTitle, isEditingDescription, showAssigneeDropdown, showPriorityDropdown, showStatusDropdown, task.title, task.description, onClose]);

  const handleSaveTitle = useCallback(() => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  }, [editTitle, task.title, task.id, onUpdate]);

  const handleSaveDescription = useCallback(() => {
    if (editDescription !== task.description) {
      onUpdate(task.id, { description: editDescription });
    }
    setIsEditingDescription(false);
  }, [editDescription, task.description, task.id, onUpdate]);

  const handleKeyDown = (
    event: React.KeyboardEvent,
    saveHandler: () => void
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      saveHandler();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-floor-panel border border-floor-accent rounded-xl shadow-2xl"
        role="dialog"
        aria-labelledby="task-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-floor-accent">
          <div className="flex-1 min-w-0 pr-4">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => handleKeyDown(e, handleSaveTitle)}
                  className="w-full bg-floor-bg border border-floor-highlight rounded px-2 py-1 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-floor-highlight"
                  aria-label="Edit task title"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 text-green-400 hover:text-green-300"
                  aria-label="Save title"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2
                  id="task-modal-title"
                  className="text-lg font-semibold truncate"
                >
                  {task.title}
                </h2>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1 opacity-0 group-hover:opacity-100 text-floor-muted hover:text-floor-text transition-opacity"
                  aria-label="Edit title"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1 text-xs text-floor-muted">
              <span>ID: {task.id}</span>
              <span className="text-floor-accent">|</span>
              <span>
                Created {formatDistanceToNow(task.createdAt, { addSuffix: true })}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-floor-muted hover:text-floor-text hover:bg-floor-accent rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Task metadata grid */}
          <div className="grid grid-cols-2 gap-4 p-4 border-b border-floor-accent">
            {/* Status */}
            <div className="relative">
              <label className="block text-xs text-floor-muted mb-1.5">
                <Tag className="w-3 h-3 inline mr-1" />
                Status
              </label>
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowAssigneeDropdown(false);
                  setShowPriorityDropdown(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg border border-floor-accent hover:border-floor-highlight transition-colors",
                  statusConfig[task.status].bgColor
                )}
              >
                <span className={cn("text-sm font-medium", statusConfig[task.status].color)}>
                  {statusConfig[task.status].label}
                </span>
                <ChevronDown className="w-4 h-4 text-floor-muted" />
              </button>

              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-floor-panel border border-floor-accent rounded-lg shadow-lg overflow-hidden">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => {
                        onUpdate(task.id, { status: status as TaskStatus });
                        setShowStatusDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-floor-accent flex items-center gap-2",
                        task.status === status && "bg-floor-accent"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full", config.bgColor.replace("/20", ""))} />
                      <span className={config.color}>{config.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assignee */}
            <div className="relative">
              <label className="block text-xs text-floor-muted mb-1.5">
                <User className="w-3 h-3 inline mr-1" />
                Assignee
              </label>
              <button
                onClick={() => {
                  setShowAssigneeDropdown(!showAssigneeDropdown);
                  setShowStatusDropdown(false);
                  setShowPriorityDropdown(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-floor-accent hover:border-floor-highlight transition-colors bg-floor-bg"
              >
                <span className="text-sm">
                  {assignee ? assignee.name : "Unassigned"}
                </span>
                <ChevronDown className="w-4 h-4 text-floor-muted" />
              </button>

              {showAssigneeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-floor-panel border border-floor-accent rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      onUpdate(task.id, { assignee: null });
                      setShowAssigneeDropdown(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-floor-accent flex items-center gap-2",
                      !task.assignee && "bg-floor-accent"
                    )}
                  >
                    <User className="w-4 h-4 text-floor-muted" />
                    <span className="text-floor-muted italic">Unassigned</span>
                  </button>
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        onAssign(task.id, agent.id);
                        setShowAssigneeDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-floor-accent flex items-center gap-2",
                        task.assignee === agent.id && "bg-floor-accent"
                      )}
                    >
                      <User className="w-4 h-4" />
                      {agent.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="relative">
              <label className="block text-xs text-floor-muted mb-1.5">
                <Flag className="w-3 h-3 inline mr-1" />
                Priority
              </label>
              <button
                onClick={() => {
                  setShowPriorityDropdown(!showPriorityDropdown);
                  setShowStatusDropdown(false);
                  setShowAssigneeDropdown(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg border border-floor-accent hover:border-floor-highlight transition-colors",
                  priorityConfig[task.priority].bgColor
                )}
              >
                <span className={cn("text-sm font-medium flex items-center gap-1.5", priorityConfig[task.priority].color)}>
                  {priorityConfig[task.priority].icon && <AlertTriangle className="w-3.5 h-3.5" />}
                  {priorityConfig[task.priority].label}
                </span>
                <ChevronDown className="w-4 h-4 text-floor-muted" />
              </button>

              {showPriorityDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-floor-panel border border-floor-accent rounded-lg shadow-lg overflow-hidden">
                  {Object.entries(priorityConfig).map(([priority, config]) => (
                    <button
                      key={priority}
                      onClick={() => {
                        onUpdate(task.id, { priority: priority as TaskPriority });
                        setShowPriorityDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-floor-accent flex items-center gap-2",
                        task.priority === priority && "bg-floor-accent"
                      )}
                    >
                      {config.icon && <AlertTriangle className={cn("w-3.5 h-3.5", config.color)} />}
                      <span className={config.color}>{config.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Last Updated */}
            <div>
              <label className="block text-xs text-floor-muted mb-1.5">
                <Clock className="w-3 h-3 inline mr-1" />
                Last Updated
              </label>
              <div className="px-3 py-2 rounded-lg border border-floor-accent bg-floor-bg text-sm">
                {format(task.updatedAt, "MMM d, yyyy h:mm a")}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 border-b border-floor-accent">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-floor-muted">
                <MessageSquare className="w-3 h-3 inline mr-1" />
                Description
              </label>
              {!isEditingDescription && (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="text-xs text-floor-muted hover:text-floor-text flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>

            {isEditingDescription ? (
              <div>
                <textarea
                  ref={descriptionInputRef}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-floor-bg border border-floor-highlight rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-floor-highlight resize-none"
                  placeholder="Add a description..."
                  aria-label="Edit task description"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setIsEditingDescription(false);
                      setEditDescription(task.description);
                    }}
                    className="px-3 py-1.5 text-xs text-floor-muted hover:text-floor-text"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDescription}
                    className="px-3 py-1.5 text-xs bg-floor-highlight text-white rounded hover:bg-opacity-90"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDescription(true)}
                className="min-h-[60px] p-3 bg-floor-bg border border-floor-accent rounded-lg text-sm cursor-pointer hover:border-floor-highlight transition-colors"
              >
                {task.description ? (
                  <p className="whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-floor-muted italic">Click to add a description...</p>
                )}
              </div>
            )}
          </div>

          {/* Activity History */}
          <div className="p-4">
            <h3 className="text-xs text-floor-muted mb-3 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Activity History
            </h3>

            {activityHistory.length > 0 ? (
              <div className="space-y-3">
                {activityHistory.map((entry) => (
                  <ActivityItem key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-floor-muted text-sm">
                No activity recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-floor-accent bg-floor-bg">
          <div className="text-xs text-floor-muted">
            <Calendar className="w-3 h-3 inline mr-1" />
            Created {format(task.createdAt, "MMM d, yyyy")}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-floor-accent text-floor-text rounded-lg text-sm hover:bg-floor-highlight transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  entry: ActivityEntry;
}

function ActivityItem({ entry }: ActivityItemProps) {
  const getIcon = () => {
    switch (entry.type) {
      case "created":
        return <Calendar className="w-3.5 h-3.5 text-green-400" />;
      case "status_change":
        return <ArrowRight className="w-3.5 h-3.5 text-blue-400" />;
      case "assignee_change":
        return <User className="w-3.5 h-3.5 text-purple-400" />;
      case "priority_change":
        return <Flag className="w-3.5 h-3.5 text-orange-400" />;
      case "edit":
        return <Edit2 className="w-3.5 h-3.5 text-floor-muted" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-floor-muted" />;
    }
  };

  return (
    <div className="flex gap-3 text-sm">
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-floor-text">{entry.description}</p>
        <p className="text-xs text-floor-muted mt-0.5">
          {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

function generateActivityHistory(task: Task): ActivityEntry[] {
  const activities: ActivityEntry[] = [];

  // Task creation is always the first activity
  activities.push({
    id: `${task.id}-created`,
    type: "created",
    description: "Task created",
    timestamp: task.createdAt,
  });

  // If updated after creation, add an update entry
  if (task.updatedAt > task.createdAt) {
    activities.push({
      id: `${task.id}-updated`,
      type: "edit",
      description: "Task updated",
      timestamp: task.updatedAt,
    });
  }

  // If assigned, add assignment entry
  if (task.assignee) {
    activities.push({
      id: `${task.id}-assigned`,
      type: "assignee_change",
      description: `Assigned to agent`,
      timestamp: task.createdAt + 1000, // Slightly after creation
      newValue: task.assignee,
    });
  }

  // If status is not todo, add status change
  if (task.status !== "todo") {
    activities.push({
      id: `${task.id}-status`,
      type: "status_change",
      description: `Status changed to ${statusConfig[task.status].label}`,
      timestamp: task.updatedAt - 500,
      newValue: task.status,
    });
  }

  // Sort by timestamp descending (newest first)
  return activities.sort((a, b) => b.timestamp - a.timestamp);
}

export type { Task, Agent, ActivityEntry, TaskDetailModalProps };
