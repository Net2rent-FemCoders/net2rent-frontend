import { useId, useEffect } from "react";
import { Building2, MapPin, NotebookPen, Save, CircleX } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import Modal from "../../../../../../shared/components/ui/molecules/Modal/Modal.jsx";
import TextField from "../../../../../../shared/components/ui/atoms/TextField/TextField.jsx";
import TextArea from "../../../../../../shared/components/ui/atoms/TextArea/TextArea.jsx";
import FormField from "../../../../../../shared/components/ui/molecules/FormField/FormField.jsx";
import InlineError from "../../../../../../shared/components/ui/atoms/InlineError/InlineError.jsx";
import HelperText from "../../../../../../shared/components/ui/atoms/HelperText/HelperText.jsx";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button.jsx";
import PinGenerator from "../../molecules/PinGenerator/PinGenerator.jsx";
import AddressAutocomplete from "../../../../../../shared/components/ui/molecules/AddressAutocomplete/AddressAutocomplete.jsx";
import "./LodgingModal.scss";

const TITLE_BY_MODE = {
  edit: "Editar alojamiento",
  pin: "Cambiar PIN de acceso",
  create: "Nuevo alojamiento",
};

export default function LodgingModal({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  defaultValues,
  submitError,
  fieldErrors = {},
}) {
  const formId = useId();
  const isPinOnly = mode === "pin";
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      name: "",
      address: "",
      pin: "",
      notes: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      setError(field, { type: "server", message });
    });
  }, [fieldErrors, setError]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={TITLE_BY_MODE[mode]}
      className={isPinOnly ? "lodging-modal--pin-only" : ""}
      footer={
        <div className="lodging-modal__actions">
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={isSubmitting}
          >
            <Save size={16} aria-hidden="true" />
            Guardar
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            <CircleX size={16} aria-hidden="true" />
            Cancelar
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate>
        {submitError && (
          <div className="lodging-modal__alert" role="alert">
            {submitError}
          </div>
        )}

        {!isPinOnly && (
          <>
            <FormField
              id="name"
              label={
                <>
                  <Building2 size={14} aria-hidden="true" />
                  <span>Nombre del alojamiento</span>
                </>
              }
              error={errors.name?.message}
              required
            >
              <TextField
                invalid={!!errors.name}
                {...register("name", { required: "El nombre es obligatorio" })}
              />
            </FormField>

            <FormField
                id="address"
                className="lodging-modal__address-field"
                label={
                  <>
                    <MapPin size={14} aria-hidden="true" />
                    <span>Dirección</span>
                  </>
                }
                error={errors.address?.message}
                required
            >
              
              <Controller
                name="address"
                control={control}
                rules={{ required: "La dirección es obligatoria" }}
                render={({ field }) => (
                  <AddressAutocomplete
                    value={field.value}
                    invalid={!!errors.address}
                    onTextChange={field.onChange}
                    onSelect={(place) => field.onChange(place.formatted)}
                  />
                )}
              />
            </FormField>
          </>
        )}

        <div className="lodging-modal__pin-field">
          <p className="lodging-modal__pin-label">
            PIN de seguridad (4 dígitos)
          </p>
          <Controller
            name="pin"
            control={control}
            rules={{
              validate: (value) => {
                if (mode !== "edit" && !value) return "El PIN es obligatorio";
                if (value && !/^\d{4}$/.test(value))
                  return "El código debe tener 4 dígitos";
                return true;
              },
            }}
            render={({ field }) => (
              <PinGenerator
                value={field.value}
                onChange={field.onChange}
                invalid={!!errors.pin}
              />
            )}
          />
          {errors.pin && <InlineError>{errors.pin.message}</InlineError>}
          <HelperText>
            Al guardar, el PIN anterior deja de funcionar. Copia el nuevo PIN y pégalo
            en las notas de acceso del alojamiento.
          </HelperText>
        </div>

        {!isPinOnly && (
          <FormField
            id="notes"
            label={
              <>
                <NotebookPen size={16} aria-hidden="true" />
                <span>Notas privadas de acceso (uso interno)</span>
              </>
            }
          >
            <TextArea className="lodging-modal__notes" {...register("notes")} />
          </FormField>
        )}
      </form>
    </Modal>
  );
}