import "./ActiveBadge.scss";

export default function ActiveBadge({ active, className = "" }) {
  const classes = [
    "active-badge",
    active ? "active-badge--active" : "active-badge--inactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <span className="visually-hidden">Estado: </span>
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}