import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Task } from "../types";

interface TasksPageProps {
  tasks: Task[];
  createTask: (task: Omit<Task, "id">) => Promise<void>;
  deleteTask: (id: bigint) => Promise<void>;
  isLoading?: boolean;
}

export function TasksPage({
  tasks,
  createTask,
  deleteTask,
  isLoading = false,
}: TasksPageProps) {
  const [taskInput, setTaskInput] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTask({
        description: taskInput,
        taskTime,
        taskDate,
      });
      setTaskInput("");
      setTaskTime("");
      setTaskDate("");
      toast.success("Sequential task logged.");
    } catch {
      toast.error("Failed to save task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteTask(id);
      toast.success("Task removed.");
    } catch {
      toast.error("Failed to remove task.");
    }
  };

  const reversedTasks = [...tasks].reverse();

  return (
    <div className="space-y-8" data-ocid="tasks.section">
      <div
        className="rounded-[2.5rem] p-8"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(25px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3 className="text-2xl font-bold mb-6 text-foreground">
          Daily Mission Log
        </h3>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-4"
          data-ocid="tasks.form"
        >
          <input
            type="text"
            required
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            className="flex-1 custom-input"
            placeholder="Describe the daily objective..."
            data-ocid="tasks.input"
          />
          <div className="flex gap-3 flex-wrap items-stretch">
            <input
              type="time"
              required
              value={taskTime}
              onChange={(e) => setTaskTime(e.target.value)}
              className="custom-input w-32"
              data-ocid="tasks.time.input"
            />
            <input
              type="date"
              required
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="custom-input w-44"
              data-ocid="tasks.date.input"
            />
            <button
              type="submit"
              disabled={submitting}
              data-ocid="tasks.submit_button"
              className="px-8 rounded-xl font-bold transition-all py-2 text-white disabled:opacity-60"
              style={{
                background: "rgba(99,102,241,0.85)",
                boxShadow: "0 4px 24px rgba(99,102,241,0.2)",
              }}
            >
              {submitting ? "..." : "Add"}
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="tasks.loading_state">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-6 rounded-3xl flex items-center gap-6"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Skeleton
                className="w-12 h-12 rounded-2xl shrink-0"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div className="flex-1 space-y-2">
                <Skeleton
                  className="h-4 w-3/4"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <Skeleton
                  className="h-3 w-1/3"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div
          className="rounded-3xl p-16 text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(25px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          data-ocid="tasks.empty_state"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h4 className="text-xl font-bold text-foreground mb-2">
            No Missions Logged
          </h4>
          <p className="text-foreground/40 text-sm">
            Add your first daily objective above.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-20" data-ocid="tasks.list">
          {reversedTasks.map((task, renderIdx) => {
            const seqNum = tasks.length - renderIdx;
            return (
              <div
                key={String(task.id)}
                className="p-6 rounded-3xl flex items-center justify-between transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(25px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                }}
                data-ocid={`tasks.item.${renderIdx + 1}`}
              >
                <div className="flex items-center gap-6 min-w-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 text-sm"
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      color: "#818cf8",
                    }}
                  >
                    #{seqNum}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-lg leading-tight truncate text-foreground">
                      {task.description}
                    </h4>
                    <p className="text-xs text-foreground/40 tracking-widest font-bold uppercase mt-0.5">
                      {task.taskDate} AT {task.taskTime}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(task.id)}
                  className="shrink-0 transition-colors ml-4"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                  aria-label="Remove task"
                  data-ocid={`tasks.delete_button.${renderIdx + 1}`}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(248,113,113,0.9)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(255,255,255,0.2)";
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
