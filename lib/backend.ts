import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";

const BACKEND_URL = "https://project-help-backend.onrender.com";

/** Server-side fetch to the backend API, forwarding the admin session token as a Bearer header. */
export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });
}
