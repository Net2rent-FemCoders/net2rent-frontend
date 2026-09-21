import { Link } from "react-router-dom";
import StatusBadge from "../../../../../../shared/components/ui/atoms/StatusBadge/StatusBadge.jsx";
import { formatDate } from "../../../../../../shared/utils/formatDate.js";
import "./GuestIncidentItem.scss";

export default function GuestIncidentItem({
  to,
  code,
  title,
  status,
  openedAt,
  resolvedAt,
  className = "",
}) {
  const classes = ["guest-incident-item", className].filter(Boolean).join(" ");

  return (
    <li className="guest-incident-item__wrapper">
      <Link to={to} className={classes}>
        <span className="guest-incident-item__header">
          <span className="guest-incident-item__code">{code}</span>
          <StatusBadge status={status} />
        </span>

        <span className="guest-incident-item__title">{title}</span>

        <span className="guest-incident-item__footer">
          <time className="guest-incident-item__date" dateTime={openedAt}>
            {formatDate(openedAt)}
          </time>
          {resolvedAt && (
            <time
              className="guest-incident-item__resolved"
              dateTime={resolvedAt}
            >
              {formatDate(resolvedAt)}
            </time>
          )}
        </span>
      </Link>
    </li>
  );
}