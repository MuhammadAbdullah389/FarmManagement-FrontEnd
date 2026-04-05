const viteEnv: Record<string, string | undefined> =
  ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {}) as Record<string, string | undefined>;
const API_BASE_URL = (viteEnv["VITE_API_BASE_URL"] ?? "http://localhost:3000").replace(/\/$/, "");

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${safePath}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" && payload && "message" in payload
      ? String((payload as { message?: string }).message)
      : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
