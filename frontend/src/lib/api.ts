export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export function getApiErrorMessage(status: number): string {
  if (status >= 500) return "Unable to connect to DocuAI server.";
  return "The request could not be completed.";
}
