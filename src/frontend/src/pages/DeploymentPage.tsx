import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  ExternalLink,
  Pencil,
  Plus,
  Radio,
  Rocket,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { SiGithub } from "react-icons/si";
import { toast } from "sonner";
import type { Architecture, Deployment, EngineType } from "../types";

// ─── Constants ───────────────────────────────────────────────────────────────

const ENGINE_TYPES: EngineType[] = [
  "ICP",
  "AWS",
  "GCP",
  "Azure",
  "Vercel",
  "Netlify",
  "Other",
];
const ARCHITECTURES: Architecture[] = [
  "Motoko",
  "Rust",
  "TypeScript",
  "Python",
  "Go",
  "Other",
];

const ENGINE_COLORS: Record<EngineType, { bg: string; text: string }> = {
  ICP: { bg: "rgba(99,102,241,0.15)", text: "rgba(129,140,248,1)" },
  AWS: { bg: "rgba(251,191,36,0.15)", text: "rgba(251,191,36,1)" },
  GCP: { bg: "rgba(59,130,246,0.15)", text: "rgba(96,165,250,1)" },
  Azure: { bg: "rgba(14,165,233,0.15)", text: "rgba(56,189,248,1)" },
  Vercel: { bg: "rgba(255,255,255,0.10)", text: "rgba(226,232,240,1)" },
  Netlify: { bg: "rgba(20,184,166,0.15)", text: "rgba(45,212,191,1)" },
  Other: { bg: "rgba(148,163,184,0.15)", text: "rgba(148,163,184,1)" },
};

const ARCH_COLORS: Record<Architecture, { bg: string; text: string }> = {
  Motoko: { bg: "rgba(236,72,153,0.15)", text: "rgba(244,114,182,1)" },
  Rust: { bg: "rgba(239,68,68,0.15)", text: "rgba(252,165,165,1)" },
  TypeScript: { bg: "rgba(59,130,246,0.15)", text: "rgba(96,165,250,1)" },
  Python: { bg: "rgba(234,179,8,0.15)", text: "rgba(253,224,71,1)" },
  Go: { bg: "rgba(20,184,166,0.15)", text: "rgba(45,212,191,1)" },
  Other: { bg: "rgba(148,163,184,0.15)", text: "rgba(148,163,184,1)" },
};

function EngineBadge({ type }: { type: string }) {
  const colors = ENGINE_COLORS[type as EngineType] ?? ENGINE_COLORS.Other;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: colors.bg, color: colors.text }}
    >
      {type}
    </span>
  );
}

function ArchBadge({ arch }: { arch: string }) {
  const colors = ARCH_COLORS[arch as Architecture] ?? ARCH_COLORS.Other;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: colors.bg, color: colors.text }}
    >
      {arch}
    </span>
  );
}

function formatDate(ts: bigint | undefined): string {
  if (!ts) return "";
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Empty Form State ─────────────────────────────────────────────────────────

const emptyForm = {
  name: "",
  deployedUrl: "",
  githubUrl: "",
  engineType: "ICP" as EngineType,
  architecture: "Motoko" as Architecture,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeploymentPageProps {
  deployments: Deployment[];
  onAdd: (deployment: Omit<Deployment, "id" | "createdAt">) => Promise<void>;
  onUpdate?: (
    id: bigint,
    updates: Omit<Deployment, "id" | "createdAt">,
  ) => Promise<void>;
  onRemove: (id: bigint) => Promise<void>;
  isLoading?: boolean;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DeploymentPage({
  deployments,
  onAdd,
  onUpdate,
  onRemove,
  isLoading = false,
}: DeploymentPageProps) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Edit panel state
  const [editTarget, setEditTarget] = useState<Deployment | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Deployment | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    setSubmitting(true);
    try {
      await onAdd({ ...form, name });
      setForm(emptyForm);
      toast.success(`🚀 Deployed: ${name}`);
    } catch {
      toast.error("Failed to register deployment.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (d: Deployment) => {
    setEditTarget(d);
    setEditForm({
      name: d.name,
      deployedUrl: d.deployedUrl,
      githubUrl: d.githubUrl,
      engineType: (d.engineType as EngineType) ?? "ICP",
      architecture: (d.architecture as Architecture) ?? "Motoko",
    });
  };
  const closeEdit = () => {
    setEditTarget(null);
    setEditForm(emptyForm);
  };
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !onUpdate) return;
    setEditSubmitting(true);
    try {
      await onUpdate(editTarget.id, editForm);
      toast.success(`✏️ Updated: ${editForm.name}`);
      closeEdit();
    } catch {
      toast.error("Failed to update deployment.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await onRemove(deleteTarget.id);
      toast.success(`Deployment terminated: ${deleteTarget.name}`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to remove deployment.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-8" data-ocid="deployment.section">
      {/* ── Create Form ── */}
      <div className="glass p-8 rounded-[2.5rem]">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.15)" }}
          >
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground">
            New Deployment Protocol
          </h3>
        </div>

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          data-ocid="deployment.form"
        >
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="dep-name" className="label-xs">
              Project Name
            </label>
            <input
              id="dep-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="custom-input"
              placeholder="e.g. Enterprise Portal v2.0"
              data-ocid="deployment.name.input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dep-url" className="label-xs">
              Deployed URL
            </label>
            <input
              id="dep-url"
              type="url"
              required
              value={form.deployedUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, deployedUrl: e.target.value }))
              }
              className="custom-input"
              placeholder="https://app.example.com"
              data-ocid="deployment.url.input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dep-github" className="label-xs">
              GitHub Repository
            </label>
            <input
              id="dep-github"
              type="url"
              value={form.githubUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, githubUrl: e.target.value }))
              }
              className="custom-input"
              placeholder="https://github.com/user/repo"
              data-ocid="deployment.github.input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dep-engine" className="label-xs">
              Engine / Platform
            </label>
            <select
              id="dep-engine"
              value={form.engineType}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  engineType: e.target.value as EngineType,
                }))
              }
              className="custom-input"
              data-ocid="deployment.engine.select"
            >
              {ENGINE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="dep-arch" className="label-xs">
              Architecture
            </label>
            <select
              id="dep-arch"
              value={form.architecture}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  architecture: e.target.value as Architecture,
                }))
              }
              className="custom-input"
              data-ocid="deployment.arch.select"
            >
              {ARCHITECTURES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 text-right pt-2">
            <button
              type="submit"
              disabled={submitting}
              data-ocid="deployment.submit_button"
              className="inline-flex items-center gap-2 bg-primary px-10 py-3.5 rounded-2xl font-bold hover:bg-primary/80 shadow-elevated text-primary-foreground transition-smooth disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              {submitting ? "Executing..." : "Execute Deployment"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Deployment Grid ── */}
      {isLoading ? (
        <div className="card-grid" data-ocid="deployment.loading_state">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass p-8 rounded-[2.5rem] space-y-4">
              <Skeleton
                className="h-5 w-2/3"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div className="flex gap-2">
                <Skeleton
                  className="h-5 w-16 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
                <Skeleton
                  className="h-5 w-16 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>
              <Skeleton
                className="h-10 w-full rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
              <Skeleton
                className="h-10 w-full rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            </div>
          ))}
        </div>
      ) : deployments.length === 0 ? (
        <div
          className="glass rounded-3xl p-16 text-center"
          data-ocid="deployment.empty_state"
        >
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl"
            style={{ background: "rgba(99,102,241,0.15)" }}
          >
            🚀
          </div>
          <h4 className="text-xl font-display font-bold text-foreground mb-2">
            No Deployments Yet
          </h4>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Register your first deployment above to track all your live projects
            in one place.
          </p>
        </div>
      ) : (
        <div className="card-grid pb-20" data-ocid="deployment.list">
          {deployments.map((d, i) => (
            <DeploymentCard
              key={String(d.id)}
              deployment={d}
              index={i}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* ── Edit Slide-out Panel ── */}
      {editTarget && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeEdit}
            onKeyDown={(e) => e.key === "Escape" && closeEdit()}
            role="button"
            tabIndex={0}
            aria-label="Close edit panel"
            data-ocid="deployment.edit_panel_overlay"
          />
          {/* Panel */}
          <div
            className="slide-panel open"
            style={{ width: "30rem" }}
            data-ocid="deployment.edit_panel"
          >
            <div className="flex flex-col h-full p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-display font-bold text-foreground">
                    Edit Deployment
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Update deployment details
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEdit}
                  aria-label="Close edit panel"
                  data-ocid="deployment.edit_panel.close_button"
                  className="w-9 h-9 rounded-xl glass-hover flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleEditSave}
                className="flex flex-col gap-5 flex-1 overflow-y-auto"
                data-ocid="deployment.edit_form"
              >
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="label-xs">
                    Project Name
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="custom-input"
                    data-ocid="deployment.edit_name.input"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-url" className="label-xs">
                    Deployed URL
                  </label>
                  <input
                    id="edit-url"
                    type="url"
                    required
                    value={editForm.deployedUrl}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        deployedUrl: e.target.value,
                      }))
                    }
                    className="custom-input"
                    data-ocid="deployment.edit_url.input"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-github" className="label-xs">
                    GitHub Repository
                  </label>
                  <input
                    id="edit-github"
                    type="url"
                    value={editForm.githubUrl}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        githubUrl: e.target.value,
                      }))
                    }
                    className="custom-input"
                    data-ocid="deployment.edit_github.input"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-engine" className="label-xs">
                    Engine / Platform
                  </label>
                  <select
                    id="edit-engine"
                    value={editForm.engineType}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        engineType: e.target.value as EngineType,
                      }))
                    }
                    className="custom-input"
                    data-ocid="deployment.edit_engine.select"
                  >
                    {ENGINE_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-arch" className="label-xs">
                    Architecture
                  </label>
                  <select
                    id="edit-arch"
                    value={editForm.architecture}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        architecture: e.target.value as Architecture,
                      }))
                    }
                    className="custom-input"
                    data-ocid="deployment.edit_arch.select"
                  >
                    {ARCHITECTURES.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 mt-auto pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={closeEdit}
                    data-ocid="deployment.edit_panel.cancel_button"
                    className="flex-1 py-3 rounded-2xl font-bold transition-smooth text-sm"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    data-ocid="deployment.edit_panel.save_button"
                    className="flex-1 py-3 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/80 transition-smooth text-sm disabled:opacity-60"
                  >
                    {editSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          data-ocid="deployment.delete_dialog"
        >
          <div
            className="glass rounded-3xl p-8 max-w-sm w-full animate-fade-in"
            style={{ border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <h4 className="text-xl font-display font-bold text-foreground text-center mb-2">
              Terminate Deployment?
            </h4>
            <p className="text-muted-foreground text-sm text-center mb-8">
              This will permanently remove{" "}
              <span className="text-foreground font-bold">
                {deleteTarget.name}
              </span>{" "}
              from the Deployment Hub.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteSubmitting}
                data-ocid="deployment.delete_dialog.cancel_button"
                className="flex-1 py-3 rounded-2xl font-bold transition-smooth text-sm"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                data-ocid="deployment.delete_dialog.confirm_button"
                className="flex-1 py-3 rounded-2xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-smooth text-sm disabled:opacity-60"
              >
                {deleteSubmitting ? "Terminating..." : "Terminate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Deployment Card ──────────────────────────────────────────────────────────

interface DeploymentCardProps {
  deployment: Deployment;
  index: number;
  onEdit: (d: Deployment) => void;
  onDelete: (d: Deployment) => void;
}

function DeploymentCard({
  deployment: d,
  index,
  onEdit,
  onDelete,
}: DeploymentCardProps) {
  const isLive = !!d.deployedUrl;

  return (
    <div
      className="glass p-8 rounded-[2.5rem] relative animate-fade-in group hover:-translate-y-1 transition-smooth flex flex-col gap-5"
      style={{ borderBottom: "2px solid rgba(99,102,241,0.2)" }}
      data-ocid={`deployment.item.${index + 1}`}
    >
      {/* Live indicator + actions */}
      <div className="absolute top-5 right-5 flex items-center gap-2">
        {isLive && (
          <span
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: "rgba(74,222,128,0.12)",
              color: "rgba(74,222,128,1)",
            }}
            aria-label="Live"
          >
            <Radio className="w-3 h-3 animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Header */}
      <div className="pr-16 min-w-0">
        <h4 className="text-xl font-display font-bold text-foreground truncate mb-3">
          {d.name}
        </h4>
        <div className="flex flex-wrap gap-2">
          <EngineBadge type={d.engineType} />
          <ArchBadge arch={d.architecture} />
        </div>
      </div>

      {/* Links */}
      <div className="space-y-2">
        <a
          href={d.deployedUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 glass-hover p-3 rounded-xl text-xs font-bold text-foreground/70 hover:text-foreground transition-smooth border border-transparent hover:border-white/10"
          data-ocid={`deployment.url.link.${index + 1}`}
        >
          <ExternalLink className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">{d.deployedUrl || "—"}</span>
        </a>
        {d.githubUrl && (
          <a
            href={d.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 glass-hover p-3 rounded-xl text-xs font-bold text-foreground/70 hover:text-foreground transition-smooth border border-transparent hover:border-white/10"
            data-ocid={`deployment.github.link.${index + 1}`}
          >
            <SiGithub className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">{d.githubUrl}</span>
          </a>
        )}
      </div>

      {/* Date */}
      {d.createdAt ? (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          Deployed {formatDate(d.createdAt)}
        </div>
      ) : null}

      {/* Divider */}
      <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(d)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-smooth"
          style={{
            background: "rgba(99,102,241,0.12)",
            color: "rgba(129,140,248,1)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
          aria-label={`Edit ${d.name}`}
          data-ocid={`deployment.edit_button.${index + 1}`}
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(d)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-smooth"
          style={{
            background: "rgba(239,68,68,0.08)",
            color: "rgba(252,165,165,1)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
          aria-label={`Delete ${d.name}`}
          data-ocid={`deployment.delete_button.${index + 1}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
