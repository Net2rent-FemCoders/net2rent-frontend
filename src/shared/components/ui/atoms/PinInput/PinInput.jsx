import { useRef } from "react";
import "./PinInput.scss";

const LENGTH = 4;

export default function PinInput({
  value = "",
  onChange,
  invalid = false,
  disabled = false,
}) {
  const inputsRef = useRef([]);

  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  const focusInput = (index) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index, event) => {
    const digit = event.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    const next = value.slice(0, index) + digit + value.slice(index + 1);
    onChange(next.slice(0, LENGTH));

    if (index < LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key !== "Backspace") return;
    event.preventDefault();

    if (digits[index]) {
      onChange(value.slice(0, index) + value.slice(index + 1));
    } else if (index > 0) {
      onChange(value.slice(0, index - 1) + value.slice(index));
      focusInput(index - 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH);
    if (!pasted) return;

    onChange(pasted);
    focusInput(Math.min(pasted.length, LENGTH - 1));
  };

  const groupClasses = ["pin-input", disabled && "pin-input--disabled"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={groupClasses} role="group" aria-label="Código PIN">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Dígito ${index + 1} de ${LENGTH}`}
          aria-invalid={invalid || undefined}
          className={["pin-input__box", invalid && "pin-input__box--invalid"]
            .filter(Boolean)
            .join(" ")}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}