import { useState } from "react";
import { searchMemory } from "../../lib/local-api.js";

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const value = query.trim();
    if (!value) {
      setResults([]);
      return;
    }
    setBusy(true);
    setError("");
    try {
      setResults(await searchMemory(value));
    } catch (requestError) {
      setError(requestError.message || "Recherche indisponible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="generic-view search-view">
      <div className="data-toolbar">
        <div>
          <p className="data-kicker">Longue-vue</p>
          <h3>Rechercher dans la mémoire</h3>
          <p>La recherche parcourt les journaux, sources et notes enregistrés localement.</p>
        </div>
      </div>
      <form className="search-form" onSubmit={handleSubmit}>
        <label htmlFor="memory-search">Mot ou expression</label>
        <div>
          <input id="memory-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex. décision, réunion, personne…" />
          <button type="submit" disabled={busy}>{busy ? "Recherche…" : "Chercher"}</button>
        </div>
      </form>
      {error ? <p className="data-state error">{error}</p> : null}
      {!busy && !error && query.trim() && !results.length ? <p className="data-state">Aucun résultat pour cette recherche.</p> : null}
      <div className="search-results">
        {results.map((result) => (
          <article className="generic-card search-result" key={`${result.projectSlug}/${result.relativePath}`}>
            <small>{result.projectSlug || "Mémoire générale"}</small>
            <h3>{result.fileName}</h3>
            <p>{result.snippet}</p>
            <span>{result.relativePath}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
