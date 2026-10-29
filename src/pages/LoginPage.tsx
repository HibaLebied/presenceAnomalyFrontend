import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldAlert } from "lucide-react";
import forviaFaureciaLogo from "@/assets/forvia-faurecia-logo.png";

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<void>;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onLogin(email.trim(), password);
    } catch (loginError) {
      let message = loginError instanceof Error ? loginError.message : "";
      message = "Adresse e-mail ou mot de passe incorrect.";
      setError(message || "Adresse e-mail ou mot de passe incorrect.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07539b] px-5 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(28,147,244,0.75),transparent_42%),linear-gradient(135deg,#063d76_0%,#0872c8_55%,#004681_100%)]" />
      <div className="pointer-events-none absolute -left-24 bottom-8 h-72 w-72 rounded-full border-[38px] border-white/10 blur-sm" />
      <div className="pointer-events-none absolute right-[-8rem] bottom-[-5rem] h-80 w-80 rounded-full bg-white/15 blur-2xl" />

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/25 bg-slate-950/25 shadow-2xl backdrop-blur-xl lg:grid-cols-[1fr_420px]">
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <div>
            <img
              alt="FORVIA Faurecia"
              className="h-12 w-auto object-contain brightness-0 invert"
              src={forviaFaureciaLogo}
            />
            <p className="mt-16 max-w-md text-4xl font-semibold leading-tight">
              Gestion des anomalies de présence
            </p>
            <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
              Accédez à votre espace sécurisé pour suivre les anomalies et les
              indicateurs de présence.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-blue-100/80">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            Accès réservé aux utilisateurs autorisés
          </div>
        </div>

        <div className="bg-white px-7 py-9 text-slate-900 sm:px-12 sm:py-12">
          <div className="mb-8 lg:hidden">
            <img
              alt="FORVIA Faurecia"
              className="h-10 w-auto object-contain"
              src={forviaFaureciaLogo}
            />
          </div>
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Espace sécurisé
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Connectez-vous pour accéder au tableau de bord.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Adresse e-mail
              </span>
              <span className="relative block">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  autoComplete="email"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="nom@entreprise.com"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Mot de passe
              </span>
              <span className="relative block">
                <LockKeyhole
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-11 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Votre mot de passe"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                  title={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </span>
            </label>

            {error ? (
              <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}

            <button
              className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
