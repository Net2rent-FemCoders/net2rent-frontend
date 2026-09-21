import { useForm } from "react-hook-form";
import FormField from "../../../../../../shared/components/ui/molecules/FormField/FormField.jsx";
import TextField from "../../../../../../shared/components/ui/atoms/TextField/TextField.jsx";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button.jsx";
import Spinner from "../../../../../../shared/components/ui/atoms/Spinner/Spinner.jsx";
import NoticeBanner from "../../../../../../shared/components/ui/molecules/NoticeBanner/NoticeBanner.jsx";
import PasswordInput from "../../../../../../shared/components/ui/molecules/PasswordInput/PasswordInput.jsx";
import "./LoginForm.scss";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({
  onSubmit,
  submitError,
  isSubmitting,
  onForgot,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {submitError && <NoticeBanner tone="error">{submitError}</NoticeBanner>}

      <FormField
        id="email"
        label="Correo electrónico"
        error={errors.email?.message}
      >
        <TextField
          type="email"
          placeholder="you@example.com"
          invalid={!!errors.email}
          autoComplete="email"
          {...register("email", {
            required: "El email es obligatorio",
            pattern: {
              value: EMAIL_RE,
              message: "El formato del email no es válido",
            },
          })}
        />
      </FormField>

      <FormField
        id="password"
        label="Contraseña"
        error={errors.password?.message}
      >
        <PasswordInput
          invalid={!!errors.password}
          autoComplete="current-password"
          {...register("password", {
            required: "La contraseña es obligatoria",
          })}
        />
      </FormField>

      {onForgot && (
        <div className="login-form__forgot-row">
          <button
            type="button"
            className="login-form__forgot"
            onClick={onForgot}
          >
            ¿Has olvidado tu contraseña?
          </button>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="login-form__submit"
      >
        {isSubmitting ? (
          <Spinner size="sm" tone="on-brand" />
        ) : (
          "Iniciar sesión"
        )}
      </Button>
    </form>
  );
}