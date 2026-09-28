// Normalize and validate API base URL
function getApiBase(): string {
  let envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Ensure protocol is present
  if (!envUrl.startsWith("http://") && !envUrl.startsWith("https://")) {
    envUrl = `http://${envUrl}`;
  }

  // Ensure /api suffix (remove trailing slashes first)
  const trimmed = envUrl.replace(/\/+$/, "");
  if (!trimmed.endsWith("/api")) {
    return `${trimmed}/api`;
  }

  return trimmed;
}

const API_BASE = getApiBase();

const TOKEN_KEY = "farmPath_token";

// Endpoints that must never wipe the stored session on a 401
const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/social"];

function isPublicAuthPath(path: string): boolean {
  return PUBLIC_AUTH_PATHS.some((p) => path === p || path.startsWith(`${p}?`));
}

function portFromApiBase(): string {
  try {
    return new URL(API_BASE).port || "80";
  } catch {
    return "5000";
  }
}

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

async function readBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const body = data as { message?: unknown; errors?: Array<{ message?: unknown }> };
  if (typeof body.message === "string" && body.message) return body.message;
  const first = body.errors?.[0]?.message;
  return typeof first === "string" && first ? first : undefined;
}

function withTimeout(timeoutMs?: number): { controller?: AbortController; clear: () => void } {
  if (!timeoutMs) return { clear: () => {} };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, clear: () => clearTimeout(timer) };
}

/**
 * Runs when fetch() itself failed (server unreachable, CORS, blocked request).
 * Probes the backend with a no-cors request so we can tell the difference
 * between "server is down" and "server is up but the browser blocked us".
 */
async function describeNetworkError(): Promise<string> {
  const port = portFromApiBase();

  const { controller, clear } = withTimeout(4000);
  try {
    await fetch(`${API_BASE}/health`, {
      mode: "no-cors",
      cache: "no-store",
      signal: controller?.signal,
    });
    // The request resolved => something is listening on that port, but the
    // response was blocked (CORS / mixed content / wrong origin).
    return (
      `The backend is running on port ${port}, but the browser blocked the request ` +
      `(CORS or mixed content). Check NEXT_PUBLIC_API_URL in FarmPath/.env.local ` +
      `and make sure the app and API use the same protocol (http vs https).`
    );
  } catch {
    return `Backend server is not running. Please start the server on port ${port}.`;
  } finally {
    clear();
  }
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

  const { controller: timeoutController, clear: clearTimeoutFn } = withTimeout(20000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: options.signal ?? timeoutController?.signal ?? undefined,
    });

    const data = await readBody(res);

    if (res.status === 401) {
      // Wrong credentials on the auth endpoints: show the server's message.
      if (isPublicAuthPath(path)) {
        throw new Error(extractMessage(data) || "Invalid credentials. Please try again.");
      }

      removeToken();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }

    if (res.status === 403) {
      throw new Error("You do not have permission to perform this action.");
    }

    if (!res.ok) {
      throw new Error(extractMessage(data) || `Request failed with status ${res.status}`);
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      throw new Error(
        `Request to ${API_BASE}${path} timed out. The API base URL may be wrong (check NEXT_PUBLIC_API_URL).`
      );
    }
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error(await describeNetworkError());
    }
    throw err;
  } finally {
    clearTimeoutFn();
  }
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  post: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  get: <T>(path: string): Promise<T> => request<T>(path, { method: "GET" }),

  put: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string): Promise<T> => request<T>(path, { method: "DELETE" }),
};

export async function uploadFile<T>(path: string, file: File): Promise<T> {
  const token = getToken();
  const formData = new FormData();
  formData.append("avatar", file);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await readBody(res);
    if (!res.ok) throw new Error(extractMessage(data) || "Upload failed");
    return data as T;
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error(await describeNetworkError());
    }
    throw err;
  }
}
