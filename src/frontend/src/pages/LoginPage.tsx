interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        className="glass w-full max-w-md rounded-[2.5rem] shadow-elevated p-10 relative mt-16"
        data-ocid="login.card"
      >
        <div className="flex flex-col items-center -mt-24 mb-10">
          {/* II Logo */}
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center shadow-elevated"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
              border: "4px solid rgba(99,102,241,0.5)",
            }}
          >
            <svg
              className="w-16 h-16"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="32"
                cy="32"
                r="20"
                stroke="rgba(165,180,252,0.6)"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="32" cy="32" r="10" fill="rgba(99,102,241,0.7)" />
              <circle cx="32" cy="32" r="4" fill="rgba(165,180,252,0.9)" />
              <line
                x1="12"
                y1="32"
                x2="22"
                y2="32"
                stroke="rgba(165,180,252,0.5)"
                strokeWidth="1.5"
              />
              <line
                x1="42"
                y1="32"
                x2="52"
                y2="32"
                stroke="rgba(165,180,252,0.5)"
                strokeWidth="1.5"
              />
              <line
                x1="32"
                y1="12"
                x2="32"
                y2="22"
                stroke="rgba(165,180,252,0.5)"
                strokeWidth="1.5"
              />
              <line
                x1="32"
                y1="42"
                x2="32"
                y2="52"
                stroke="rgba(165,180,252,0.5)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-foreground mt-6 tracking-tight">
            Access Portal
          </h1>
          <p className="text-primary/60 text-sm mt-1 font-semibold">
            Decentralized Identity Verification
          </p>
        </div>

        <div className="space-y-6" data-ocid="login.form">
          <div
            className="rounded-2xl p-4 text-center text-xs font-semibold text-muted-foreground"
            style={{
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            <p className="leading-relaxed">
              This portal uses{" "}
              <span className="text-primary font-bold">Internet Identity</span>{" "}
              — a secure, privacy-preserving authentication system. No passwords
              or personal data required.
            </p>
          </div>

          <button
            type="button"
            onClick={onLogin}
            data-ocid="login.submit_button"
            className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/80 text-primary-foreground py-4 rounded-2xl font-bold transition-smooth shadow-elevated"
          >
            <svg
              className="w-5 h-5 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
            Login with Internet Identity
          </button>

          <div className="text-center">
            <p className="text-[10px] text-muted-foreground/40 font-semibold uppercase tracking-widest">
              Powered by Internet Computer Protocol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
