import { Skeleton } from "@/components/ui/skeleton";
import {
  Github,
  Globe,
  Lightbulb,
  Linkedin,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Twitter,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Idea, IdeaStatus, IdeaType } from "../types";

const IDEA_TYPES: IdeaType[] = ["Software", "Hardware", "Hybrid"];
const IDEA_STATUSES: IdeaStatus[] = ["Drafting", "Researching", "Reviewing"];

const STATUS_COLORS: Record<string, string> = {
  Drafting: "text-indigo-300 border border-indigo-500/30 bg-indigo-500/15",
  Researching: "text-blue-300 border border-blue-500/30 bg-blue-500/15",
  Reviewing: "text-purple-300 border border-purple-500/30 bg-purple-500/15",
};

function getStatusColor(status: string): string {
  return (
    STATUS_COLORS[status] ??
    "text-foreground/50 border border-foreground/10 bg-foreground/5"
  );
}

function deadlineCountdown(deadline: string): string {
  if (!deadline) return "";
  const diff = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due today";
  if (diff === 1) return "1 day left";
  return `${diff} days left`;
}

function isObjectId(value: string): boolean {
  return !value.startsWith("http") && !value.startsWith("data:");
}

// ─── IdeaPhoto ────────────────────────────────────────────────────────────────

interface IdeaPhotoProps {
  photoUrl: string;
  name: string;
  downloadFile: (objectId: string) => Promise<string | null>;
  className?: string;
}

function IdeaPhoto({
  photoUrl,
  name,
  downloadFile,
  className = "w-full h-40 object-cover opacity-60 group-hover:opacity-100 transition-smooth",
}: IdeaPhotoProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoked = false;
    let created: string | null = null;
    if (!isObjectId(photoUrl)) {
      setBlobUrl(photoUrl);
      return;
    }
    downloadFile(photoUrl).then((url) => {
      if (!revoked) {
        created = url;
        setBlobUrl(url);
      }
    });
    return () => {
      revoked = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [photoUrl, downloadFile]);

  if (!blobUrl) {
    return (
      <div
        className="w-full h-40 flex items-center justify-center"
        style={{ background: "rgba(99,102,241,0.05)" }}
      >
        <Loader2 className="w-6 h-6 text-primary/40 animate-spin" />
      </div>
    );
  }
  return <img src={blobUrl} alt={name} className={className} />;
}

// ─── DeleteConfirmDialog ──────────────────────────────────────────────────────

interface DeleteConfirmProps {
  ideaName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({
  ideaName,
  onConfirm,
  onCancel,
}: DeleteConfirmProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center m-0 p-0 max-w-none w-full h-full border-0"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      data-ocid="ideas.dialog"
      aria-label="Delete confirmation"
    >
      <div
        className="glass rounded-3xl p-8 max-w-sm w-full mx-4 animate-fade-in"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.15)" }}
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-display font-bold text-foreground">
            Delete Idea?
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Are you sure you want to remove{" "}
          <span className="text-foreground font-semibold">"{ideaName}"</span>{" "}
          from the Ideas Lab? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-2xl text-sm font-semibold transition-smooth"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            data-ocid="ideas.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-2xl text-sm font-semibold transition-smooth"
            style={{
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
            }}
            data-ocid="ideas.confirm_button"
          >
            Delete
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ─── EditSlidePanel ───────────────────────────────────────────────────────────

interface EditPanelProps {
  idea: Idea;
  open: boolean;
  onClose: () => void;
  onSave: (id: bigint, updates: Omit<Idea, "id">) => Promise<void>;
  uploadIdeaPhoto: (file: File) => Promise<string>;
  downloadFile: (objectId: string) => Promise<string | null>;
}

function EditSlidePanel({
  idea,
  open,
  onClose,
  onSave,
  uploadIdeaPhoto,
  downloadFile,
}: EditPanelProps) {
  const [name, setName] = useState(idea.name);
  const [place, setPlace] = useState(idea.place);
  const [problem, setProblem] = useState(idea.problem);
  const [description, setDescription] = useState(idea.description);
  const [deadline, setDeadline] = useState(idea.deadline);
  const [ideaType, setIdeaType] = useState<IdeaType>(idea.ideaType as IdeaType);
  const [status, setStatus] = useState<IdeaStatus>(idea.status as IdeaStatus);
  const [youtubeUrl, setYoutubeUrl] = useState(idea.youtubeUrl);
  const [instaUrl, setInstaUrl] = useState(idea.instaUrl);
  const [googleUrl, setGoogleUrl] = useState(idea.googleUrl);
  const [photoObjectId, setPhotoObjectId] = useState<string | undefined>(
    idea.photoUrl,
  );
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | undefined>(
    undefined,
  );
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(idea.name);
    setPlace(idea.place);
    setProblem(idea.problem);
    setDescription(idea.description);
    setDeadline(idea.deadline);
    setIdeaType(idea.ideaType as IdeaType);
    setStatus(idea.status as IdeaStatus);
    setYoutubeUrl(idea.youtubeUrl);
    setInstaUrl(idea.instaUrl);
    setGoogleUrl(idea.googleUrl);
    setPhotoObjectId(idea.photoUrl);
    setPhotoPreviewUrl(undefined);
  }, [idea]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast.error("Only JPG, PNG, or GIF images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be smaller than 5MB.");
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setPhotoPreviewUrl(localUrl);
    setPhotoUploading(true);
    try {
      const objectId = await uploadIdeaPhoto(file);
      setPhotoObjectId(objectId);
      toast.success("Photo updated.");
    } catch {
      toast.error("Photo upload failed.");
      setPhotoPreviewUrl(undefined);
    } finally {
      URL.revokeObjectURL(localUrl);
      setPhotoUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photoUploading) {
      toast.error("Please wait for the photo to finish uploading.");
      return;
    }
    setSaving(true);
    try {
      await onSave(idea.id, {
        name,
        place,
        problem,
        description,
        deadline,
        ideaType,
        status,
        youtubeUrl,
        instaUrl,
        googleUrl,
        photoUrl: photoObjectId,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)" }}
          role="presentation"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClose();
          }}
        />
      )}
      <dialog
        className={`slide-panel ${open ? "open" : "closed"}`}
        style={{ width: "384px" }}
        data-ocid="ideas.sheet"
        aria-label="Edit Idea Panel"
        open={open}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">
                Edit Idea
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[260px]">
                {idea.name}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-2xl flex items-center justify-center transition-smooth hover:bg-white/10"
              aria-label="Close panel"
              data-ocid="ideas.close_button"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form
              id="edit-idea-form"
              onSubmit={(e) => void handleSave(e)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="edit-photo" className="label-xs">
                  Project Photo
                  <span className="ml-2 text-foreground/30 normal-case font-normal">
                    JPG/PNG/GIF · max 5MB
                  </span>
                </label>
                {(photoPreviewUrl ?? photoObjectId) && (
                  <div className="w-full h-28 rounded-2xl overflow-hidden mb-2">
                    {photoPreviewUrl ? (
                      <img
                        src={photoPreviewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : photoObjectId ? (
                      <IdeaPhoto
                        photoUrl={photoObjectId}
                        name={name}
                        downloadFile={downloadFile}
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : null}
                  </div>
                )}
                <div className="relative">
                  <input
                    id="edit-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    ref={photoRef}
                    onChange={(e) => void handlePhotoChange(e)}
                    disabled={photoUploading}
                    className="custom-input text-xs file:bg-primary/10 file:text-primary file:border-0 file:rounded file:px-2 disabled:opacity-50"
                    data-ocid="ideas.edit.photo.upload_button"
                  />
                  {photoUploading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  )}
                </div>
                {photoUploading && (
                  <div
                    className="w-full h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(99,102,241,0.15)" }}
                  >
                    <div
                      className="h-full bg-primary/60 animate-pulse rounded-full"
                      style={{ width: "60%" }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-name" className="label-xs">
                  Project Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="custom-input"
                  placeholder="e.g. Neural Nexus"
                  data-ocid="ideas.edit.name.input"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-deadline" className="label-xs">
                  Deadline
                </label>
                <input
                  id="edit-deadline"
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="custom-input"
                  data-ocid="ideas.edit.deadline.input"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-place" className="label-xs">
                  Place / Department
                </label>
                <input
                  id="edit-place"
                  type="text"
                  required
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="custom-input"
                  placeholder="e.g. Lab B, R&D HQ"
                  data-ocid="ideas.edit.place.input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="edit-type" className="label-xs">
                    Type
                  </label>
                  <select
                    id="edit-type"
                    value={ideaType}
                    onChange={(e) => setIdeaType(e.target.value as IdeaType)}
                    className="custom-input"
                    data-ocid="ideas.edit.type.select"
                  >
                    {IDEA_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-status" className="label-xs">
                    Status
                  </label>
                  <select
                    id="edit-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as IdeaStatus)}
                    className="custom-input"
                    data-ocid="ideas.edit.status.select"
                  >
                    {IDEA_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-problem" className="label-xs">
                  Problem / Vision
                </label>
                <textarea
                  id="edit-problem"
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="custom-input resize-none"
                  placeholder="Define the core challenge..."
                  data-ocid="ideas.edit.problem.textarea"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-description" className="label-xs">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="custom-input resize-none"
                  placeholder="Elaborate on the project details..."
                  data-ocid="ideas.edit.description.textarea"
                />
              </div>

              <div className="space-y-2">
                <p className="label-xs">Resource Links</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Linkedin
                      className="w-4 h-4 text-blue-400/60 shrink-0"
                      aria-hidden="true"
                    />
                    <input
                      id="edit-linkedin"
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="custom-input text-xs"
                      placeholder="LinkedIn URL"
                      aria-label="LinkedIn URL"
                      data-ocid="ideas.edit.linkedin.input"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter
                      className="w-4 h-4 text-sky-400/60 shrink-0"
                      aria-hidden="true"
                    />
                    <input
                      id="edit-twitter"
                      type="url"
                      value={instaUrl}
                      onChange={(e) => setInstaUrl(e.target.value)}
                      className="custom-input text-xs"
                      placeholder="Twitter / X URL"
                      aria-label="Twitter URL"
                      data-ocid="ideas.edit.twitter.input"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github
                      className="w-4 h-4 text-foreground/40 shrink-0"
                      aria-hidden="true"
                    />
                    <input
                      id="edit-github"
                      type="url"
                      value={googleUrl}
                      onChange={(e) => setGoogleUrl(e.target.value)}
                      className="custom-input text-xs"
                      placeholder="GitHub URL"
                      aria-label="GitHub URL"
                      data-ocid="ideas.edit.github.input"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div
            className="p-6 border-t flex gap-3"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-smooth"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              data-ocid="ideas.edit.cancel_button"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-idea-form"
              disabled={saving || photoUploading}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-smooth bg-primary text-primary-foreground disabled:opacity-60 hover:bg-primary/80"
              data-ocid="ideas.edit.save_button"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

// ─── CreateIdeaForm ───────────────────────────────────────────────────────────

interface CreateFormProps {
  onAdd: (idea: Omit<Idea, "id">) => Promise<void>;
  uploadIdeaPhoto: (file: File) => Promise<string>;
}

function CreateIdeaForm({ onAdd, uploadIdeaPhoto }: CreateFormProps) {
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [problem, setProblem] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [ideaType, setIdeaType] = useState<IdeaType>("Software");
  const [status, setStatus] = useState<IdeaStatus>("Drafting");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [instaUrl, setInstaUrl] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [photoObjectId, setPhotoObjectId] = useState<string | undefined>(
    undefined,
  );
  const [photoFileName, setPhotoFileName] = useState<string | undefined>(
    undefined,
  );
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoObjectId(undefined);
      setPhotoFileName(undefined);
      return;
    }
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast.error("Only JPG, PNG, or GIF images are allowed.");
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be smaller than 5MB.");
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }
    setPhotoFileName(file.name);
    setPhotoUploading(true);
    setPhotoUploadProgress(30);
    try {
      setPhotoUploadProgress(60);
      const objectId = await uploadIdeaPhoto(file);
      setPhotoObjectId(objectId);
      setPhotoUploadProgress(100);
    } catch {
      toast.error("Photo upload failed. Please try again.");
      setPhotoFileName(undefined);
      setPhotoObjectId(undefined);
      setPhotoUploadProgress(0);
      if (photoInputRef.current) photoInputRef.current.value = "";
    } finally {
      setPhotoUploading(false);
    }
  };

  const reset = () => {
    setName("");
    setPlace("");
    setProblem("");
    setDescription("");
    setDeadline("");
    setIdeaType("Software");
    setStatus("Drafting");
    setYoutubeUrl("");
    setInstaUrl("");
    setGoogleUrl("");
    setPhotoObjectId(undefined);
    setPhotoFileName(undefined);
    setPhotoUploadProgress(0);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photoUploading) {
      toast.error("Please wait for the photo to finish uploading.");
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        name,
        place,
        problem,
        description,
        deadline,
        ideaType,
        status,
        youtubeUrl,
        instaUrl,
        googleUrl,
        photoUrl: photoObjectId,
      });
      reset();
      toast.success("New idea manifested in the system.");
    } catch {
      toast.error("Failed to save idea. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass p-8 rounded-[2.5rem]">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(99,102,241,0.2)" }}
        >
          <Plus className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground">
          Manifest New Idea
        </h3>
      </div>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        data-ocid="ideas.form"
      >
        <div className="space-y-2">
          <label htmlFor="idea-name" className="label-xs">
            Project Name
          </label>
          <input
            id="idea-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="custom-input"
            placeholder="e.g. Neural Nexus"
            data-ocid="ideas.name.input"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="idea-deadline" className="label-xs">
            Deadline
          </label>
          <input
            id="idea-deadline"
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="custom-input"
            data-ocid="ideas.deadline.input"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="idea-photo" className="label-xs">
            Project Photo
            <span className="ml-2 text-foreground/30 normal-case font-normal">
              JPG/PNG/GIF · max 5MB
            </span>
          </label>
          <div className="relative">
            <input
              id="idea-photo"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              ref={photoInputRef}
              onChange={(e) => void handlePhotoChange(e)}
              disabled={photoUploading}
              className="custom-input text-xs file:bg-primary/10 file:text-primary file:border-0 file:rounded file:px-2 disabled:opacity-50"
              data-ocid="ideas.photo.upload_button"
            />
            {photoUploading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
            )}
          </div>
          {photoUploading && (
            <>
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(99,102,241,0.15)" }}
              >
                <div
                  className="h-full bg-primary/60 rounded-full transition-all duration-500"
                  style={{ width: `${photoUploadProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest animate-pulse">
                Uploading to secure storage…
              </p>
            </>
          )}
          {photoFileName && !photoUploading && photoObjectId && (
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="text-green-400">✓</span> {photoFileName} —
              Uploaded
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="idea-place" className="label-xs">
            Project Place / Department
          </label>
          <input
            id="idea-place"
            type="text"
            required
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="custom-input"
            placeholder="e.g. Lab B, R&D HQ"
            data-ocid="ideas.place.input"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="idea-problem" className="label-xs">
            Problem Statement &amp; Vision
          </label>
          <textarea
            id="idea-problem"
            rows={2}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="custom-input resize-none"
            placeholder="Define the core challenge..."
            data-ocid="ideas.problem.textarea"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="idea-description" className="label-xs">
            Detailed Description
          </label>
          <textarea
            id="idea-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="custom-input resize-none"
            placeholder="Elaborate on the project details..."
            data-ocid="ideas.description.textarea"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="idea-type" className="label-xs">
              Type
            </label>
            <select
              id="idea-type"
              value={ideaType}
              onChange={(e) => setIdeaType(e.target.value as IdeaType)}
              className="custom-input"
              data-ocid="ideas.type.select"
            >
              {IDEA_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="idea-status" className="label-xs">
              Initial Status
            </label>
            <select
              id="idea-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as IdeaStatus)}
              className="custom-input"
              data-ocid="ideas.status.select"
            >
              {IDEA_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <p className="label-xs">Resource Links</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Linkedin
                className="w-4 h-4 text-blue-400/60 shrink-0"
                aria-hidden="true"
              />
              <input
                id="idea-linkedin"
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="custom-input text-xs"
                placeholder="LinkedIn URL"
                aria-label="LinkedIn URL"
                data-ocid="ideas.linkedin.input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Twitter
                className="w-4 h-4 text-sky-400/60 shrink-0"
                aria-hidden="true"
              />
              <input
                id="idea-twitter"
                type="url"
                value={instaUrl}
                onChange={(e) => setInstaUrl(e.target.value)}
                className="custom-input text-xs"
                placeholder="Twitter / X URL"
                aria-label="Twitter URL"
                data-ocid="ideas.twitter.input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Github
                className="w-4 h-4 text-foreground/40 shrink-0"
                aria-hidden="true"
              />
              <input
                id="idea-github"
                type="url"
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
                className="custom-input text-xs"
                placeholder="GitHub URL"
                aria-label="GitHub URL"
                data-ocid="ideas.github.input"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            disabled={submitting || photoUploading}
            data-ocid="ideas.submit_button"
            className="bg-primary px-10 py-3.5 rounded-2xl font-bold hover:bg-primary/80 transition-smooth shadow-elevated text-primary-foreground disabled:opacity-60 inline-flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Manifest Concept
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── IdeaCard ─────────────────────────────────────────────────────────────────

interface IdeaCardProps {
  idea: Idea;
  index: number;
  onEdit: (idea: Idea) => void;
  onDelete: (idea: Idea) => void;
  downloadFile: (objectId: string) => Promise<string | null>;
}

function IdeaCard({
  idea,
  index,
  onEdit,
  onDelete,
  downloadFile,
}: IdeaCardProps) {
  const countdown = deadlineCountdown(idea.deadline);
  const isOverdue = countdown === "Overdue";

  return (
    <div
      className="glass rounded-[2.5rem] relative group animate-fade-in hover:-translate-y-1 transition-smooth overflow-hidden flex flex-col"
      data-ocid={`ideas.item.${index + 1}`}
    >
      {idea.photoUrl ? (
        <IdeaPhoto
          photoUrl={idea.photoUrl}
          name={idea.name}
          downloadFile={downloadFile}
        />
      ) : (
        <div
          className="w-full h-40 flex items-center justify-center"
          style={{ background: "rgba(99,102,241,0.05)" }}
        >
          <Lightbulb className="w-10 h-10 text-primary/20" />
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-lg font-display font-bold text-foreground leading-tight min-w-0 truncate">
            {idea.name}
          </h3>
          <span
            className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${getStatusColor(idea.status)}`}
          >
            {idea.status}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "rgba(165,180,252,0.5)" }}
          >
            {idea.ideaType}
          </span>
          <span
            className={`text-xs font-bold ${isOverdue ? "text-red-400" : "text-primary/70"}`}
          >
            • {countdown || idea.deadline}
          </span>
        </div>

        {idea.place && (
          <div
            className="flex items-center gap-1.5 mb-3 text-xs font-semibold"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{idea.place}</span>
          </div>
        )}

        {idea.problem && (
          <div className="mb-4 flex-1">
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: "rgba(165,180,252,0.4)" }}
            >
              Vision
            </p>
            <p
              className="text-sm leading-relaxed line-clamp-2"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {idea.problem}
            </p>
          </div>
        )}

        <div className="flex gap-3 mb-4">
          {idea.youtubeUrl && (
            <a
              href={idea.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin
                className="w-4 h-4 transition-colors hover:text-blue-400"
                style={{ color: "rgba(255,255,255,0.25)" }}
              />
            </a>
          )}
          {idea.instaUrl && (
            <a
              href={idea.instaUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <Twitter
                className="w-4 h-4 transition-colors hover:text-sky-400"
                style={{ color: "rgba(255,255,255,0.25)" }}
              />
            </a>
          )}
          {idea.googleUrl && (
            <a
              href={idea.googleUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Github
                className="w-4 h-4 transition-colors hover:text-foreground"
                style={{ color: "rgba(255,255,255,0.25)" }}
              />
            </a>
          )}
          {!idea.youtubeUrl && !idea.instaUrl && !idea.googleUrl && (
            <Globe
              className="w-4 h-4"
              style={{ color: "rgba(255,255,255,0.1)" }}
            />
          )}
        </div>

        <div
          className="mt-auto flex items-center justify-between border-t pt-4"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <button
            type="button"
            onClick={() => onEdit(idea)}
            className="flex items-center gap-1.5 text-xs font-semibold transition-smooth px-3 py-1.5 rounded-xl hover:bg-primary/10 hover:text-primary"
            style={{ color: "rgba(255,255,255,0.3)" }}
            aria-label="Edit idea"
            data-ocid={`ideas.edit_button.${index + 1}`}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(idea)}
            className="flex items-center gap-1.5 text-xs font-semibold transition-smooth px-3 py-1.5 rounded-xl hover:bg-red-500/10 hover:text-red-400"
            style={{ color: "rgba(255,255,255,0.2)" }}
            aria-label="Delete idea"
            data-ocid={`ideas.delete_button.${index + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── IdeasPage ────────────────────────────────────────────────────────────────

interface IdeasPageProps {
  ideas: Idea[];
  onAdd: (idea: Omit<Idea, "id">) => Promise<void>;
  onUpdate?: (id: bigint, updates: Omit<Idea, "id">) => Promise<void>;
  onRemove: (id: bigint) => Promise<void>;
  isLoading?: boolean;
  uploadIdeaPhoto: (file: File) => Promise<string>;
  downloadFile: (objectId: string) => Promise<string | null>;
}

export function IdeasPage({
  ideas,
  onAdd,
  onUpdate,
  onRemove,
  isLoading = false,
  uploadIdeaPhoto,
  downloadFile,
}: IdeasPageProps) {
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [deletingIdea, setDeletingIdea] = useState<Idea | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deletingIdea) return;
    setDeleteLoading(true);
    try {
      await onRemove(deletingIdea.id);
      toast.success(`"${deletingIdea.name}" removed from Ideas Lab.`);
    } catch {
      toast.error("Failed to delete idea. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeletingIdea(null);
    }
  };

  return (
    <div className="space-y-8" data-ocid="ideas.section">
      <CreateIdeaForm onAdd={onAdd} uploadIdeaPhoto={uploadIdeaPhoto} />

      {isLoading ? (
        <div className="card-grid" data-ocid="ideas.loading_state">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass rounded-[2.5rem] overflow-hidden">
              <Skeleton
                className="w-full h-40"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div className="p-6 space-y-3">
                <Skeleton
                  className="h-5 w-3/4"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <Skeleton
                  className="h-3 w-1/2"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
                <Skeleton
                  className="h-3 w-2/3"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div
          className="glass rounded-3xl p-16 text-center"
          data-ocid="ideas.empty_state"
        >
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(99,102,241,0.15)" }}
          >
            <Lightbulb className="w-8 h-8 text-primary/60" />
          </div>
          <h4 className="text-xl font-display font-bold text-foreground mb-2">
            No Ideas Yet
          </h4>
          <p
            className="text-sm mb-6"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Manifest your first concept above to get started.
          </p>
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: "rgba(165,180,252,0.5)" }}
          >
            <Plus className="w-3.5 h-3.5" /> Use the form above to add your
            first idea
          </div>
        </div>
      ) : (
        <div className="card-grid pb-20" data-ocid="ideas.list">
          {ideas.map((idea, i) => (
            <IdeaCard
              key={String(idea.id)}
              idea={idea}
              index={i}
              onEdit={setEditingIdea}
              onDelete={setDeletingIdea}
              downloadFile={downloadFile}
            />
          ))}
        </div>
      )}

      {editingIdea && onUpdate && (
        <EditSlidePanel
          idea={editingIdea}
          open={!!editingIdea}
          onClose={() => setEditingIdea(null)}
          onSave={onUpdate}
          uploadIdeaPhoto={uploadIdeaPhoto}
          downloadFile={downloadFile}
        />
      )}

      {deletingIdea && (
        <DeleteConfirmDialog
          ideaName={deletingIdea.name}
          onConfirm={() => {
            if (!deleteLoading) void handleDelete();
          }}
          onCancel={() => setDeletingIdea(null)}
        />
      )}
    </div>
  );
}
