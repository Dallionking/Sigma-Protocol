"use client";

import { useState } from "react";
import { Plus, MoreVertical, User, Clock, AlertCircle } from "lucide-react";
import { useFloorStore } from "@/lib/store/floor-store";
import { formatDistanceToNow } from "date-fns";

type TaskStatus = "todo" | "in-progress" | "review" | "done" | "blocked";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string | null;
  priority: "low" | "medium" | "high" | "critical";
  createdAt: number;
  updatedAt: number;
}

const statusColumns: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-gray-500" },
  { id: "in-progress", label: "In Progress", color: "bg-blue-500" },
  { id: "review", label: "Review", color: "bg-yellow-500" },
  { id: "done", label: "Done", color: "bg-green-500" },
];

export default function TaskBoard() {
  const { tasks, agents, createTask, updateTask, assignTask } = useFloorStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    createTask({
      ...newTask,
      status: "todo",
      assignee: null,
    });

    setNewTask({ title: "", description: "", priority: "medium" });
    setShowCreateForm(false);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    updateTask(taskId, { status });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-floor-accent flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Task Board</h2>
          <p className="text-sm text-floor-muted">
            {tasks.length} tasks total
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-floor-highlight text-white rounded-lg text-sm hover:bg-opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Create task form */}
      {showCreateForm && (
        <div className="p-4 border-b border-floor-accent bg-floor-bg">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) =>
              setNewTask({ ...newTask, title: e.target.value })
            }
            placeholder="Task title..."
            className="w-full bg-floor-panel border border-floor-accent rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-floor-highlight"
          />
          <textarea
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            placeholder="Description..."
            rows={2}
            className="w-full bg-floor-panel border border-floor-accent rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-floor-highlight resize-none"
          />
          <div className="flex items-center justify-between">
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as Task["priority"],
                })
              }
              className="bg-floor-panel border border-floor-accent rounded-lg px-3 py-1.5 focus:outline-none focus:border-floor-highlight"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1.5 text-sm text-floor-muted hover:text-floor-text"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-3 py-1.5 bg-floor-highlight text-white rounded-lg text-sm hover:bg-opacity-90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task columns */}
      <div className="flex-1 overflow-y-auto p-4">
        {statusColumns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);

          return (
            <div key={column.id} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${column.color}`} />
                <span className="font-medium text-sm">{column.label}</span>
                <span className="text-floor-muted text-xs">
                  ({columnTasks.length})
                </span>
              </div>

              <div
                onDrop={(e) => handleDrop(e, column.id)}
                onDragOver={handleDragOver}
                className="space-y-2 min-h-[60px] p-2 rounded-lg bg-floor-bg border border-dashed border-floor-accent"
              >
                {columnTasks.length === 0 ? (
                  <p className="text-floor-muted text-xs text-center py-2">
                    No tasks
                  </p>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      agents={agents}
                      onDragStart={handleDragStart}
                      onAssign={(agentId) => assignTask(task.id, agentId)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  agents,
  onDragStart,
  onAssign,
}: {
  task: Task;
  agents: { id: string; name: string }[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onAssign: (agentId: string) => void;
}) {
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const assignee = agents.find((a) => a.id === task.assignee);

  const priorityColors: Record<string, string> = {
    low: "border-l-green-500",
    medium: "border-l-yellow-500",
    high: "border-l-orange-500",
    critical: "border-l-red-500",
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`task-card ${priorityColors[task.priority]} relative`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm">{task.title}</h4>
        <button
          onClick={() => setShowAssignMenu(!showAssignMenu)}
          className="p-1 hover:bg-floor-accent rounded"
        >
          <MoreVertical className="w-4 h-4 text-floor-muted" />
        </button>
      </div>

      {task.description && (
        <p className="text-floor-muted text-xs mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {assignee ? (
            <span className="flex items-center gap-1 text-floor-muted">
              <User className="w-3 h-3" />
              {assignee.name}
            </span>
          ) : (
            <span className="text-floor-muted italic">Unassigned</span>
          )}
        </div>

        <span className="text-floor-muted flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(task.updatedAt, { addSuffix: true })}
        </span>
      </div>

      {/* Priority badge */}
      {task.priority === "critical" && (
        <div className="absolute top-2 right-8 text-red-500">
          <AlertCircle className="w-4 h-4" />
        </div>
      )}

      {/* Assign menu */}
      {showAssignMenu && (
        <div className="absolute right-0 top-8 z-10 bg-floor-panel border border-floor-accent rounded-lg shadow-lg overflow-hidden min-w-[150px]">
          <div className="p-2 border-b border-floor-accent text-xs text-floor-muted">
            Assign to:
          </div>
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                onAssign(agent.id);
                setShowAssignMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-floor-accent flex items-center gap-2"
            >
              <User className="w-3 h-3" />
              {agent.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
