"use client";

import { useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DroppableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot,
} from "@hello-pangea/dnd";
import { Plus, MoreVertical, User, Clock, AlertCircle, GripVertical } from "lucide-react";
import { useFloorStore } from "@/lib/store/floor-store";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils/cn";
import TaskDetailModal from "./TaskDetailModal";

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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;

      // Dropped outside a droppable area
      if (!destination) return;

      // Dropped in the same position
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      // Get the new status from the destination droppable ID
      const newStatus = destination.droppableId as TaskStatus;

      // Update the task status - this will sync to Colyseus if connected
      updateTask(draggableId, { status: newStatus });
    },
    [updateTask]
  );

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

      {/* Task columns with drag-and-drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-y-auto p-4">
          {statusColumns.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.id);

            return (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                agents={agents}
                onAssign={assignTask}
                onTaskClick={(task) => setSelectedTask(task)}
              />
            );
          })}
        </div>
      </DragDropContext>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          agents={agents}
          onClose={() => setSelectedTask(null)}
          onUpdate={(taskId, updates) => {
            updateTask(taskId, updates);
            // Update selectedTask state to reflect changes
            setSelectedTask((prev) =>
              prev ? { ...prev, ...updates, updatedAt: Date.now() } : null
            );
          }}
          onAssign={(taskId, agentId) => {
            assignTask(taskId, agentId);
            setSelectedTask((prev) =>
              prev ? { ...prev, assignee: agentId, updatedAt: Date.now() } : null
            );
          }}
        />
      )}
    </div>
  );
}

interface TaskColumnProps {
  column: { id: TaskStatus; label: string; color: string };
  tasks: Task[];
  agents: { id: string; name: string }[];
  onAssign: (taskId: string, agentId: string) => void;
  onTaskClick: (task: Task) => void;
}

function TaskColumn({ column, tasks, agents, onAssign, onTaskClick }: TaskColumnProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${column.color}`} />
        <span className="font-medium text-sm">{column.label}</span>
        <span className="text-floor-muted text-xs">
          ({tasks.length})
        </span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "space-y-2 min-h-[60px] p-2 rounded-lg border border-dashed transition-colors duration-200",
              snapshot.isDraggingOver
                ? "bg-floor-highlight/10 border-floor-highlight"
                : "bg-floor-bg border-floor-accent"
            )}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver ? (
              <p className="text-floor-muted text-xs text-center py-2">
                No tasks
              </p>
            ) : null}

            {tasks.map((task, index) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                index={index}
                agents={agents}
                onAssign={(agentId) => onAssign(task.id, agentId)}
                onTaskClick={() => onTaskClick(task)}
              />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

interface DraggableTaskCardProps {
  task: Task;
  index: number;
  agents: { id: string; name: string }[];
  onAssign: (agentId: string) => void;
  onTaskClick: () => void;
}

function DraggableTaskCard({ task, index, agents, onAssign, onTaskClick }: DraggableTaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "transition-shadow duration-200",
            snapshot.isDragging && "shadow-lg shadow-floor-highlight/20"
          )}
        >
          <TaskCard
            task={task}
            agents={agents}
            onAssign={onAssign}
            onTaskClick={onTaskClick}
            dragHandleProps={provided.dragHandleProps}
            isDragging={snapshot.isDragging}
          />
        </div>
      )}
    </Draggable>
  );
}

interface TaskCardProps {
  task: Task;
  agents: { id: string; name: string }[];
  onAssign: (agentId: string) => void;
  onTaskClick: () => void;
  dragHandleProps?: DraggableProvided["dragHandleProps"];
  isDragging?: boolean;
}

function TaskCard({
  task,
  agents,
  onAssign,
  onTaskClick,
  dragHandleProps,
  isDragging,
}: TaskCardProps) {
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
      className={cn(
        "task-card relative flex gap-2",
        priorityColors[task.priority],
        isDragging && "ring-2 ring-floor-highlight bg-floor-panel/95"
      )}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="flex-shrink-0 flex items-center cursor-grab active:cursor-grabbing text-floor-muted hover:text-floor-text"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Card content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <button
            onClick={onTaskClick}
            className="font-medium text-sm truncate text-left hover:text-floor-highlight transition-colors"
          >
            {task.title}
          </button>
          <button
            onClick={() => setShowAssignMenu(!showAssignMenu)}
            className="p-1 hover:bg-floor-accent rounded flex-shrink-0"
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
    </div>
  );
}
