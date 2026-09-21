import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TextField from "../../atoms/TextField/TextField.jsx";
import "./PasswordInput.scss";

const PasswordInput = forwardRef(function PasswordInput(
  { invalid = false, className = "", ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input">
      <TextField
        ref={ref}
        type={visible ? "text" : "password"}
        invalid={invalid}
        className={`password-input__field ${className}`.trim()}
        {...rest}
      />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOff size={18} aria-hidden="true" />
        ) : (
          <Eye size={18} aria-hidden="true" />
        )}
      </button>
    </div>
  );
});

export default PasswordInput;