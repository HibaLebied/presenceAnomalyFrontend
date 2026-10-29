import type { AuthSession, AuthenticatedUser } from "@/types/auth";

export const AUTH_EXPIRED_EVENT = "hr-anomaly:auth-expired";

let currentSession: AuthSession | null = null;

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Partial<AuthenticatedUser>;
  return (
    typeof user.id === "number" &&
    typeof user.fullName === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string"
  );
}

export function readAuthSession(): AuthSession | null {
  return currentSession;
}

export function saveAuthSession(session: AuthSession) {
  if (isAuthenticatedUser(session.user) && session.token) {
    currentSession = session;
  }
}

export function clearAuthSession() {
  currentSession = null;
}

export function getAccessToken() {
  return currentSession?.token ?? null;
}

export function isAdminUser(user: AuthenticatedUser) {
  return user.role === "ADMIN_RH";
}
