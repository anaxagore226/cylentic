const INCIDENT_LABELS: Record<string, string> = {
  fullscreen_exit: "Sortie plein écran",
  tab_switch: "Changement d'onglet",
  session_close: "Fermeture session",
  network_issue: "Problème réseau",
  clipboard_paste: "Collage externe bloqué",
};

export interface IncidentItem {
  id: string;
  type: string;
  occurredAt: string;
  durationSeconds?: number | null;
  payload?: string | null;
}

export function IncidentTimeline({ incidents }: { incidents: IncidentItem[] }) {
  if (incidents.length === 0) {
    return <p className="text-sm text-muted">Aucun incident enregistré.</p>;
  }

  return (
    <ol className="space-y-3">
      {incidents.map((inc) => (
        <li
          key={inc.id}
          className="rounded-lg border border-card-border px-4 py-3 text-sm"
        >
          <div className="flex justify-between gap-4">
            <span className="font-medium text-danger">
              {INCIDENT_LABELS[inc.type] ?? inc.type}
            </span>
            <time className="shrink-0 text-xs text-muted">
              {new Date(inc.occurredAt).toLocaleString("fr-FR")}
            </time>
          </div>
          {inc.payload ? (
            <p className="mt-2 truncate font-mono text-xs text-muted">
              Tentative de collage : {inc.payload.slice(0, 120)}
              {inc.payload.length > 120 ? "…" : ""}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
