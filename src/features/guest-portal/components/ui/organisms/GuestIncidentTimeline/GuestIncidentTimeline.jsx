import { CheckCircle, Circle, Wrench, XCircle } from "lucide-react";
import { formatDate } from "../../../../../../shared/utils/formatDate.js";
import { useId } from "react";
import "./GuestIncidentTimeline.scss";

const TERMINAL = {
  RESOLVED: {
    key: "resolved",
    label: "Resuelta",
    Icon: CheckCircle,
    dateField: "resolvedAt",
  },
  REJECTED: {
    key: "rejected",
    label: "Rechazada",
    Icon: XCircle,
    dateField: "closedAt",
  },
};

export default function GuestIncidentTimeline({ incident }) {
  const titleId = useId();
  const milestones = [
    {
      key: "opened",
      label: "Incidencia reportada",
      at: incident.openedAt,
      Icon: Circle,
    },
  ];

  if (incident.assignedAt) {
    milestones.push({
      key: "assigned",
      label: "En curso",
      at: incident.assignedAt,
      Icon: Wrench,
    });
  }

  const terminal = TERMINAL[incident.status];
  if (terminal) {
    milestones.push({
      key: terminal.key,
      label: terminal.label,
      at: incident[terminal.dateField],
      Icon: terminal.Icon,
    });
  }

  return (
    <section aria-labelledby={titleId} className="guest-timeline">
      <h3 id={titleId} className="guest-timeline__title">
        Seguimiento
      </h3>

      <ol className="guest-timeline__list">
        {milestones.map(({ key, label, at, Icon }) => (
          <li key={key} className="guest-timeline__item">
            <Icon
              className="guest-timeline__icon"
              size={18}
              aria-hidden="true"
            />
            <div className="guest-timeline__content">
              <span className="guest-timeline__label">{label}</span>
              {at && (
                <time className="guest-timeline__date" dateTime={at}>
                  {formatDate(at)}
                </time>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}