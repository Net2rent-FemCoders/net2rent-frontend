import "./Button.scss";

export default function Button({
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
  children,
  onClick,
  ...rest
}) {
  const classes = ["button", `button--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}