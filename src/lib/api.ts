const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export async function api<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", headers = {}, body } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API request failed");
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string) => api<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    api<T>(endpoint, { method: "POST", body: data }),
  put: <T>(endpoint: string, data: unknown) =>
    api<T>(endpoint, { method: "PUT", body: data }),
  delete: <T>(endpoint: string) => api<T>(endpoint, { method: "DELETE" }),
};
