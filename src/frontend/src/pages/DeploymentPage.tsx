import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, X } from "lucide-react";
import { useState } from "react";
import { SiGithub } from "react-icons/si";
import { toast } from "sonner";
import type { Architecture, Deployment, EngineType } from "../types";

interface DeploymentPageProps {
  deployments: Deployment[];
  onAdd: (deployment: Omit<Deployment, "id">) => Promise<void>;
  onRemove: (id: bigint) => Promise<void>;
  isLoading?: boolean;
}

const ENGINE_TYPES: EngineType[] = [
  "Frontend",
  "Backend",
  "Full-Stack",
  "Mobile App",
];
const ARCHITECTURES: Architecture[] = ["Dynamic", "Static", "Serverless"];

export function DeploymentPage({
  deployments,
  onAdd,
  onRemove,
  isLoading = false,
}: DeploymentPageProps) {
  const [depName, setDepName] = useState("");
  const [depUrl, setDepUrl] = useState("");
  const [depGithub, setDepGithub] = useState("");
  const [depEngine, setDepEngine] = useState<EngineType>("Frontend");
  const [depArch, setDepArch] = useState<Architecture>("Dynamic");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = depName;
    setSubmitting(true);
    try {
      await onAdd({
        name,
        deployedUrl: depUrl,
        githubUrl: depGithub,
        engineType: depEngine,
        architecture: depArch,
      });
      setDepName("");
      setDepUrl("");
      setDepGithub("");
      setDepEngine("Frontend");
      setDepArch("Dynamic");
      toast.success(`Execution Successful: ${name}`);
    } catch {
      toast.error("Failed to register deployment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (deployment: Deployment) => {
    try {
      await onRemove(deployment.id);
      toast.success("Deployment terminated.");
    } catch {
      toast.error("Failed to remove deployment.");
    }
  };

  return (
    <div className="space-y-8" data-ocid="deployment.section">
      <div className="glass p-8 rounded-[2.5rem]">
        <h3 className="text-2xl font-display font-bold mb-8 text-foreground">
          New Deployment Protocol
        </h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          data-ocid="deployment.form"
        >
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="dep-name" className="label-xs">
              Target Project Name
            </label>
            <input
              id="dep-name"
              type="text"
              required
              value={depName}
              onChange={(e) => setDepName(e.target.value)}
              className="custom-input"
              placeholder="Identifier for this release..."
              data-ocid="deployment.name.input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dep-url" className="label-xs">
              Public Deployed URL
            </label>
            <input
              id="dep-url"
              type="url"
              required
              value={depUrl}
              onChange={(e) => setDepUrl(e.target.value)}
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
              value={depGithub}
              onChange={(e) => setDepGithub(e.target.value)}
              className="custom-input"
              placeholder="https://github.com/user/project"
              data-ocid="deployment.github.input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="dep-engine" className="label-xs">
                Engine Type
              </label>
              <select
                id="dep-engine"
                value={depEngine}
                onChange={(e) => setDepEngine(e.target.value as EngineType)}
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
                value={depArch}
                onChange={(e) => setDepArch(e.target.value as Architecture)}
                className="custom-input"
                data-ocid="deployment.arch.select"
              >
                {ARCHITECTURES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="dep-assets" className="label-xs">
              Asset Uploads (Photos/Videos)
            </label>
            <input
              id="dep-assets"
              type="file"
              multiple
              className="custom-input text-xs file:bg-white/5 file:border-0 file:text-foreground file:text-xs"
              data-ocid="deployment.assets.upload_button"
            />
          </div>

          <div className="md:col-span-2 text-right pt-2">
            <button
              type="submit"
              disabled={submitting}
              data-ocid="deployment.submit_button"
              className="bg-primary px-10 py-3.5 rounded-2xl font-bold hover:bg-primary/80 shadow-elevated text-primary-foreground transition-smooth disabled:opacity-60"
            >
              {submitting ? "Executing..." : "Execute Deployment"}
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="card-grid" data-ocid="deployment.loading_state">
          {[1, 2].map((n) => (
            <div key={n} className="glass p-8 rounded-[2.5rem] space-y-4">
              <Skeleton
                className="h-5 w-2/3"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <Skeleton
                className="h-3 w-1/3"
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
            className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl"
            style={{ background: "rgba(99,102,241,0.15)" }}
          >
            🚀
          </div>
          <h4 className="text-xl font-display font-bold text-foreground mb-2">
            No Deployments Yet
          </h4>
          <p className="text-muted-foreground text-sm">
            Execute your first deployment protocol above to see it listed here.
          </p>
        </div>
      ) : (
        <div className="card-grid pb-20" data-ocid="deployment.list">
          {deployments.map((d, i) => (
            <DeploymentCard
              key={String(d.id)}
              deployment={d}
              index={i}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DeploymentCardProps {
  deployment: Deployment;
  index: number;
  onDelete: (deployment: Deployment) => Promise<void>;
}

function DeploymentCard({
  deployment: d,
  index,
  onDelete,
}: DeploymentCardProps) {
  return (
    <div
      className="glass p-8 rounded-[2.5rem] relative animate-fade-in group hover:-translate-y-1 transition-smooth"
      style={{ borderBottom: "2px solid rgba(99,102,241,0.2)" }}
      data-ocid={`deployment.item.${index + 1}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="min-w-0 pr-4">
          <h4 className="text-xl font-display font-bold text-foreground truncate">
            {d.name}
          </h4>
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
            {d.engineType} • {d.architecture}
          </p>
        </div>
        <span
          className="w-2.5 h-2.5 rounded-full bg-chart-2 animate-pulse shrink-0 mt-1"
          aria-label="Live"
        />
      </div>

      <div className="space-y-3 mb-6">
        <a
          href={d.deployedUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 glass-hover p-3 rounded-xl text-xs font-bold text-foreground/70 hover:text-foreground transition-smooth"
          data-ocid={`deployment.url.link.${index + 1}`}
        >
          <ExternalLink className="w-4 h-4 text-primary shrink-0" />
          Open Deployment
        </a>
        {d.githubUrl && (
          <a
            href={d.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 glass-hover p-3 rounded-xl text-xs font-bold text-foreground/70 hover:text-foreground transition-smooth"
            data-ocid={`deployment.github.link.${index + 1}`}
          >
            <SiGithub className="w-4 h-4 text-muted-foreground shrink-0" />
            View Repository
          </a>
        )}
      </div>

      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <div className="bg-primary w-full h-full" />
      </div>

      <button
        type="button"
        onClick={() => void onDelete(d)}
        className="absolute -top-2 -right-2 w-8 h-8 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth shadow-elevated"
        aria-label={`Remove ${d.name}`}
        data-ocid={`deployment.delete_button.${index + 1}`}
      >
        <X className="w-4 h-4 text-destructive-foreground" />
      </button>
    </div>
  );
}
