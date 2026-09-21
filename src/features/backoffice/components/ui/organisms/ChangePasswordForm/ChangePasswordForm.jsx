import { useState } from "react";
import { Save } from "lucide-react";
import PasswordInput from "../../../../../../shared/components/ui/molecules/PasswordInput/PasswordInput.jsx";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button.jsx";
import FormField from "../../../../../../shared/components/ui/molecules/FormField/FormField.jsx";
import "./ChangePasswordForm.scss";

export default function ChangePasswordForm({ onSubmit, submitting = false }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [errCurrent, setErrCurrent] = useState(null);
  const [errNext, setErrNext] = useState(null);
  const [errRepeat, setErrRepeat] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    let ok = true;

    if (!current) {
      setErrCurrent("Introduce tu contraseña actual");
      ok = false;
    } else setErrCurrent(null);

    const hasLetter = /[a-zA-Z]/.test(next);
    const hasNumber = /[0-9]/.test(next);
    if (next.length < 8 || !hasLetter || !hasNumber) {
      setErrNext("Mínimo 8 caracteres, con al menos una letra y un número");
      ok = false;
    } else setErrNext(null);

    if (next !== repeat) {
      setErrRepeat("Las contraseñas no coinciden.");
      ok = false;
    } else setErrRepeat(null);

    if (ok) onSubmit?.({ currentPassword: current, newPassword: next });
  }

  return (
    <form className="change-password-form" onSubmit={handleSubmit} noValidate>
      <div className="change-password-form__title">Cambiar contraseña</div>

      <FormField
        id="current-password"
        label="Contraseña actual"
        error={errCurrent}
      >
        <PasswordInput
          value={current}
          invalid={!!errCurrent}
          placeholder="••••••••"
          onChange={(e) => setCurrent(e.target.value)}
        />
      </FormField>

      <FormField
        id="new-password"
        label="Nueva contraseña"
        error={errNext}
        helper="Mínimo 8 caracteres, con al menos una letra y un número"
      >
        <PasswordInput
          value={next}
          invalid={!!errNext}
          placeholder="Mínimo 8 caracteres"
          onChange={(e) => {
            const value = e.target.value;
            setNext(value);
            if (repeat) {
              setErrRepeat(
                value !== repeat ? "Las contraseñas no coinciden." : null,
              );
            }
          }}
        />
      </FormField>

      <FormField
        id="repeat-password"
        label="Repetir nueva contraseña"
        error={errRepeat}
      >
        <PasswordInput
          value={repeat}
          invalid={!!errRepeat}
          placeholder="••••••••"
          onChange={(e) => {
            const value = e.target.value;
            setRepeat(value);
            setErrRepeat(
              value && value !== next ? "Las contraseñas no coinciden." : null,
            );
          }}
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        className="change-password-form__submit"
        disabled={submitting}
      >
        <Save size={16} aria-hidden="true" />
        {submitting ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}