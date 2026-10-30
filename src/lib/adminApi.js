import { apiUrl } from "./api";

export async function adminRequest(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `API request failed (${response.status}). Check that the backend is running and VITE_API_URL points to it.`,
    );
  }

  if (!data) {
    throw new Error("The API returned HTML or an empty response instead of JSON. Check the backend URL.");
  }

  return data;
}
