import { useRef, useState } from "react";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    onLogin(username);
    toast.success(`Session Initialized: ${username}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        className="glass w-full max-w-md rounded-[2.5rem] shadow-elevated p-10 relative mt-16"
        data-ocid="login.card"
      >
        <div className="flex flex-col items-center -mt-24 mb-10">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 object-cover shadow-elevated"
            style={{ borderColor: "rgba(99,102,241,0.5)" }}
          />
          <h1 className="text-3xl font-display font-extrabold text-foreground mt-6 tracking-tight">
            Access Portal
          </h1>
          <p className="text-primary/60 text-sm mt-1 font-semibold">
            Identity Verification Required
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          data-ocid="login.form"
        >
          <div className="space-y-2">
            <label htmlFor="login-username" className="label-xs">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="custom-input w-full"
              placeholder="Enter identifier"
              data-ocid="login.username.input"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className="label-xs">
              Security Key
            </label>
            <input
              id="login-password"
              ref={passwordRef}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="custom-input w-full"
              placeholder="••••••••"
              data-ocid="login.password.input"
            />
          </div>
          <button
            type="submit"
            data-ocid="login.submit_button"
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground py-4 rounded-2xl font-bold transition-smooth shadow-elevated"
          >
            Initialize Session
          </button>
        </form>
      </div>
    </div>
  );
}
