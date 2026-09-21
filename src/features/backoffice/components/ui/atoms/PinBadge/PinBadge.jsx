import "./PinBadge.scss";

export default function PinBadge({ value, label, className = "" }) {
  const classes = ["pin-badge", className].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      {label && <span className="visually-hidden">{label}: </span>}
      {value}
    </span>
  );
}