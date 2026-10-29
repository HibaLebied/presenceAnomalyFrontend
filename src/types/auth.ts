export type UserRole = "ADMIN_RH" | "MANAGER" | string;

export type AuthenticatedUser = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
};

export type LoginResponse = {
  token: string;
  user: AuthenticatedUser;
};

export type AuthSession = {
  token: string;
  user: AuthenticatedUser;
};
