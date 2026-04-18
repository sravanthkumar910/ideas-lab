import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera,
  CheckCircle2,
  ExternalLink,
  Globe,
  Link2,
  Loader2,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UserProfile, WebLink } from "../types";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80";

interface SettingsPageProps {
  profile: UserProfile;
  webLinks: WebLink[];
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onAddLink: (link: Omit<WebLink, "id">) => Promise<void>;
  onRemoveLink: (id: bigint) => Promise<void>;
  isLoading?: boolean;
  uploadProfilePhoto: (file: File) => Promise<string>;
  downloadFile: (objectId: string) => Promise<string | null>;
}

function isObjectId(value: string): boolean {
  return !value.startsWith("http") && !value.startsWith("data:");
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.3)",
        }}
      >
        <Icon
          className="w-5 h-5"
          style={{ color: "oklch(var(--secondary))" }}
        />
      </div>
      <div>
        <h4 className="text-base font-bold text-foreground leading-tight">
          {title}
        </h4>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ── Platform icon dot ─────────────────────────────────────────────────────────
function PlatformDot({ url }: { url: string }) {
  let hue = 270;
  if (url.includes("github")) hue = 250;
  else if (url.includes("linkedin")) hue = 210;
  else if (url.includes("twitter") || url.includes("x.com")) hue = 200;
  else if (url.includes("instagram")) hue = 320;
  else if (url.includes("youtube")) hue = 25;
  return (
    <span
      className="w-2.5 h-2.5 rounded-full shrink-0"
      style={{
        background: `oklch(0.65 0.22 ${hue})`,
        boxShadow: `0 0 8px oklch(0.65 0.22 ${hue} / 0.6)`,
      }}
    />
  );
}

export function SettingsPage({
  profile,
  webLinks,
  onUpdateProfile,
  onAddLink,
  onRemoveLink,
  isLoading = false,
  uploadProfilePhoto,
  downloadFile,
}: SettingsPageProps) {
  const [name, setName] = useState(profile.displayName || "");
  const [email, setEmail] = useState(profile.email || "");
  const [photoPreview, setPhotoPreview] = useState<string>(DEFAULT_AVATAR);
  const [pendingPhotoObjectId, setPendingPhotoObjectId] = useState<
    string | null
  >(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Sync profile fields when profile prop changes
  useEffect(() => {
    setName(profile.displayName || "");
    setEmail(profile.email || "");

    if (!profile.profilePhotoUrl) {
      setPhotoPreview(DEFAULT_AVATAR);
      return;
    }
    if (!isObjectId(profile.profilePhotoUrl)) {
      setPhotoPreview(profile.profilePhotoUrl);
      return;
    }

    let revoke: string | null = null;
    downloadFile(profile.profilePhotoUrl).then((url) => {
      revoke = url;
      setPhotoPreview(url ?? DEFAULT_AVATAR);
    });
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [profile, downloadFile]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Profile photo must be JPG or PNG.");
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be smaller than 5MB.");
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    setPhotoUploading(true);
    try {
      const objectId = await uploadProfilePhoto(file);
      setPendingPhotoObjectId(objectId);
      URL.revokeObjectURL(localUrl);
      const blobUrl = await downloadFile(objectId);
      setPhotoPreview(blobUrl ?? localUrl);
      toast.success("Profile photo updated.");
    } catch {
      toast.error("Photo upload failed. Please try again.");
      setPhotoPreview(
        profile.profilePhotoUrl
          ? isObjectId(profile.profilePhotoUrl)
            ? DEFAULT_AVATAR
            : profile.profilePhotoUrl
          : DEFAULT_AVATAR,
      );
      setPendingPhotoObjectId(null);
      URL.revokeObjectURL(localUrl);
      if (photoInputRef.current) photoInputRef.current.value = "";
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSave = async () => {
    if (photoUploading) {
      toast.error("Please wait for the photo to finish uploading.");
      return;
    }
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updates: Partial<UserProfile> = { displayName: name, email };
      if (pendingPhotoObjectId) updates.profilePhotoUrl = pendingPhotoObjectId;
      await onUpdateProfile(updates);
      setPendingPhotoObjectId(null);
      setSaveSuccess(true);
      toast.success("System preferences successfully updated.");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      toast.error("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = async () => {
    const trimmedTitle = linkTitle.trim();
    const trimmedUrl = linkUrl.trim();
    if (!trimmedTitle || !trimmedUrl) return;
    // Basic URL validation
    try {
      new URL(trimmedUrl);
    } catch {
      toast.error("Please enter a valid URL including https://");
      return;
    }
    try {
      await onAddLink({ title: trimmedTitle, url: trimmedUrl });
      setLinkTitle("");
      setLinkUrl("");
      toast.success("Platform connected successfully.");
    } catch {
      toast.error("Failed to add platform link.");
    }
  };

  const handleRemoveLink = async (id: bigint) => {
    setDeletingId(id);
    try {
      await onRemoveLink(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleAddLink();
  };

  const hasChanges =
    name !== profile.displayName ||
    email !== profile.email ||
    pendingPhotoObjectId !== null;

  return (
    <div
      className="space-y-6 pb-20 animate-fade-in"
      data-ocid="settings.section"
    >
      {/* ── Page Title ── */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold text-foreground font-display tracking-tight">
            System Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your identity, preferences, and connected platforms
          </p>
        </div>
        <div
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest"
          style={{
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "oklch(var(--secondary))",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Enterprise Portal
        </div>
      </div>

      {/* ── Profile Card ── */}
      <div
        className="glass rounded-[2rem] overflow-hidden"
        data-ocid="settings.profile.card"
      >
        {/* Card header accent bar */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(99,102,241,0.8), rgba(236,72,153,0.6), rgba(99,102,241,0.2))",
          }}
        />

        <div className="p-8">
          <SectionHeader
            icon={User}
            title="Identity Profile"
            subtitle="Personal Configuration & Visual Identity"
          />

          {isLoading ? (
            <div className="flex items-start gap-8">
              <Skeleton
                className="w-32 h-32 rounded-[1.75rem] shrink-0"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div className="flex-1 space-y-4">
                <Skeleton
                  className="h-10 w-full rounded-xl"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <Skeleton
                  className="h-10 w-full rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* ── Photo ── */}
              <div
                className="relative group shrink-0"
                data-ocid="settings.photo.container"
              >
                {/* Glow ring */}
                <div
                  className="absolute -inset-1 rounded-[2.2rem] opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(236,72,153,0.3))",
                    filter: "blur(8px)",
                  }}
                />
                <img
                  src={photoPreview}
                  alt={name || "Profile"}
                  className="relative object-cover transition-smooth"
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: "1.75rem",
                    border: "2px solid rgba(99,102,241,0.35)",
                  }}
                />
                {photoUploading && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: "rgba(0,0,0,0.7)",
                      borderRadius: "1.75rem",
                    }}
                  >
                    <div className="text-center">
                      <Loader2 className="w-7 h-7 text-primary animate-spin mx-auto mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                        Uploading
                      </span>
                    </div>
                  </div>
                )}
                {!photoUploading && (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth cursor-pointer text-white"
                    style={{
                      background: "rgba(0,0,0,0.72)",
                      borderRadius: "1.75rem",
                    }}
                    aria-label="Change profile photo"
                    data-ocid="settings.photo.upload_button"
                  >
                    <Camera className="w-6 h-6 mb-1.5" />
                    <span className="text-[9px] font-bold tracking-widest uppercase">
                      Change Photo
                    </span>
                  </button>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => void handlePhotoChange(e)}
                />
                {pendingPhotoObjectId && !photoUploading && (
                  <span
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{
                      background: "rgba(99,102,241,0.25)",
                      border: "1px solid rgba(99,102,241,0.5)",
                      color: "#a5b4fc",
                    }}
                  >
                    ● Pending Save
                  </span>
                )}
              </div>

              {/* ── Fields ── */}
              <div className="flex-1 space-y-5 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="settings-name" className="label-xs">
                      Display Name
                    </label>
                    <input
                      id="settings-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full custom-input"
                      placeholder="Your display name"
                      data-ocid="settings.name.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="settings-email" className="label-xs">
                      System Email
                    </label>
                    <input
                      id="settings-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full custom-input"
                      placeholder="you@domain.com"
                      data-ocid="settings.email.input"
                    />
                  </div>
                </div>

                {/* Identity badge */}
                <div
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs"
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}
                >
                  <Shield
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "oklch(var(--secondary))" }}
                  />
                  <span className="text-muted-foreground">
                    Secured via{" "}
                    <span
                      className="font-bold"
                      style={{ color: "oklch(var(--secondary))" }}
                    >
                      Internet Identity
                    </span>{" "}
                    — Decentralized authentication, no passwords required.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Connected Platforms Card ── */}
      <div
        className="glass rounded-[2rem] overflow-hidden"
        data-ocid="settings.platforms.card"
      >
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(236,72,153,0.6), rgba(99,102,241,0.8), rgba(236,72,153,0.2))",
          }}
        />

        <div className="p-8">
          <SectionHeader
            icon={Globe}
            title="Connected Platforms & Portfolio"
            subtitle="Secure External Link Management"
          />

          {/* Add link form */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Add New Platform
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                onKeyDown={handleLinkKeyDown}
                className="flex-1 custom-input"
                placeholder="Platform Name (e.g. LinkedIn)"
                aria-label="Platform name"
                data-ocid="settings.link_title.input"
              />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={handleLinkKeyDown}
                className="flex-1 custom-input"
                placeholder="https://yourprofile.com"
                aria-label="Platform URL"
                data-ocid="settings.link_url.input"
              />
              <button
                type="button"
                onClick={() => void handleAddLink()}
                disabled={!linkTitle.trim() || !linkUrl.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-smooth text-white shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "rgba(99,102,241,0.8)" }}
                data-ocid="settings.add_link.button"
              >
                <Plus className="w-4 h-4" />
                Connect
              </button>
            </div>
          </div>

          {/* Links grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            data-ocid="settings.links.list"
          >
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <Skeleton
                  key={n}
                  className="h-16 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              ))
            ) : webLinks.length === 0 ? (
              <div
                className="col-span-3 flex flex-col items-center justify-center py-12 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.015)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                }}
                data-ocid="settings.links.empty_state"
              >
                <Globe
                  className="w-8 h-8 mb-3"
                  style={{ color: "rgba(255,255,255,0.15)" }}
                />
                <p className="text-sm font-semibold text-muted-foreground">
                  No platforms connected yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Add your first platform link above
                </p>
              </div>
            ) : (
              webLinks.map((link, i) => (
                <div
                  key={String(link.id)}
                  className="glass px-4 py-3.5 rounded-2xl flex items-center justify-between group animate-fade-in glass-hover"
                  data-ocid={`settings.link.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PlatformDot url={link.url} />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground/90 truncate">
                        {link.title}
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-muted-foreground hover:text-foreground/70 transition-colors truncate flex items-center gap-1 max-w-[160px]"
                      >
                        <span className="truncate">
                          {link.url.replace(/^https?:\/\//, "")}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleRemoveLink(link.id)}
                    disabled={deletingId === link.id}
                    className="shrink-0 ml-2 flex items-center justify-center w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 transition-smooth disabled:opacity-50"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    aria-label={`Remove ${link.title}`}
                    data-ocid={`settings.link.delete_button.${i + 1}`}
                  >
                    {deletingId === link.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Links count */}
          {webLinks.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              {webLinks.length} platform{webLinks.length !== 1 ? "s" : ""}{" "}
              connected
            </p>
          )}
        </div>
      </div>

      {/* ── Save Panel ── */}
      <div
        className="glass rounded-[2rem] p-6"
        style={{
          background: hasChanges
            ? "rgba(99,102,241,0.05)"
            : "rgba(255,255,255,0.02)",
          border: hasChanges
            ? "1px solid rgba(99,102,241,0.2)"
            : "1px solid rgba(255,255,255,0.06)",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {hasChanges ? (
              <p
                className="text-sm font-semibold"
                style={{ color: "oklch(var(--secondary))" }}
              >
                You have unsaved changes
              </p>
            ) : saveSuccess ? (
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4"
                  style={{ color: "oklch(var(--recharts-success))" }}
                />
                <p
                  className="text-sm font-semibold"
                  style={{ color: "oklch(var(--recharts-success))" }}
                >
                  All changes saved
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                All preferences are up to date
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              Changes apply globally across all modules
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || photoUploading || (!hasChanges && !saveSuccess)}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold transition-smooth text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            style={{
              background: saving
                ? "rgba(99,102,241,0.5)"
                : hasChanges
                  ? "rgba(99,102,241,0.9)"
                  : "rgba(99,102,241,0.4)",
              boxShadow:
                hasChanges && !saving
                  ? "0 8px 32px rgba(99,102,241,0.3)"
                  : "none",
            }}
            data-ocid="settings.save.primary_button"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : photoUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </>
            ) : (
              "Apply Global Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
