import { Camera, ExternalLink, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { UserProfile, WebLink } from "../types";

interface SettingsPageProps {
  profile: UserProfile;
  webLinks: WebLink[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onAddLink: (link: Omit<WebLink, "id">) => void;
  onRemoveLink: (id: number) => void;
}

export function SettingsPage({
  profile,
  webLinks,
  onUpdateProfile,
  onAddLink,
  onRemoveLink,
}: SettingsPageProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [photoPreview, setPhotoPreview] = useState<string>(profile.photo);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Security keys do not match.");
      return;
    }
    const updates: Partial<UserProfile> = { name, email };
    if (pendingPhoto) updates.photo = pendingPhoto;
    onUpdateProfile(updates);
    setPendingPhoto(null);
    toast.success("System preferences successfully updated.");
  };

  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    onAddLink({ title: linkTitle.trim(), url: linkUrl.trim() });
    setLinkTitle("");
    setLinkUrl("");
    toast.success("Connectivity synced.");
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddLink();
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
            <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
              {/* Avatar with hover overlay */}
              <div className="relative group shrink-0">
                <img
                  src={photoPreview}
                  alt={name}
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

              {/* Name + Email */}
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

            {/* Add link row */}
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
                onClick={handleAddLink}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-smooth text-white shrink-0"
                style={{ background: "rgba(99,102,241,0.85)" }}
                data-ocid="settings.add_link.button"
              >
                <Plus className="w-4 h-4" />
                Add Platform
              </button>
            </div>

            {/* Link cards */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              data-ocid="settings.links.list"
            >
              {webLinks.map((link, i) => (
                <div
                  key={link.id}
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
                    onClick={() => onRemoveLink(link.id)}
                    className="text-foreground/20 hover:text-destructive opacity-0 group-hover:opacity-100 transition-smooth shrink-0 ml-3"
                    aria-label={`Remove ${link.title}`}
                    data-ocid={`settings.link.delete_button.${i + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {webLinks.length === 0 && (
                <p
                  className="text-xs text-muted-foreground col-span-3 py-4"
                  data-ocid="settings.links.empty_state"
                >
                  No platforms connected yet. Add your first link above.
                </p>
              )}
            </div>
          </section>

          {/* ── Credential Management ── */}
          <section
            aria-labelledby="credentials-heading"
            className="pt-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <h4
              id="credentials-heading"
              className="text-lg font-bold mb-6 text-foreground"
            >
              Credential Management
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="settings-new-pw" className="label-xs">
                  New Security Key
                </label>
                <input
                  id="settings-new-pw"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full custom-input"
                  placeholder="••••••••"
                  data-ocid="settings.new_password.input"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="settings-confirm-pw" className="label-xs">
                  Confirm Key
                </label>
                <input
                  id="settings-confirm-pw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full custom-input"
                  placeholder="••••••••"
                  data-ocid="settings.confirm_password.input"
                />
              </div>
            </div>

            {/* Mismatch hint */}
            {newPassword &&
              confirmPassword &&
              newPassword !== confirmPassword && (
                <p
                  className="text-xs mt-3 font-semibold"
                  style={{ color: "oklch(var(--destructive))" }}
                  data-ocid="settings.password.error_state"
                >
                  Security keys do not match.
                </p>
              )}

            <div className="mt-10">
              <button
                type="button"
                onClick={handleSave}
                className="px-10 py-4 rounded-2xl font-bold transition-smooth text-white"
                style={{
                  background: "rgba(99,102,241,0.9)",
                  boxShadow: "0 8px 32px rgba(99,102,241,0.25)",
                }}
                data-ocid="settings.save.primary_button"
              >
                Apply Global Changes
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
