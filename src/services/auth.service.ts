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
