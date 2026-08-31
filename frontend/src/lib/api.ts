export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

import { supabase } from "./supabase";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  const headers = new Headers(init.headers);
  if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`);
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}

export function getApiErrorMessage(status: number): string {
  if (status >= 500) return "Unable to connect to DocuAI server.";
  return "The request could not be completed.";
}
