import MeetingModePanel from "./MeetingModePanel.jsx";

function formatDate(value) {
  if (!value) return "Date à confirmer";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

export default function MeetingsView({ meetings, projects = [], loading, error, journalOnly = false, onSaved }) {
  const visibleMeetings = journalOnly
    ? meetings.filter((meeting) => meeting.hasReport)
    : meetings;

  return (
    <section className="generic-view meetings-view">
      <div className="data-toolbar">
        <div>
          <p className="data-kicker">Mémoire locale</p>
          <h3>{journalOnly ? "Journaux de bord" : "Escales enregistrées"}</h3>
          <p>Les réunions et leurs états viennent de `01_PROJETS`.</p>
        </div>
        <span className="data-count">{visibleMeetings.length}</span>
      </div>
      {loading ? <p className="data-state">Lecture des escales locales…</p> : null}
      {error ? <p className="data-state error">{error}</p> : null}
      {!journalOnly ? <MeetingModePanel projects={projects} onSaved={onSaved} /> : null}
      {!loading && !error && !visibleMeetings.length ? (
        <div className="data-empty">
          <h3>{journalOnly ? "Aucun journal exporté" : "Aucune escale enregistrée"}</h3>
          <p>Les données réelles apparaîtront ici dès qu’une escale sera créée.</p>
        </div>
      ) : null}
      <div className="meeting-list">
        {visibleMeetings.map((meeting) => (
          <article className="generic-card meeting-card" key={`${meeting.projectSlug}/${meeting.meetingDirName}`}>
            <small>{meeting.projectName}</small>
            <h3>{meeting.title}</h3>
            <p className="meeting-date">{formatDate(meeting.date)} · {meeting.meetingType || "Escale"}</p>
            <p>{meeting.status}</p>
            <div className="meeting-flags">
              {meeting.hasAudio ? <span>Audio</span> : null}
              {meeting.hasReport ? <span>Journal</span> : null}
              {meeting.hasValidatedReport ? <span>Validé</span> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
