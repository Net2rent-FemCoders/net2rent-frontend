import { forwardRef } from "react";
import "./Input.scss";

const Input = forwardRef(function Input(
  {
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    disabled = false,
    invalid = false,
    className = "",
    ...rest
  },
  ref,
) {
  const classes = ["input", invalid ? "input--error" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      ref={ref}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={classes}
      {...rest}
    />
  );
});

export default Input;