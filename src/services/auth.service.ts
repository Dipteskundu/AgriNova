import { api } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  roles?: string[];
  phone?: string;
}

/**
 * Single auth code path: every login goes to the real backend.
 *
 * The old `mockAuth` layer intercepted the eight demo credentials and handed
 * back a `mock_token_*` string. Those tokens are not JWTs, so the first real
 * data fetch got a 401 and `lib/api.ts` wiped the session and bounced the user
 * back to /login. All eight demo accounts already exist in MongoDB and
 * authenticate fine, so the interception was pure liability — removed.
 */
export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/login", { email, password });
}

export async function apiRegister(data: RegisterInput): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/register", data);
}

export async function apiGetMe(): Promise<AuthUser> {
  const res = await api.get<{ user: AuthUser }>("/auth/me");
  return res.user;
}

export async function apiSocialAuth(data: {
  firebaseUid: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatarUrl?: string;
}): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/social", data);
}
