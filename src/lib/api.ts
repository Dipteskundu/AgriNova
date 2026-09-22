import { getErrorDetails, getResponseErrorMessage } from "@/lib/errors";

function resolveApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Define it in .env.local (dev) or Vercel env vars (prod)."
    );
  }
  const base = raw.replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

let cachedApiBase: string | null = null;

function getApiBase(): string {
  if (cachedApiBase === null) {
    cachedApiBase = resolveApiBase();
  }
  return cachedApiBase;
}

const TOKEN_KEY = "farmPath_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      removeToken();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign(new URL("/login", window.location.origin));
      }
      throw new Error("Session expired. Please log in again.");
    }

    if (res.status === 403) {
      throw new Error("You do not have permission to perform this action.");
    }

    const data: unknown = await res.json();

    if (!res.ok) {
      throw new Error(getResponseErrorMessage(data, "Request failed"));
    }

    return data as T;
  } catch (err: unknown) {
    const { message } = getErrorDetails(err);
    if (err instanceof TypeError && message === "Failed to fetch") {
      throw new Error("Backend server is not running. Please start the server on port 5000.");
    }
    throw err;
  }
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  get: <T>(path: string) =>
    request<T>(path, { method: "GET" }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};

export async function uploadFile(path: string, file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append("avatar", file);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data: unknown = await res.json();
    if (!res.ok) throw new Error(getResponseErrorMessage(data, "Upload failed"));
    return data;
  } catch (err: unknown) {
    const { message } = getErrorDetails(err);
    if (err instanceof TypeError && message === "Failed to fetch") {
      throw new Error("Backend server is not running. Please start the server on port 5000.");
    }
    throw err;
  }
}
