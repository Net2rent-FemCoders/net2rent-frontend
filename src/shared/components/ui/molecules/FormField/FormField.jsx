import { Children, cloneElement, isValidElement } from "react";
import InlineError from "../../atoms/InlineError/InlineError";
import HelperText from "../../atoms/HelperText/HelperText";
import "./FormField.scss";

export default function FormField({
  id,
  label,
  error,
  helper,
  hint,
  counter,
  required = false,
  optional = false,
  className = "",
  children,
}) {
  const fieldId = id;
  const helperText = hint ?? helper;
  const messageId = error || helper ? `${fieldId}-message` : undefined;

  const control = Children.only(children);
  const decorated = isValidElement(control)
    ? cloneElement(control, {
        id: fieldId,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": messageId,
      })
    : control;

  const classes = ["form-field", error ? "form-field--error" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {label && (
        <div className="form-field__label-row">
          <label className="form-field__label" htmlFor={fieldId}>
            {label}
            {required && (
              <span className="form-field__required" aria-hidden="true">
                {" "}
                *
              </span>
            )}
            {optional && (
              <span className="form-field__optional"> (opcional)</span>
            )}
          </label>
          {counter && <span className="form-field__counter">{counter}</span>}
        </div>
      )}
      <div className="form-field__control">{decorated}</div>
      {error ? (
        <InlineError id={messageId}>{error}</InlineError>
      ) : helperText ? (
        <HelperText id={messageId}>{helperText}</HelperText>
      ) : null}
    </div>
  );
}