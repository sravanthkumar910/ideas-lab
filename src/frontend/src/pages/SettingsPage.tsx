import { Skeleton } from "@/components/ui/skeleton";
import { Camera, ExternalLink, Plus, X } from "lucide-react";
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
}

export function SettingsPage({
  profile,
  webLinks,
  onUpdateProfile,
  onAddLink,
  onRemoveLink,
  isLoading = false,
}: SettingsPageProps) {
  const [name, setName] = useState(profile.displayName || "");
  const [email, setEmail] = useState(profile.email || "");
  const [photoPreview, setPhotoPreview] = useState<string>(
    profile.profilePhotoUrl || DEFAULT_AVATAR,
  );
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Sync profile updates from parent
  useEffect(() => {
    setName(profile.displayName || "");
    setEmail(profile.email || "");
    setPhotoPreview(profile.profilePhotoUrl || DEFAULT_AVATAR);
  }, [profile]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      setPendingPhoto(dataUrl);
      toast.success("ID Profile Visual Refreshed.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Partial<UserProfile> = { displayName: name, email };
      if (pendingPhoto) updates.profilePhotoUrl = pendingPhoto;
      await onUpdateProfile(updates);
      setPendingPhoto(null);
      toast.success("System preferences successfully updated.");
    } catch {
      toast.error("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = async () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    try {
      await onAddLink({ title: linkTitle.trim(), url: linkUrl.trim() });
      setLinkTitle("");
      setLinkUrl("");
      toast.success("Connectivity synced.");
    } catch {
      toast.error("Failed to add link.");
    }
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleAddLink();
  };

  return (
    <div
      className="space-y-8 pb-20 animate-fade-in"
      data-ocid="settings.section"
    >
      <div className="glass p-10 rounded-[2.5rem]">
        <h3 className="text-2xl font-bold mb-10 text-foreground tracking-tight">
          System Configuration
        </h3>

        <div className="space-y-12">
          {/* ── Profile ── */}
          <section aria-labelledby="profile-heading">
            {isLoading ? (
              <div className="flex items-start gap-10">
                <Skeleton
                  className="w-32 h-32 rounded-[2rem] shrink-0"
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
              <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
                <div className="relative group shrink-0">
                  <img
                    src={photoPreview}
                    alt={name || "Profile"}
                    className="object-cover transition-smooth"
                    style={{
                      width: 132,
                      height: 132,
                      borderRadius: "2.5rem",
                      border: "4px solid rgba(99,102,241,0.25)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth cursor-pointer text-white"
                    style={{
                      background: "rgba(0,0,0,0.65)",
                      borderRadius: "2.5rem",
                    }}
                    aria-label="Change profile photo"
                    data-ocid="settings.photo.upload_button"
                  >
                    <Camera className="w-6 h-6 mb-1.5" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      Change Photo
                    </span>
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {pendingPhoto && (
                    <span
                      className="absolute -bottom-2 -right-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(99,102,241,0.3)",
                        border: "1px solid rgba(99,102,241,0.5)",
                        color: "#a5b4fc",
                      }}
                    >
                      Pending
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-6 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                </div>
              </div>
            )}
          </section>

          {/* ── Connected Platforms ── */}
          <section
            aria-labelledby="platforms-heading"
            className="pt-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <h4
              id="platforms-heading"
              className="text-lg font-bold mb-1 text-foreground"
            >
              Connected Platforms &amp; Portfolio
            </h4>
            <p className="text-xs font-semibold mb-6 uppercase tracking-widest text-muted-foreground">
              Secure External Link Management
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                placeholder="https://link.com/profile"
                aria-label="Platform URL"
                data-ocid="settings.link_url.input"
              />
              <button
                type="button"
                onClick={() => void handleAddLink()}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-smooth text-white shrink-0"
                style={{ background: "rgba(99,102,241,0.85)" }}
                data-ocid="settings.add_link.button"
              >
                <Plus className="w-4 h-4" />
                Add Platform
              </button>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              data-ocid="settings.links.list"
            >
              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <Skeleton
                    key={n}
                    className="h-14 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                ))
              ) : webLinks.length === 0 ? (
                <p
                  className="text-xs text-muted-foreground col-span-3 py-4"
                  data-ocid="settings.links.empty_state"
                >
                  No platforms connected yet. Add your first link above.
                </p>
              ) : (
                webLinks.map((link, i) => (
                  <div
                    key={String(link.id)}
                    className="glass px-5 py-4 rounded-2xl flex items-center justify-between group animate-fade-in glass-hover"
                    data-ocid={`settings.link.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: "oklch(var(--primary))",
                          boxShadow: "0 0 8px rgba(99,102,241,0.7)",
                        }}
                      />
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-foreground/80 hover:text-foreground transition-colors truncate flex items-center gap-1.5"
                      >
                        {link.title}
                        <ExternalLink className="w-3 h-3 opacity-40 shrink-0" />
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => void onRemoveLink(link.id)}
                      className="text-foreground/20 hover:text-destructive opacity-0 group-hover:opacity-100 transition-smooth shrink-0 ml-3"
                      aria-label={`Remove ${link.title}`}
                      data-ocid={`settings.link.delete_button.${i + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Save ── */}
          <section
            className="pt-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="px-10 py-4 rounded-2xl font-bold transition-smooth text-white disabled:opacity-60"
                style={{
                  background: "rgba(99,102,241,0.9)",
                  boxShadow: "0 8px 32px rgba(99,102,241,0.25)",
                }}
                data-ocid="settings.save.primary_button"
              >
                {saving ? "Applying..." : "Apply Global Changes"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
