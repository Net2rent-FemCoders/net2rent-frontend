import "./LodgingStatusFilter.scss";

export default function LodgingStatusFilter({
  value = "all",
  onChange,
  options = [],
  counts = {},
  className = "",
}) {
  const classes = ["lodging-status-filter", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        const btnClass = [
          "lodging-status-filter__option",
          isActive ? "lodging-status-filter__option--active" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={opt.value}
            type="button"
            className={btnClass}
            aria-pressed={isActive}
            onClick={() => onChange?.(opt.value)}
          >
            <span
              className={`status-dot lodging-status-filter__dot--${opt.value}`}
              aria-hidden="true"
            />
            <span className="lodging-status-filter__label">{opt.label}</span>
            <span
              className="lodging-status-filter__count"
              aria-label={`${counts[opt.value] ?? 0} alojamientos`}
            >
              {counts[opt.value] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
