import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Globe,
  Instagram,
  Loader2,
  Package,
  Pencil,
  Presentation,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { IncubatorProject } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface IncubatorPageProps {
  projects: IncubatorProject[];
  onAdd: (project: Omit<IncubatorProject, "id">) => Promise<void>;
  onUpdate?: (
    id: bigint,
    updates: Omit<IncubatorProject, "id">,
  ) => Promise<void>;
  onRemove: (id: bigint) => Promise<void>;
  isLoading?: boolean;
  uploadIncubatorImage: (file: File) => Promise<string>;
  uploadIncubatorPpt: (file: File) => Promise<string>;
  uploadIncubatorDoc: (file: File) => Promise<string>;
  uploadIncubatorSrc: (file: File) => Promise<string>;
  downloadFile: (objectId: string) => Promise<string | null>;
}

interface FileUploadState {
  objectId?: string;
  displayName?: string;
  uploading: boolean;
  progress: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FILE_DEFS = [
  {
    key: "ppt" as const,
    label: "PPT",
    sublabel: "Slideshow",
    icon: Presentation,
    bg: "rgba(236,72,153,0.12)",
    color: "#f9a8d4",
    glow: "rgba(236,72,153,0.3)",
    maxMB: 20,
    accept: undefined,
  },
  {
    key: "doc" as const,
    label: "DOC",
    sublabel: "Tech Docs",
    icon: FileText,
    bg: "rgba(59,130,246,0.12)",
    color: "#93c5fd",
    glow: "rgba(59,130,246,0.3)",
    maxMB: 10,
    accept: undefined,
  },
  {
    key: "src" as const,
    label: "SRC",
    sublabel: "Source ZIP",
    icon: Package,
    bg: "rgba(245,158,11,0.12)",
    color: "#fcd34d",
    glow: "rgba(245,158,11,0.3)",
    maxMB: 10,
    accept: undefined,
  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function isObjectId(value: string): boolean {
  return !value.startsWith("http") && !value.startsWith("data:");
}

function formatDate(createdAt?: bigint): string {
  if (!createdAt) return "";
  const ms = Number(createdAt) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UploadProgressBar({
  progress,
  uploading,
}: { progress: number; uploading: boolean }) {
  if (!uploading) return null;
  return (
    <div
      className="w-full h-1 rounded-full overflow-hidden mt-1.5"
      style={{ background: "rgba(255,255,255,0.06)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, oklch(var(--primary)), oklch(var(--accent)))",
        }}
      />
    </div>
  );
}

function UploadSpinner({ uploading }: { uploading: boolean }) {
  if (!uploading) return null;
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <Loader2 className="w-4 h-4 text-primary animate-spin" />
    </div>
  );
}

function IncubatorImage({
  imageUrl,
  name,
  downloadFile,
}: {
  imageUrl: string;
  name: string;
  downloadFile: (objectId: string) => Promise<string | null>;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    if (!isObjectId(imageUrl)) {
      setBlobUrl(imageUrl);
      return;
    }
    downloadFile(imageUrl).then((url) => {
      revoke = url;
      setBlobUrl(url);
    });
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [imageUrl, downloadFile]);

  if (!blobUrl) {
    return (
      <div
        className="w-full h-52 flex items-center justify-center"
        style={{ background: "rgba(99,102,241,0.04)" }}
      >
        <Loader2 className="w-6 h-6 text-primary/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden w-full h-52">
      <img
        src={blobUrl}
        alt={name}
        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-smooth"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 40%, rgba(5,10,24,0.85))",
        }}
      />
    </div>
  );
}

// ── File Upload Row (reused in both add form and edit panel) ──────────────────

interface FileUploadRowProps {
  fileKey: "ppt" | "doc" | "src";
  state: FileUploadState;
  inputRef: React.RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  maxMBLabel: string;
  label: string;
  id: string;
  ocid: string;
}

function FileUploadRow({
  fileKey: _fileKey,
  state,
  inputRef,
  onChange,
  accept,
  maxMBLabel,
  label,
  id,
  ocid,
}: FileUploadRowProps) {
  const def = FILE_DEFS.find((d) => d.key === _fileKey)!;
  const Icon = def.icon;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="label-xs">
        {label}
        <span className="ml-2 text-foreground/30 normal-case font-normal">
          max {maxMBLabel}
        </span>
      </label>
      <div className="relative">
        <input
          id={id}
          type="file"
          accept={accept}
          ref={inputRef}
          onChange={onChange}
          disabled={state.uploading}
          className="custom-input text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-foreground cursor-pointer disabled:opacity-50"
          data-ocid={ocid}
        />
        <UploadSpinner uploading={state.uploading} />
      </div>
      <UploadProgressBar
        progress={state.progress}
        uploading={state.uploading}
      />
      {state.displayName && !state.uploading && (
        <div className="flex items-center gap-2">
          <Icon className="w-3 h-3" style={{ color: def.color }} />
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: def.color }}
          >
            ✓ {state.displayName}
          </p>
        </div>
      )}
    </div>
  );
}

// ── useFileUpload hook ────────────────────────────────────────────────────────

function useFileUpload(
  uploader: (file: File) => Promise<string>,
  maxMB: number,
) {
  const [state, setState] = useState<FileUploadState>({
    uploading: false,
    progress: 0,
  });
  const ref = useRef<HTMLInputElement>(null!);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setState({ uploading: false, progress: 0 });
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`File must be smaller than ${maxMB}MB.`);
      if (ref.current) ref.current.value = "";
      return;
    }
    setState({ uploading: true, progress: 10, displayName: file.name });
    // Simulate progress pulse
    const interval = setInterval(() => {
      setState((s) => ({ ...s, progress: Math.min(s.progress + 15, 85) }));
    }, 400);
    try {
      const objectId = await uploader(file);
      clearInterval(interval);
      setState({
        uploading: false,
        progress: 100,
        objectId,
        displayName: file.name,
      });
    } catch {
      clearInterval(interval);
      toast.error("Upload failed. Please try again.");
      setState({ uploading: false, progress: 0 });
      if (ref.current) ref.current.value = "";
    }
  };

  const reset = (keepDisplay?: { objectId?: string; displayName?: string }) => {
    setState({
      uploading: false,
      progress: 0,
      objectId: keepDisplay?.objectId,
      displayName: keepDisplay?.displayName,
    });
    if (!keepDisplay && ref.current) ref.current.value = "";
  };

  return { state, ref, handle, reset };
}

// ── Edit Slide-Out Panel ──────────────────────────────────────────────────────

interface EditPanelProps {
  project: IncubatorProject;
  open: boolean;
  onClose: () => void;
  onSave: (id: bigint, updates: Omit<IncubatorProject, "id">) => Promise<void>;
  uploadIncubatorImage: (file: File) => Promise<string>;
  uploadIncubatorPpt: (file: File) => Promise<string>;
  uploadIncubatorDoc: (file: File) => Promise<string>;
  uploadIncubatorSrc: (file: File) => Promise<string>;
}

function EditPanel({
  project,
  open,
  onClose,
  onSave,
  uploadIncubatorImage,
  uploadIncubatorPpt,
  uploadIncubatorDoc,
  uploadIncubatorSrc,
}: EditPanelProps) {
  const [name, setName] = useState(project.name);
  const [youtubeUrl, setYoutubeUrl] = useState(project.youtubeUrl);
  const [instaUrl, setInstaUrl] = useState(project.instaUrl);
  const [googleUrl, setGoogleUrl] = useState(project.googleUrl);
  const [saving, setSaving] = useState(false);

  const image = useFileUpload(uploadIncubatorImage, 5);
  const ppt = useFileUpload(uploadIncubatorPpt, 20);
  const doc = useFileUpload(uploadIncubatorDoc, 10);
  const src = useFileUpload(uploadIncubatorSrc, 10);

  // Stable reset callbacks extracted to avoid lint deps
  const imageReset = image.reset;
  const pptReset = ppt.reset;
  const docReset = doc.reset;
  const srcReset = src.reset;

  // Pre-populate with existing file references when panel opens
  useEffect(() => {
    if (open) {
      setName(project.name);
      setYoutubeUrl(project.youtubeUrl);
      setInstaUrl(project.instaUrl);
      setGoogleUrl(project.googleUrl);
      imageReset(
        project.imageUrl
          ? { objectId: project.imageUrl, displayName: "Current image" }
          : undefined,
      );
      pptReset(
        project.pptFileName
          ? { objectId: project.pptFileName, displayName: "Current PPT" }
          : undefined,
      );
      docReset(
        project.docFileName
          ? { objectId: project.docFileName, displayName: "Current doc" }
          : undefined,
      );
      srcReset(
        project.srcFileName
          ? { objectId: project.srcFileName, displayName: "Current source" }
          : undefined,
      );
    }
  }, [
    open,
    project.name,
    project.youtubeUrl,
    project.instaUrl,
    project.googleUrl,
    project.imageUrl,
    project.pptFileName,
    project.docFileName,
    project.srcFileName,
    imageReset,
    pptReset,
    docReset,
    srcReset,
  ]);

  const isAnyUploading =
    image.state.uploading ||
    ppt.state.uploading ||
    doc.state.uploading ||
    src.state.uploading;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Project name is required.");
      return;
    }
    if (isAnyUploading) {
      toast.error("Please wait for uploads to complete.");
      return;
    }
    setSaving(true);
    try {
      await onSave(project.id, {
        name: name.trim(),
        youtubeUrl,
        instaUrl,
        googleUrl,
        imageUrl: image.state.objectId ?? project.imageUrl,
        pptFileName: ppt.state.objectId ?? project.pptFileName,
        docFileName: doc.state.objectId ?? project.docFileName,
        srcFileName: src.state.objectId ?? project.srcFileName,
      });
      onClose();
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close edit panel"
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm cursor-default"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") onClose();
          }}
        />
      )}

      {/* Panel */}
      <div
        className={`slide-panel ${open ? "open" : "closed"} flex flex-col`}
        data-ocid="incubator.edit.sheet"
        style={{ width: "420px" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <h3 className="text-base font-display font-bold text-foreground">
              Edit Project
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
              Incubation Registry
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="incubator.edit.close_button"
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-smooth hover:bg-foreground/10"
            aria-label="Close panel"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="edit-name" className="label-xs">
              Project Name
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="custom-input"
              placeholder="Project name..."
              data-ocid="incubator.edit.name.input"
            />
          </div>

          {/* Image */}
          <div className="space-y-1.5">
            <label htmlFor="edit-photo" className="label-xs">
              Project Image
              <span className="ml-2 text-foreground/30 normal-case font-normal">
                JPG/PNG · max 5MB
              </span>
            </label>
            <div className="relative">
              <input
                id="edit-photo"
                type="file"
                accept="image/jpeg,image/png"
                ref={image.ref}
                onChange={(e) => void image.handle(e)}
                disabled={image.state.uploading}
                className="custom-input text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary cursor-pointer disabled:opacity-50"
                data-ocid="incubator.edit.photo.upload_button"
              />
              <UploadSpinner uploading={image.state.uploading} />
            </div>
            <UploadProgressBar
              progress={image.state.progress}
              uploading={image.state.uploading}
            />
            {image.state.displayName && !image.state.uploading && (
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                ✓ {image.state.displayName}
              </p>
            )}
          </div>

          {/* File uploads */}
          <FileUploadRow
            fileKey="ppt"
            state={ppt.state}
            inputRef={ppt.ref}
            onChange={(e) => void ppt.handle(e)}
            maxMBLabel="20MB"
            label="PPT Slideshow"
            id="edit-ppt"
            ocid="incubator.edit.ppt.upload_button"
          />
          <FileUploadRow
            fileKey="doc"
            state={doc.state}
            inputRef={doc.ref}
            onChange={(e) => void doc.handle(e)}
            maxMBLabel="10MB"
            label="Technical Documentation"
            id="edit-doc"
            ocid="incubator.edit.doc.upload_button"
          />

          {/* Social links */}
          <div className="space-y-2">
            <p className="label-xs">Resource Links</p>
            <div className="space-y-2">
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-400/60" />
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="custom-input pl-9 text-sm"
                  placeholder="YouTube URL"
                  data-ocid="incubator.edit.youtube.input"
                />
              </div>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pink-400/60" />
                <input
                  type="url"
                  value={instaUrl}
                  onChange={(e) => setInstaUrl(e.target.value)}
                  className="custom-input pl-9 text-sm"
                  placeholder="Instagram URL"
                  data-ocid="incubator.edit.insta.input"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400/60" />
                <input
                  type="url"
                  value={googleUrl}
                  onChange={(e) => setGoogleUrl(e.target.value)}
                  className="custom-input pl-9 text-sm"
                  placeholder="Google / Web URL"
                  data-ocid="incubator.edit.google.input"
                />
              </div>
            </div>
          </div>

          {/* Source ZIP */}
          <FileUploadRow
            fileKey="src"
            state={src.state}
            inputRef={src.ref}
            onChange={(e) => void src.handle(e)}
            maxMBLabel="10MB"
            label="Source ZIP"
            id="edit-src"
            ocid="incubator.edit.src.upload_button"
          />
        </div>

        {/* Footer */}
        <div
          className="px-7 py-5 shrink-0 flex gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            data-ocid="incubator.edit.cancel_button"
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-smooth"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || isAnyUploading}
            data-ocid="incubator.edit.save_button"
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-smooth bg-primary text-primary-foreground disabled:opacity-60"
            style={{ boxShadow: "0 8px 24px rgba(99,102,241,0.25)" }}
          >
            {saving
              ? "Saving..."
              : isAnyUploading
                ? "Uploading..."
                : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Incubator Card ────────────────────────────────────────────────────────────

interface IncubatorCardProps {
  project: IncubatorProject;
  index: number;
  onEdit: () => void;
  onRemoveRequest: () => void;
  downloadFile: (objectId: string) => Promise<string | null>;
}

function IncubatorCard({
  project: p,
  index,
  onEdit,
  onRemoveRequest,
  downloadFile,
}: IncubatorCardProps) {
  return (
    <div
      className="glass rounded-[2.5rem] relative animate-fade-in group overflow-hidden flex flex-col hover:-translate-y-1 transition-smooth"
      style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.3)" }}
      data-ocid={`incubator.item.${index + 1}`}
    >
      {/* Image */}
      {p.imageUrl ? (
        <IncubatorImage
          imageUrl={p.imageUrl}
          name={p.name}
          downloadFile={downloadFile}
        />
      ) : (
        <div
          className="w-full h-52 flex flex-col items-center justify-center gap-2"
          style={{ background: "rgba(99,102,241,0.04)" }}
        >
          <Zap className="w-8 h-8 text-primary/20" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">
            No Visual Asset
          </span>
        </div>
      )}

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col gap-4">
        {/* Title + actions */}
        <div className="flex items-start gap-3 justify-between">
          <h4
            className="text-base font-display font-bold text-foreground leading-snug truncate min-w-0 flex-1"
            title={p.name}
          >
            {p.name}
          </h4>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              data-ocid={`incubator.edit_button.${index + 1}`}
              aria-label="Edit project"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-smooth hover:bg-primary/15"
              style={{
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <Pencil className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </div>

        {/* File attachment badges */}
        <div className="flex flex-wrap gap-2">
          {FILE_DEFS.map(({ key, label, icon: Icon, bg, color, glow }) => {
            const hasFile = !!(key === "ppt"
              ? p.pptFileName
              : key === "doc"
                ? p.docFileName
                : p.srcFileName);
            return (
              <div
                key={key}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-smooth"
                style={{
                  background: hasFile ? bg : "rgba(255,255,255,0.03)",
                  color: hasFile ? color : "rgba(255,255,255,0.2)",
                  border: `1px solid ${hasFile ? `${color}33` : "rgba(255,255,255,0.06)"}`,
                  boxShadow: hasFile ? `0 0 8px ${glow}` : "none",
                }}
              >
                <Icon className="w-3 h-3" />
                {label}
              </div>
            );
          })}
        </div>

        {/* Social links */}
        {(p.youtubeUrl || p.instaUrl || p.googleUrl) && (
          <div
            className="flex flex-wrap gap-2"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "12px",
            }}
          >
            {p.youtubeUrl && (
              <a
                href={p.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-smooth hover:scale-110"
                style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {p.instaUrl && (
              <a
                href={p.instaUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-smooth hover:scale-110"
                style={{
                  background: "rgba(236,72,153,0.12)",
                  color: "#f472b6",
                }}
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {p.googleUrl && (
              <a
                href={p.googleUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Web"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-smooth hover:scale-110"
                style={{
                  background: "rgba(59,130,246,0.12)",
                  color: "#60a5fa",
                }}
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Footer: date + terminate */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                background: "oklch(var(--primary))",
                boxShadow: "0 0 6px rgba(99,102,241,0.8)",
              }}
            />
            <p className="text-[10px] text-foreground/30 uppercase tracking-widest font-bold">
              {p.createdAt ? formatDate(p.createdAt) : "Incubation Phase"}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemoveRequest}
            data-ocid={`incubator.delete_button.${index + 1}`}
            className="text-destructive/30 hover:text-destructive transition-colors text-[10px] font-bold uppercase tracking-tighter"
          >
            Terminate
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Project Form ──────────────────────────────────────────────────────────

function AddProjectForm({
  onAdd,
  uploadIncubatorImage,
  uploadIncubatorPpt,
  uploadIncubatorDoc,
  uploadIncubatorSrc,
  projectCount,
}: {
  onAdd: (project: Omit<IncubatorProject, "id">) => Promise<void>;
  uploadIncubatorImage: (file: File) => Promise<string>;
  uploadIncubatorPpt: (file: File) => Promise<string>;
  uploadIncubatorDoc: (file: File) => Promise<string>;
  uploadIncubatorSrc: (file: File) => Promise<string>;
  projectCount: number;
}) {
  const [name, setName] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [instaUrl, setInstaUrl] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const image = useFileUpload(uploadIncubatorImage, 5);
  const ppt = useFileUpload(uploadIncubatorPpt, 20);
  const doc = useFileUpload(uploadIncubatorDoc, 10);
  const src = useFileUpload(uploadIncubatorSrc, 10);

  const isAnyUploading =
    image.state.uploading ||
    ppt.state.uploading ||
    doc.state.uploading ||
    src.state.uploading;

  const resetAll = () => {
    setName("");
    setYoutubeUrl("");
    setInstaUrl("");
    setGoogleUrl("");
    image.reset();
    ppt.reset();
    doc.reset();
    src.reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyUploading) {
      toast.error("Please wait for uploads to complete.");
      return;
    }
    if (!name.trim()) {
      toast.error("Project name is required.");
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        youtubeUrl,
        instaUrl,
        googleUrl,
        imageUrl: image.state.objectId,
        pptFileName: ppt.state.objectId ?? ppt.state.displayName,
        docFileName: doc.state.objectId ?? doc.state.displayName,
        srcFileName: src.state.objectId ?? src.state.displayName,
      });
      resetAll();
      toast.success(`Project "${name.trim()}" registered.`);
    } catch {
      toast.error("Failed to register project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="glass p-8 rounded-[2.5rem]"
      style={{ boxShadow: "0 0 60px rgba(99,102,241,0.04)" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h3 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Incubator Registry
          </h3>
          <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">
            Repository for Incubating Projects
          </p>
        </div>
        <div className="w-full md:w-52" data-ocid="incubator.storage_panel">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
              Global Storage
            </p>
            <span className="text-[10px] text-muted-foreground font-mono">
              {projectCount > 0 ? `${Math.min(projectCount * 12, 100)}%` : "0%"}
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(projectCount * 12, 100)}%`,
                background:
                  "linear-gradient(90deg, oklch(var(--primary)), oklch(var(--accent)))",
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {projectCount} project{projectCount !== 1 ? "s" : ""} registered
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        data-ocid="incubator.form"
      >
        {/* Name */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="inc-name" className="label-xs">
            Project Name
          </label>
          <input
            id="inc-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="custom-input"
            placeholder="Project being incubated..."
            data-ocid="incubator.name.input"
          />
        </div>

        {/* Image upload */}
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="inc-photo" className="label-xs">
            Project Image / Blueprint Photo
            <span className="ml-2 text-foreground/30 normal-case font-normal">
              JPG/PNG · max 5MB
            </span>
          </label>
          <div className="relative">
            <input
              id="inc-photo"
              type="file"
              accept="image/jpeg,image/png"
              ref={image.ref}
              onChange={(e) => void image.handle(e)}
              disabled={image.state.uploading}
              className="custom-input text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary cursor-pointer disabled:opacity-50"
              data-ocid="incubator.photo.upload_button"
            />
            <UploadSpinner uploading={image.state.uploading} />
          </div>
          <UploadProgressBar
            progress={image.state.progress}
            uploading={image.state.uploading}
          />
          {image.state.displayName && !image.state.uploading && (
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
              ✓ {image.state.displayName}
            </p>
          )}
        </div>

        {/* PPT + DOC */}
        <FileUploadRow
          fileKey="ppt"
          state={ppt.state}
          inputRef={ppt.ref}
          onChange={(e) => void ppt.handle(e)}
          maxMBLabel="20MB"
          label="PPT Slideshow"
          id="inc-ppt"
          ocid="incubator.ppt.upload_button"
        />
        <FileUploadRow
          fileKey="doc"
          state={doc.state}
          inputRef={doc.ref}
          onChange={(e) => void doc.handle(e)}
          maxMBLabel="10MB"
          label="Technical Documentation"
          id="inc-doc"
          ocid="incubator.doc.upload_button"
        />

        {/* Resource links */}
        <div className="space-y-2 md:col-span-2">
          <p className="label-xs">Resource Links</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-400/50" />
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="custom-input pl-9 text-sm"
                placeholder="YouTube URL"
                aria-label="YouTube URL"
                data-ocid="incubator.youtube.input"
              />
            </div>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pink-400/50" />
              <input
                type="url"
                value={instaUrl}
                onChange={(e) => setInstaUrl(e.target.value)}
                className="custom-input pl-9 text-sm"
                placeholder="Instagram URL"
                aria-label="Instagram URL"
                data-ocid="incubator.insta.input"
              />
            </div>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400/50" />
              <input
                type="url"
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
                className="custom-input pl-9 text-sm"
                placeholder="Google/Web URL"
                aria-label="Google URL"
                data-ocid="incubator.google.input"
              />
            </div>
          </div>
        </div>

        {/* SRC upload */}
        <div className="md:col-span-2">
          <FileUploadRow
            fileKey="src"
            state={src.state}
            inputRef={src.ref}
            onChange={(e) => void src.handle(e)}
            maxMBLabel="10MB"
            label="Source Directory (ZIP)"
            id="inc-src"
            ocid="incubator.src.upload_button"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting || isAnyUploading}
            data-ocid="incubator.submit_button"
            className="bg-primary hover:bg-primary/80 text-primary-foreground px-10 py-3.5 rounded-2xl font-bold transition-smooth shadow-lg disabled:opacity-60"
            style={{ boxShadow: "0 8px 32px rgba(99,102,241,0.25)" }}
          >
            {submitting
              ? "Registering..."
              : isAnyUploading
                ? "Uploading..."
                : "Register Incubation"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function IncubatorPage({
  projects,
  onAdd,
  onUpdate,
  onRemove,
  isLoading = false,
  uploadIncubatorImage,
  uploadIncubatorPpt,
  uploadIncubatorDoc,
  uploadIncubatorSrc,
  downloadFile,
}: IncubatorPageProps) {
  const [editingProject, setEditingProject] = useState<IncubatorProject | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<IncubatorProject | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDeleteRequest = (project: IncubatorProject) => {
    setDeleteTarget(project);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await onRemove(deleteTarget.id);
      toast.success("Incubation session terminated.");
    } catch {
      toast.error("Failed to remove project.");
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-8" data-ocid="incubator.section">
      {/* Add form */}
      <AddProjectForm
        onAdd={onAdd}
        uploadIncubatorImage={uploadIncubatorImage}
        uploadIncubatorPpt={uploadIncubatorPpt}
        uploadIncubatorDoc={uploadIncubatorDoc}
        uploadIncubatorSrc={uploadIncubatorSrc}
        projectCount={projects.length}
      />

      {/* Cards grid */}
      {isLoading ? (
        <div className="card-grid" data-ocid="incubator.loading_state">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass rounded-[2.5rem] overflow-hidden">
              <Skeleton
                className="w-full h-52"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div className="p-6 space-y-3">
                <Skeleton
                  className="h-5 w-2/3"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <div className="flex gap-2">
                  <Skeleton
                    className="h-6 w-12 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                  <Skeleton
                    className="h-6 w-12 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                  <Skeleton
                    className="h-6 w-12 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                </div>
                <Skeleton
                  className="h-3 w-full"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div
          className="glass rounded-3xl p-16 text-center"
          data-ocid="incubator.empty_state"
        >
          <div
            className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <Zap className="w-9 h-9 text-primary" />
          </div>
          <h4 className="text-xl font-display font-bold text-foreground mb-2">
            No Projects Incubating
          </h4>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Register your first incubation project above to begin tracking its
            progress.
          </p>
        </div>
      ) : (
        <div className="card-grid pb-20" data-ocid="incubator.list">
          {projects.map((p, i) => (
            <IncubatorCard
              key={String(p.id)}
              project={p}
              index={i}
              onEdit={() => setEditingProject(p)}
              onRemoveRequest={() => handleDeleteRequest(p)}
              downloadFile={downloadFile}
            />
          ))}
        </div>
      )}

      {/* Edit slide-out panel */}
      {editingProject && (
        <EditPanel
          project={editingProject}
          open={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSave={async (id, updates) => {
            if (onUpdate) await onUpdate(id, updates);
            setEditingProject(null);
          }}
          uploadIncubatorImage={uploadIncubatorImage}
          uploadIncubatorPpt={uploadIncubatorPpt}
          uploadIncubatorDoc={uploadIncubatorDoc}
          uploadIncubatorSrc={uploadIncubatorSrc}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent
          className="glass rounded-3xl border-0"
          style={{
            background: "rgba(15,10,40,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          }}
          data-ocid="incubator.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-display">
              Terminate Incubation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove{" "}
              <span className="text-foreground font-semibold">
                "{deleteTarget?.name}"
              </span>{" "}
              and all associated files from the incubator. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="incubator.delete.cancel_button"
              className="rounded-2xl font-bold"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteConfirm()}
              data-ocid="incubator.delete.confirm_button"
              className="rounded-2xl font-bold"
              style={{
                background: "oklch(var(--destructive))",
                color: "oklch(var(--destructive-foreground))",
              }}
            >
              Terminate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
