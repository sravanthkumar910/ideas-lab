import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Plus,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Task } from "../types";

interface TasksPageProps {
  tasks: Task[];
  createTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask?: (id: bigint, updates: Omit<Task, "id">) => Promise<void>;
  deleteTask: (id: bigint) => Promise<void>;
  isLoading?: boolean;
}

interface EditPanelState {
  open: boolean;
  task: Task | null;
}

interface DeleteConfirmState {
  open: boolean;
  taskId: bigint | null;
  taskDesc: string;
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2.5rem] ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(25px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function TaskSkeleton() {
  return (
    <div
      className="p-6 rounded-3xl flex items-center gap-5"
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
          className="h-4 w-2/3"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <Skeleton
          className="h-3 w-1/4"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      </div>
      <Skeleton
        className="w-16 h-8 rounded-xl shrink-0"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
    </div>
  );
}

export function TasksPage({
  tasks,
  createTask,
  updateTask,
  deleteTask,
  isLoading = false,
}: TasksPageProps) {
  // Create form state
  const [desc, setDesc] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit panel state
  const [editPanel, setEditPanel] = useState<EditPanelState>({
    open: false,
    task: null,
  });
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    taskId: null,
    taskDesc: "",
  });
  const [deleting, setDeleting] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    if (!editPanel.open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setEditPanel({ open: false, task: null });
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [editPanel.open]);

  // Close panel on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditPanel({ open: false, task: null });
        setDeleteConfirm({ open: false, taskId: null, taskDesc: "" });
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const openEditPanel = (task: Task) => {
    setEditPanel({ open: true, task });
    setEditDesc(task.description);
    setEditDate(task.taskDate);
    setEditTime(task.taskTime);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTask({ description: desc, taskDate, taskTime });
      setDesc("");
      setTaskTime("");
      setTaskDate("");
      toast.success("Mission logged successfully.");
    } catch {
      toast.error("Failed to log mission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSave = async () => {
    if (!editPanel.task || !updateTask) return;
    setEditSaving(true);
    try {
      await updateTask(editPanel.task.id, {
        description: editDesc,
        taskDate: editDate,
        taskTime: editTime,
      });
      setEditPanel({ open: false, task: null });
      toast.success("Mission updated.");
    } catch {
      toast.error("Failed to update mission.");
    } finally {
      setEditSaving(false);
    }
  };

  const confirmDelete = (task: Task) => {
    setDeleteConfirm({
      open: true,
      taskId: task.id,
      taskDesc: task.description,
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.taskId) return;
    setDeleting(true);
    try {
      await deleteTask(deleteConfirm.taskId);
      setDeleteConfirm({ open: false, taskId: null, taskDesc: "" });
      toast.success("Mission removed.");
    } catch {
      toast.error("Failed to remove mission.");
    } finally {
      setDeleting(false);
    }
  };

  const reversedTasks = [...tasks].sort((a, b) => {
    const dateA = `${a.taskDate}T${a.taskTime}`;
    const dateB = `${b.taskDate}T${b.taskTime}`;
    return dateB.localeCompare(dateA);
  });

  return (
    <div className="space-y-8 pb-20" data-ocid="tasks.section">
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground font-display flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Daily Mission Log
          </h2>
          <p className="text-muted-foreground text-sm mt-1 ml-11">
            Innovators complete each mission, each day.
          </p>
        </div>
        {tasks.length > 0 && (
          <div
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#818cf8",
            }}
            data-ocid="tasks.counter"
          >
            <CheckCircle2 className="w-4 h-4" />
            {tasks.length} Mission{tasks.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Create task form */}
      <GlassCard className="p-8">
        <h3 className="label-xs mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Log New Mission
        </h3>
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="space-y-4"
          data-ocid="tasks.form"
        >
          <textarea
            required
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="custom-input resize-none"
            placeholder="Describe the daily objective or mission..."
            data-ocid="tasks.input"
          />
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label
                htmlFor="task-date"
                className="label-xs mb-1.5 flex items-center gap-1"
              >
                <Calendar className="w-3 h-3" /> Date
              </label>
              <input
                id="task-date"
                type="date"
                required
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="custom-input"
                data-ocid="tasks.date.input"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label
                htmlFor="task-time"
                className="label-xs mb-1.5 flex items-center gap-1"
              >
                <Clock className="w-3 h-3" /> Time
              </label>
              <input
                id="task-time"
                type="time"
                required
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                className="custom-input"
                data-ocid="tasks.time.input"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              data-ocid="tasks.submit_button"
              className="px-8 py-2.5 rounded-xl font-bold transition-all text-white disabled:opacity-60 flex items-center gap-2 shrink-0"
              style={{
                background: submitting
                  ? "rgba(99,102,241,0.5)"
                  : "rgba(99,102,241,0.85)",
                boxShadow: "0 4px 24px rgba(99,102,241,0.25)",
              }}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Log Mission
                </>
              )}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Tasks list / skeleton / empty state */}
      {isLoading ? (
        <div className="space-y-4" data-ocid="tasks.loading_state">
          {[1, 2, 3, 4].map((n) => (
            <TaskSkeleton key={n} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <GlassCard className="p-20 text-center" data-ocid="tasks.empty_state">
          <div className="text-6xl mb-5">🎯</div>
          <h4 className="text-2xl font-bold text-foreground mb-2 font-display">
            No Missions Logged Yet
          </h4>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Log your first daily mission above to start tracking your progress
            and building momentum.
          </p>
          <div
            className="inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-xl text-sm font-bold"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#818cf8",
            }}
          >
            <Plus className="w-4 h-4" />
            Use the form above to get started
          </div>
        </GlassCard>
      ) : (
        <div className="relative" data-ocid="tasks.list">
          {/* Timeline vertical line */}
          <div
            className="absolute left-[27px] top-6 bottom-6 w-px"
            style={{ background: "rgba(99,102,241,0.15)" }}
          />
          <div className="space-y-4">
            {reversedTasks.map((task, renderIdx) => {
              const seqNum = tasks.length - renderIdx;
              const isLatest = renderIdx === 0;
              return (
                <div
                  key={String(task.id)}
                  className="relative flex items-start gap-5 animate-fade-in"
                  data-ocid={`tasks.item.${renderIdx + 1}`}
                >
                  {/* Timeline dot */}
                  <div
                    className="relative z-10 shrink-0 w-[54px] h-[54px] rounded-2xl flex items-center justify-center font-bold text-sm mt-0.5"
                    style={{
                      background: isLatest
                        ? "rgba(99,102,241,0.3)"
                        : "rgba(99,102,241,0.1)",
                      border: isLatest
                        ? "1px solid rgba(99,102,241,0.5)"
                        : "1px solid rgba(99,102,241,0.18)",
                      color: isLatest ? "#c7d2fe" : "#818cf8",
                      boxShadow: isLatest
                        ? "0 0 16px rgba(99,102,241,0.25)"
                        : "none",
                    }}
                  >
                    #{seqNum}
                  </div>

                  {/* Card */}
                  <div
                    className="flex-1 p-5 rounded-3xl group transition-all duration-300 glass-hover cursor-default"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      backdropFilter: "blur(25px) saturate(180%)",
                      border: isLatest
                        ? "1px solid rgba(99,102,241,0.2)"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {isLatest && (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mb-2"
                            style={{
                              background: "rgba(99,102,241,0.15)",
                              color: "#818cf8",
                              border: "1px solid rgba(99,102,241,0.2)",
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full pulse-accent"
                              style={{ background: "#818cf8" }}
                            />
                            Latest
                          </span>
                        )}
                        <p className="font-semibold text-foreground leading-snug break-words">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span
                            className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                            style={{ color: "rgba(165,180,252,0.6)" }}
                          >
                            <Calendar className="w-3 h-3" />
                            {task.taskDate}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.15)" }}
                          >
                            ·
                          </span>
                          <span
                            className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                            style={{ color: "rgba(165,180,252,0.6)" }}
                          >
                            <Clock className="w-3 h-3" />
                            {task.taskTime}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {updateTask && (
                          <button
                            type="button"
                            onClick={() => openEditPanel(task)}
                            className="p-2 rounded-xl transition-all duration-200"
                            style={{ color: "rgba(255,255,255,0.25)" }}
                            aria-label="Edit task"
                            data-ocid={`tasks.edit_button.${renderIdx + 1}`}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLButtonElement
                              ).style.color = "#818cf8";
                              (
                                e.currentTarget as HTMLButtonElement
                              ).style.background = "rgba(99,102,241,0.15)";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLButtonElement
                              ).style.color = "rgba(255,255,255,0.25)";
                              (
                                e.currentTarget as HTMLButtonElement
                              ).style.background = "transparent";
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => confirmDelete(task)}
                          className="p-2 rounded-xl transition-all duration-200"
                          style={{ color: "rgba(255,255,255,0.25)" }}
                          aria-label="Delete task"
                          data-ocid={`tasks.delete_button.${renderIdx + 1}`}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "rgba(248,113,113,0.9)";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "rgba(248,113,113,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "rgba(255,255,255,0.25)";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "transparent";
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Slide-Out Panel Overlay */}
      {editPanel.open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          data-ocid="tasks.dialog"
        />
      )}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full z-50 flex flex-col"
        style={{
          width: "420px",
          background: "rgba(15,15,30,0.92)",
          backdropFilter: "blur(40px) saturate(200%)",
          borderLeft: "1px solid rgba(99,102,241,0.2)",
          boxShadow: "-4px 0 40px rgba(0,0,0,0.5)",
          transform: editPanel.open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
        data-ocid="tasks.sheet"
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <h3 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit Mission
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update mission details below
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditPanel({ open: false, task: null })}
            className="p-2 rounded-xl transition-all"
            style={{ color: "rgba(255,255,255,0.3)" }}
            aria-label="Close panel"
            data-ocid="tasks.close_button"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "white";
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.3)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          <div>
            <label htmlFor="edit-desc" className="label-xs mb-2">
              Description
            </label>
            <textarea
              id="edit-desc"
              rows={4}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="custom-input resize-none"
              placeholder="Describe the mission objective..."
              data-ocid="tasks.edit.input"
            />
          </div>
          <div>
            <label
              htmlFor="edit-date"
              className="label-xs mb-2 flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> Date
            </label>
            <input
              id="edit-date"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="custom-input"
              data-ocid="tasks.edit.date.input"
            />
          </div>
          <div>
            <label
              htmlFor="edit-time"
              className="label-xs mb-2 flex items-center gap-1"
            >
              <Clock className="w-3 h-3" /> Time
            </label>
            <input
              id="edit-time"
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="custom-input"
              data-ocid="tasks.edit.time.input"
            />
          </div>
        </div>

        {/* Panel footer */}
        <div
          className="p-6 flex gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            type="button"
            onClick={() => setEditPanel({ open: false, task: null })}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
            }}
            data-ocid="tasks.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleEditSave()}
            disabled={editSaving || !editDesc.trim()}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all text-white disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              background: "rgba(99,102,241,0.85)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
            }}
            data-ocid="tasks.save_button"
          >
            {editSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-md rounded-[2rem] p-8 animate-fade-in"
            style={{
              background: "rgba(15,15,30,0.95)",
              backdropFilter: "blur(40px) saturate(200%)",
              border: "1px solid rgba(248,113,113,0.2)",
              boxShadow: "0 8px 60px rgba(0,0,0,0.6)",
            }}
            data-ocid="tasks.dialog"
          >
            <div className="flex items-start gap-4 mb-6">
              <div
                className="p-3 rounded-2xl shrink-0"
                style={{
                  background: "rgba(248,113,113,0.12)",
                  border: "1px solid rgba(248,113,113,0.2)",
                }}
              >
                <AlertCircle
                  className="w-6 h-6"
                  style={{ color: "rgba(248,113,113,0.9)" }}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground font-display">
                  Remove Mission?
                </h3>
                <p className="text-sm text-muted-foreground mt-1 break-words">
                  "{deleteConfirm.taskDesc}" will be permanently deleted from
                  the mission log.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirm({ open: false, taskId: null, taskDesc: "" })
                }
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                }}
                data-ocid="tasks.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all text-white disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  background: "rgba(239,68,68,0.8)",
                  boxShadow: "0 4px 20px rgba(239,68,68,0.25)",
                }}
                data-ocid="tasks.confirm_button"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Remove Mission
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
