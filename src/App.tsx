import { useEffect, useState } from "react";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { hrApi } from "@/services/api";
import {
  AUTH_EXPIRED_EVENT,
  clearAuthSession,
  saveAuthSession,
} from "@/auth/session";
import type { AuthSession } from "@/types/auth";

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const handleAuthExpired = () => {
      setSession(null);
      setCheckingSession(false);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, []);

  useEffect(() => {
    let mounted = true;
    void hrApi
      .refresh()
      .then((loginResponse) => {
        if (mounted) {
          const refreshedSession = {
            token: loginResponse.token,
            user: loginResponse.user,
          };
          saveAuthSession(refreshedSession);
          setSession(refreshedSession);
        }
      })
      .catch(() => {
        if (mounted) {
          clearAuthSession();
          setSession(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setCheckingSession(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogin(email: string, password: string) {
    const loginResponse = await hrApi.login(email, password);
    const nextSession = { token: loginResponse.token, user: loginResponse.user };
    saveAuthSession(nextSession);
    setSession(nextSession);
  }

  function handleLogout() {
    void hrApi.logout().catch(() => undefined);
    clearAuthSession();
    setSession(null);
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      </main>
    );
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <DashboardPage
      currentUser={session.user}
      onLogout={handleLogout}
    />
  );
}
