import { useId } from "react";
import { Pencil } from "lucide-react";
import ActiveBadge from "../../atoms/ActiveBadge/ActiveBadge.jsx";
import PinBadge from "../../atoms/PinBadge/PinBadge.jsx";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button.jsx";
import "./LodgingRow.scss";

export default function LodgingRow({
  name,
  address,
  reference,
  active,
  notes,
  onEdit,
  onChangePin,
  onToggleActive,
  className = "",
}) {
  const nameId = useId();
  const classes = ["lodging-row", className].filter(Boolean).join(" ");
  const hasActions = onEdit || onChangePin || onToggleActive;

  return (
    <article className={classes} aria-labelledby={nameId}>
      <div className="lodging-row__body">
        <div className="lodging-row__header">
          <h3 className="lodging-row__name" id={nameId}>
            {name}
          </h3>
          <ActiveBadge active={active} />
        </div>

        <p className="lodging-row__address">
          {address} <PinBadge value={reference} label="Referencia" />
        </p>

        {notes && <p className="lodging-row__notes is-truncated">{notes}</p>}
      </div>

      {hasActions && (
        <div className="lodging-row__actions">
          {onEdit && (
            <Button variant="secondary" onClick={onEdit}>
              <Pencil size={16} aria-hidden="true" />
              Editar
            </Button>
          )}
          {onChangePin && (
            <Button variant="secondary" onClick={onChangePin}>
              PIN
            </Button>
          )}
          {onToggleActive && (
            <Button
              variant="secondary"
              className={active ? "lodging-row__deactivate" : ""}
              onClick={onToggleActive}
            >
              {active ? "Desactivar" : "Activar"}
            </Button>
          )}
        </div>
      )}
    </article>
  );
}