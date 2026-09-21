import "./EmptyMessage.scss";

export default function EmptyMessage({
  message = "No hay incidencias con esos filtros",
  action,
  className = "",
}) {
  return (
    <div className={["empty-message", className].filter(Boolean).join(" ")}>
      <p className={["empty-message__text"]}>{message}</p>
      {action && <div className={["empty-message__action"]}>{action}</div>}
    </div>
  );
}