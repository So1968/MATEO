const PREFIX = "vogue-marry:speaker-map:";
const API = "http://localhost:8012";

if (typeof window !== "undefined" && !window.__vogueSpeakerMapSyncInstalled) {
  window.__vogueSpeakerMapSyncInstalled = true;
  const originalSetItem = Storage.prototype.setItem;

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    originalSetItem.call(this, key, value);

    if (typeof key !== "string" || !key.startsWith(PREFIX)) return;

    const jobId = key.slice(PREFIX.length);
    if (!jobId) return;

    let mapping;
    try {
      mapping = JSON.parse(value);
    } catch {
      return;
    }

    if (!mapping || typeof mapping !== "object" || Array.isArray(mapping) || !Object.keys(mapping).length) return;

    fetch(`${API}/api/transcription/${encodeURIComponent(jobId)}/speakers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mapping })
    }).catch(() => {
      // La copie locale reste conservée ; une nouvelle sauvegarde retentera la synchronisation.
    });
  };
}
