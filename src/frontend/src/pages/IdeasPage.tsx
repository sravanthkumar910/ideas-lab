import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Instagram, MapPin, Trash2, Youtube } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Idea, IdeaStatus, IdeaType } from "../types";

interface IdeasPageProps {
  ideas: Idea[];
  onAdd: (idea: Omit<Idea, "id">) => Promise<void>;
  onRemove: (id: bigint) => Promise<void>;
  isLoading?: boolean;
}

const IDEA_TYPES: IdeaType[] = ["Software", "Hardware", "Hybrid"];
const IDEA_STATUSES: IdeaStatus[] = ["Drafting", "Researching", "Reviewing"];

const STATUS_COLORS: Record<IdeaStatus, string> = {
  Drafting: "text-indigo-300 border border-indigo-500/30 bg-indigo-500/15",
  Researching: "text-blue-300 border border-blue-500/30 bg-blue-500/15",
  Reviewing: "text-purple-300 border border-purple-500/30 bg-purple-500/15",
};

function getStatusColor(status: string): string {
  return (
    STATUS_COLORS[status as IdeaStatus] ??
    "text-foreground/50 border border-foreground/10 bg-foreground/5"
  );
}

export function IdeasPage({
  ideas,
  onAdd,
  onRemove,
  isLoading = false,
}: IdeasPageProps) {
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
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(
    undefined,
  );
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoDataUrl(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) =>
      setPhotoDataUrl((ev.target?.result as string) ?? undefined);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        photoUrl: photoDataUrl,
      });
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
      setPhotoDataUrl(undefined);
      if (photoInputRef.current) photoInputRef.current.value = "";
      toast.success("New idea manifested in system.");
    } catch {
      toast.error("Failed to save idea. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8" data-ocid="ideas.section">
      <div className="glass p-8 rounded-[2.5rem]">
        <h3 className="text-2xl font-display font-bold mb-6 text-foreground">
          Manifest New Idea
        </h3>
        <form
          onSubmit={handleSubmit}
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
            </label>
            <input
              id="idea-photo"
              type="file"
              accept="image/*"
              ref={photoInputRef}
              onChange={handlePhotoChange}
              className="custom-input text-xs file:bg-primary/10 file:text-primary file:border-0 file:rounded file:px-2"
              data-ocid="ideas.photo.upload_button"
            />
            {photoDataUrl && (
              <div className="mt-2 w-24 h-16 rounded-xl overflow-hidden">
                <img
                  src={photoDataUrl}
                  alt="Preview"
                  className="w-full h-full object-cover opacity-70"
                />
              </div>
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
            <div className="grid grid-cols-3 gap-2">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="custom-input text-[10px]"
                placeholder="YouTube"
                aria-label="YouTube URL"
                data-ocid="ideas.youtube.input"
              />
              <input
                type="url"
                value={instaUrl}
                onChange={(e) => setInstaUrl(e.target.value)}
                className="custom-input text-[10px]"
                placeholder="Instagram"
                aria-label="Instagram URL"
                data-ocid="ideas.insta.input"
              />
              <input
                type="url"
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
                className="custom-input text-[10px]"
                placeholder="Cloud"
                aria-label="Cloud URL"
                data-ocid="ideas.google.input"
              />
            </div>
          </div>
          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              disabled={submitting}
              data-ocid="ideas.submit_button"
              className="bg-primary px-10 py-3.5 rounded-2xl font-bold hover:bg-primary/80 transition-smooth shadow-elevated text-primary-foreground disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Manifest Concept"}
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="card-grid" data-ocid="ideas.loading_state">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass rounded-[2.5rem] overflow-hidden">
              <Skeleton
                className="w-full h-40"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div className="p-8 space-y-3">
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
          <div className="text-6xl mb-4">💡</div>
          <h4 className="text-xl font-display font-bold text-foreground mb-2">
            No Ideas Yet
          </h4>
          <p className="text-muted-foreground text-sm">
            Manifest your first concept above to get started.
          </p>
        </div>
      ) : (
        <div className="card-grid pb-20" data-ocid="ideas.list">
          {ideas.map((idea, i) => (
            <div
              key={String(idea.id)}
              className="glass rounded-[2.5rem] relative group animate-fade-in hover:-translate-y-1 transition-smooth overflow-hidden flex flex-col"
              data-ocid={`ideas.item.${i + 1}`}
            >
              {idea.photoUrl ? (
                <img
                  src={idea.photoUrl}
                  alt={idea.name}
                  className="w-full h-40 object-cover opacity-60 group-hover:opacity-100 transition-smooth"
                />
              ) : (
                <div
                  className="w-full h-40 flex items-center justify-center text-primary/40 font-bold text-sm uppercase tracking-widest"
                  style={{ background: "rgba(99,102,241,0.05)" }}
                >
                  No Concept Visual
                </div>
              )}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-display font-bold text-foreground leading-tight">
                    {idea.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${getStatusColor(idea.status)}`}
                  >
                    {idea.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-foreground/30 uppercase">
                    {idea.ideaType}
                  </span>
                  <span className="text-xs text-primary font-bold">
                    • Due {idea.deadline}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-foreground/50">
                  <MapPin className="w-3 h-3" />
                  {idea.place}
                </div>
                {idea.problem && (
                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest mb-1">
                      Vision Statement
                    </p>
                    <p className="text-foreground/70 text-sm leading-relaxed line-clamp-2">
                      {idea.problem}
                    </p>
                  </div>
                )}
                <div className="flex gap-4 mb-4">
                  {idea.youtubeUrl && (
                    <a
                      href={idea.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="YouTube"
                    >
                      <Youtube className="w-5 h-5 text-foreground/30 hover:text-red-500 transition-colors" />
                    </a>
                  )}
                  {idea.instaUrl && (
                    <a
                      href={idea.instaUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5 text-foreground/30 hover:text-pink-500 transition-colors" />
                    </a>
                  )}
                  {idea.googleUrl && (
                    <a
                      href={idea.googleUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Cloud Link"
                    >
                      <Globe className="w-5 h-5 text-foreground/30 hover:text-primary transition-colors" />
                    </a>
                  )}
                </div>
                <div
                  className="mt-auto flex gap-3 border-t pt-4"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      void onRemove(idea.id).then(() =>
                        toast.success(`"${idea.name}" removed from Ideas Lab.`),
                      );
                    }}
                    className="ml-auto text-foreground/20 hover:text-destructive transition-colors"
                    aria-label="Remove idea"
                    data-ocid={`ideas.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
