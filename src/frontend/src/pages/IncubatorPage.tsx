import {
  FileText,
  Globe,
  Instagram,
  Package,
  Presentation,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { IncubatorProject } from "../types";

interface IncubatorPageProps {
  projects: IncubatorProject[];
  onAdd: (project: Omit<IncubatorProject, "id">) => void;
  onRemove: (id: number) => void;
}

const FILE_ROWS = [
  {
    key: "ppt" as const,
    label: "PPT",
    sublabel: "Slideshow",
    icon: Presentation,
    bg: "rgba(236,72,153,0.12)",
    color: "#f9a8d4",
    glow: "rgba(236,72,153,0.3)",
  },
  {
    key: "doc" as const,
    label: "DOC",
    sublabel: "Tech Docs",
    icon: FileText,
    bg: "rgba(59,130,246,0.12)",
    color: "#93c5fd",
    glow: "rgba(59,130,246,0.3)",
  },
  {
    key: "src" as const,
    label: "SRC",
    sublabel: "Source",
    icon: Package,
    bg: "rgba(245,158,11,0.12)",
    color: "#fcd34d",
    glow: "rgba(245,158,11,0.3)",
  },
] as const;

export function IncubatorPage({
  projects,
  onAdd,
  onRemove,
}: IncubatorPageProps) {
  const [name, setName] = useState("");
  const [youtube, setYoutube] = useState("");
  const [insta, setInsta] = useState("");
  const [google, setGoogle] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [srcFile, setSrcFile] = useState<File | null>(null);

  const photoRef = useRef<HTMLInputElement>(null);
  const pptRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const srcRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      youtube,
      insta,
      google,
      photo: photoFile ? URL.createObjectURL(photoFile) : null,
      ppt: pptFile
        ? { url: URL.createObjectURL(pptFile), name: pptFile.name }
        : null,
      doc: docFile
        ? { url: URL.createObjectURL(docFile), name: docFile.name }
        : null,
      src: srcFile
        ? { url: URL.createObjectURL(srcFile), name: srcFile.name }
        : null,
    });
    setName("");
    setYoutube("");
    setInsta("");
    setGoogle("");
    setPhotoFile(null);
    setPptFile(null);
    setDocFile(null);
    setSrcFile(null);
    if (photoRef.current) photoRef.current.value = "";
    if (pptRef.current) pptRef.current.value = "";
    if (docRef.current) docRef.current.value = "";
    if (srcRef.current) srcRef.current.value = "";
    toast.success(`Incubating: ${name}`);
  };

  return (
    <div className="space-y-8" data-ocid="incubator.section">
      {/* ── Form Panel ── */}
      <div
        className="glass p-8 rounded-[2.5rem]"
        style={{ boxShadow: "0 0 60px rgba(99,102,241,0.04)" }}
      >
        {/* Header row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h3 className="text-2xl font-display font-bold text-foreground tracking-tight">
              Incubator Registry
            </h3>
            <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">
              Repository for Incubating Projects
            </p>
          </div>

          {/* Storage bar */}
          <div className="w-full md:w-52" data-ocid="incubator.storage_panel">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                Global Storage
              </p>
              <span className="text-[10px] text-muted-foreground font-mono">
                42%
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: "42%",
                  background:
                    "linear-gradient(90deg, oklch(var(--primary)), oklch(var(--accent)))",
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              4.2 GB / 10.0 GB Limit
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          data-ocid="incubator.form"
        >
          {/* Project Name */}
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

          {/* Project Image */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="inc-photo" className="label-xs">
              Project Image / Blueprint Photo
            </label>
            <input
              id="inc-photo"
              type="file"
              accept="image/*"
              ref={photoRef}
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="custom-input text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary cursor-pointer"
              data-ocid="incubator.photo.upload_button"
            />
          </div>

          {/* PPT */}
          <div className="space-y-2">
            <label htmlFor="inc-ppt" className="label-xs">
              PPT Slideshow
            </label>
            <input
              id="inc-ppt"
              type="file"
              ref={pptRef}
              onChange={(e) => setPptFile(e.target.files?.[0] ?? null)}
              className="custom-input text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-foreground cursor-pointer"
              data-ocid="incubator.ppt.upload_button"
            />
          </div>

          {/* Technical Documentation */}
          <div className="space-y-2">
            <label htmlFor="inc-doc" className="label-xs">
              Technical Documentation
            </label>
            <input
              id="inc-doc"
              type="file"
              ref={docRef}
              onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
              className="custom-input text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-foreground cursor-pointer"
              data-ocid="incubator.doc.upload_button"
            />
          </div>

          {/* Resource Links */}
          <div className="space-y-2 md:col-span-2">
            <p className="label-xs">Resource Links (YouTube, Insta, Google)</p>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="custom-input text-[10px]"
                placeholder="YouTube URL"
                aria-label="YouTube URL"
                data-ocid="incubator.youtube.input"
              />
              <input
                type="url"
                value={insta}
                onChange={(e) => setInsta(e.target.value)}
                className="custom-input text-[10px]"
                placeholder="Instagram URL"
                aria-label="Instagram URL"
                data-ocid="incubator.insta.input"
              />
              <input
                type="url"
                value={google}
                onChange={(e) => setGoogle(e.target.value)}
                className="custom-input text-[10px]"
                placeholder="Google/Cloud Link"
                aria-label="Google/Cloud URL"
                data-ocid="incubator.google.input"
              />
            </div>
          </div>

          {/* Source ZIP */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="inc-src" className="label-xs">
              Source Directory (ZIP/Folder)
            </label>
            <input
              id="inc-src"
              type="file"
              ref={srcRef}
              onChange={(e) => setSrcFile(e.target.files?.[0] ?? null)}
              className="custom-input text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-foreground cursor-pointer"
              data-ocid="incubator.src.upload_button"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              data-ocid="incubator.submit_button"
              className="bg-primary hover:bg-primary/80 text-primary-foreground px-10 py-3.5 rounded-2xl font-bold transition-smooth shadow-lg"
              style={{ boxShadow: "0 8px 32px rgba(99,102,241,0.25)" }}
            >
              Register Incubation
            </button>
          </div>
        </form>
      </div>

      {/* ── Card Grid ── */}
      {projects.length === 0 ? (
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
              key={p.id}
              project={p}
              index={i}
              onRemove={() => {
                onRemove(p.id);
                toast.success("Incubation session ended.");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Extracted card component for cleanliness                   */
/* ─────────────────────────────────────────────────────────── */

interface IncubatorCardProps {
  project: IncubatorProject;
  index: number;
  onRemove: () => void;
}

function IncubatorCard({ project: p, index, onRemove }: IncubatorCardProps) {
  return (
    <div
      className="glass rounded-[2.5rem] relative animate-fade-in group overflow-hidden flex flex-col hover:-translate-y-1 transition-smooth"
      style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.3)" }}
      data-ocid={`incubator.item.${index + 1}`}
    >
      {/* Image / Placeholder */}
      {p.photo ? (
        <div className="relative overflow-hidden">
          <img
            src={p.photo}
            alt={p.name}
            className="w-full h-48 object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-smooth"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 50%, rgba(5,10,24,0.8))",
            }}
          />
        </div>
      ) : (
        <div
          className="w-full h-48 flex flex-col items-center justify-center gap-2 text-accent/30"
          style={{ background: "rgba(236,72,153,0.04)" }}
        >
          <Zap className="w-8 h-8" />
          <span className="text-xs font-bold uppercase tracking-widest">
            No Visual Asset
          </span>
        </div>
      )}

      <div className="p-7 flex-1 flex flex-col gap-5">
        {/* Name + Zap badge */}
        <div className="flex justify-between items-start gap-3">
          <h4
            className="text-lg font-display font-bold text-foreground leading-snug truncate min-w-0"
            title={p.name}
          >
            {p.name}
          </h4>
          <div
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <Zap className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Social link icons */}
        {(p.youtube || p.insta || p.google) && (
          <div
            className="flex gap-2.5 pb-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            {p.youtube && (
              <a
                href={p.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-smooth hover:scale-110"
                style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
              >
                {/* YouTube SVG icon */}
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            )}
            {p.insta && (
              <a
                href={p.insta}
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
            {p.google && (
              <a
                href={p.google}
                target="_blank"
                rel="noreferrer"
                aria-label="Cloud"
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

        {/* File rows */}
        <div className="space-y-2 flex-1">
          {FILE_ROWS.map(
            ({ key, label, sublabel, icon: Icon, bg, color, glow }) => {
              const file = p[key];
              return (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-smooth glass-hover"
                  style={{ border: "1px solid transparent" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] tracking-tight shrink-0"
                      style={{
                        background: bg,
                        color,
                        boxShadow: file ? `0 0 10px ${glow}` : "none",
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-foreground/60 tracking-wider uppercase">
                        {sublabel}
                      </p>
                      {file && (
                        <p
                          className="text-[9px] text-muted-foreground truncate max-w-[100px]"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                      )}
                    </div>
                  </div>
                  {file ? (
                    <a
                      href={file.url}
                      download={file.name}
                      className="text-[10px] font-bold uppercase tracking-wider transition-smooth hover:text-foreground"
                      style={{ color }}
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-[10px] text-foreground/20 uppercase font-bold">
                      None
                    </span>
                  )}
                </div>
              );
            },
          )}
        </div>

        {/* Footer */}
        <div
          className="pt-4 flex justify-between items-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                background: "oklch(var(--primary))",
                boxShadow: "0 0 6px rgba(99,102,241,0.8)",
              }}
            />
            <p className="text-[10px] text-foreground/30 uppercase tracking-widest font-bold">
              Incubation Phase
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-destructive/30 hover:text-destructive transition-colors text-xs font-bold uppercase tracking-tighter"
            data-ocid={`incubator.delete_button.${index + 1}`}
          >
            Terminate
          </button>
        </div>
      </div>
    </div>
  );
}
