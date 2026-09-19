const API_BASE = (import.meta.env.VITE_VOGUE_MARRY_API || "http://127.0.0.1:8010").replace(/\/+$/u, "");

export async function localApi(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Erreur de l'API locale (${response.status}).`);
  return payload;
}

export async function loadProjects() {
  const payload = await localApi("/api/projects");
  return Array.isArray(payload.projects) ? payload.projects : [];
}

export async function loadInbox() {
  const payload = await localApi("/api/inbox");
  return Array.isArray(payload.items) ? payload.items : [];
}

export async function searchMemory(query, projectSlug = "") {
  const params = new URLSearchParams({ q: query });
  if (projectSlug) params.set("projectSlug", projectSlug);
  const payload = await localApi(`/api/search?${params.toString()}`);
  return Array.isArray(payload.results) ? payload.results : [];
}

export function exportMeeting(data) {
  return localApi("/api/meetings/export", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function exportMeetingAudio({ projectName, meetingDirName, blob }) {
  const form = new FormData();
  form.append("projectName", projectName);
  form.append("meetingDirName", meetingDirName);
  form.append("audio", blob, "reunion.webm");
  return localApi("/api/meetings/export-audio", { method: "POST", body: form });
}
