import {
  INCIDENT_EVENT_LABEL,
  prettyValue,
} from "../../../shared/constants/incidentEvent.js";
import { INCIDENT_STATUS } from "../../../shared/constants/incidentStatus.js";

export function mapTimelineItemToEntry(item, index) {
  const author = item.actorName ?? "Sistema";

  if (item.type === "COMMENT") {
    return {
      id: `comment-${index}`,
      title: "Comentario interno",
      at: item.at,
      author,
      description: item.text,
      status: null,
    };
  }

  return {
    id: `event-${index}`,
    title: INCIDENT_EVENT_LABEL[item.eventType] ?? item.eventType,
    at: item.at,
    author,
    description: eventDescription(item),
    status:
      item.eventType === "STATUS_CHANGED"
        ? item.newValue
        : item.eventType === "ASSIGNED"
          ? INCIDENT_STATUS.ASSIGNED
          : null,
  };
}

function eventDescription(item) {
  const before = prettyValue(item.previousValue);
  const after = prettyValue(item.newValue);
  const transition =
    before && after
      ? `${before} → ${after}`
      : item.eventType === "TIME_LOGGED" && after
        ? `${after} min`
        : (after ?? null);

  if (transition && item.note) return `${transition} — Motivo: ${item.note}`;
  return transition ?? item.note ?? null;
}

export function mapTimeline(items) {
  return items.map(mapTimelineItemToEntry);
}