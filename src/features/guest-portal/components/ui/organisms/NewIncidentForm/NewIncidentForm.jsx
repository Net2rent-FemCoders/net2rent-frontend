import { useState, useEffect } from "react";
import { useFormDraft } from "../../../../../../hooks/useFormDraft.js";
import { useForm, Controller, useWatch } from "react-hook-form";
import TextField from "../../../../../../shared/components/ui/atoms/TextField/TextField.jsx";
import TextArea from "../../../../../../shared/components/ui/atoms/TextArea/TextArea.jsx";
import FormField from "../../../../../../shared/components/ui/molecules/FormField/FormField.jsx";
import PhotoUploadList from "../../../../../../shared/components/ui/organisms/PhotoUploadList/PhotoUploadList.jsx";
import PrimaryButton from "../../atoms/PrimaryButton/PrimaryButton.jsx";
import DropdownField from "../../../../../../shared/components/ui/atoms/DropdownField/DropdownField.jsx";
import {
  INCIDENT_CATEGORY,
  INCIDENT_CATEGORY_LABEL,
} from "../../../../../../shared/constants/incidentCategory.js";
import ReadonlyField from "../../../../../../shared/components/ui/molecules/ReadonlyField/ReadonlyField.jsx";
import PhoneField from "../../../../../../shared/components/ui/molecules/PhoneField/PhoneField.jsx";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import "./NewIncidentForm.scss";
import { useNetworkAwareSubmit } from "../../../../../../hooks/useNetworkAwareSubmit.js";

const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 2000;
const DRAFT_KEY = "guestIncidentDraft";
const DRAFT_DEFAULTS = {
  firstName: "",
  lastName: "",
  contact: "",
  description: "",
  category: "",
};

const NAME_FILTER = /[^\p{L}\p{M} '-]/gu;
const NAME_PATTERN = /^[\p{L}\p{M} '-]+$/u;

function onlyNameChars(value) {
  return value.replace(NAME_FILTER, "");
}

export default function NewIncidentForm({ onSubmit }) {
  const [draft, updateDraft, clearDraft] = useFormDraft(
    DRAFT_KEY,
    DRAFT_DEFAULTS,
  );

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      ...draft,
      images: [],
    },
  });

  const [hasFieldErrors, setHasFieldErrors] = useState(false);

  const {
    submit,
    frozen,
    error: submitError,
  } = useNetworkAwareSubmit(onSubmit, {
    fallbackMessage: "No se pudo enviar la incidencia. Inténtalo de nuevo.",
    onSuccess: () => {
      setHasFieldErrors(false);
      clearDraft();
    },
    onError: (err) => {
      const fieldErrors = err.response?.data?.errors;
      setHasFieldErrors(!!fieldErrors?.length);
      fieldErrors?.forEach(({ field, message }) => {
        setError(field, { type: "server", message });
      });
    },
  });

  useEffect(() => {
    const subscription = watch((values) => {
      const rest = { ...values };
      delete rest.images;
      updateDraft(rest);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const descriptionValue = useWatch({ control, name: "description" }) ?? "";
  const descriptionLength = descriptionValue.length;
  const trimmedDescription = descriptionValue.trim();
  const titlePreview =
    trimmedDescription.length > 80
      ? `${trimmedDescription.slice(0, 79)}…`
      : trimmedDescription;

  const firstNameField = register("firstName", {
    required: "El nombre es obligatorio",
    maxLength: { value: 80, message: "Máximo 80 caracteres" },
    pattern: {
      value: NAME_PATTERN,
      message: "El nombre no puede contener números",
    },
  });
  const lastNameField = register("lastName", {
    required: "El apellido es obligatorio",
    maxLength: { value: 80, message: "Máximo 80 caracteres" },
    pattern: {
      value: NAME_PATTERN,
      message: "El apellido no puede contener números",
    },
  });

  function describedBy(name, hasHint) {
    if (errors[name]) return `${name}-error`;
    if (hasHint) return `${name}-hint`;
    return undefined;
  }

  async function handleFormSubmit(values) {
    await submit(values);
  }

  return (
    <form
      className="new-incident-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
    >
      {submitError && !hasFieldErrors && (
        <div className="new-incident-form__alert" role="alert">
          {submitError}
        </div>
      )}

      <div className="new-incident-form__row">
        <FormField
          id="firstName"
          label="Nombre"
          error={errors.firstName?.message}
        >
          <TextField
            id="firstName"
            invalid={!!errors.firstName}
            autoComplete="given-name"
            aria-describedby={describedBy("firstName", false)}
            disabled={frozen}
            {...firstNameField}
            onChange={(e) => {
              if (!e.nativeEvent.isComposing) {
                e.target.value = onlyNameChars(e.target.value);
              }
              firstNameField.onChange(e);
            }}
          />
        </FormField>

        <FormField
          id="lastName"
          label="Apellido"
          error={errors.lastName?.message}
        >
          <TextField
            id="lastName"
            invalid={!!errors.lastName}
            autoComplete="family-name"
            aria-describedby={describedBy("lastName", false)}
            disabled={frozen}
            {...lastNameField}
            onChange={(e) => {
              if (!e.nativeEvent.isComposing) {
                e.target.value = onlyNameChars(e.target.value);
              }
              lastNameField.onChange(e);
            }}
          />
        </FormField>
      </div>

      <FormField
        id="contact"
        label="Teléfono de contacto"
        optional
        error={errors.contact?.message}
        hint="Por si necesitamos contactarte sobre la incidencia."
      >
        <Controller
          name="contact"
          control={control}
          rules={{
            validate: (v) =>
              !v || isPossiblePhoneNumber(v) || "Introduce un teléfono válido",
          }}
          render={({ field }) => (
            <PhoneField
              id="contact"
              invalid={!!errors.contact}
              value={field.value}
              onChange={field.onChange}
              disabled={frozen}
            />
          )}
        />
      </FormField>

      <FormField
        id="category"
        label="Categoría"
        optional
        error={errors.category?.message}
      >
        <DropdownField
          id="category"
          invalid={!!errors.category}
          disabled={frozen}
          {...register("category")}
        >
          <option value="">Selecciona una categoría</option>
          {Object.values(INCIDENT_CATEGORY).map((value) => (
            <option key={value} value={value}>
              {INCIDENT_CATEGORY_LABEL[value]}
            </option>
          ))}
        </DropdownField>
      </FormField>

      <ReadonlyField label="Título de la incidencia" tag="Automático">
        {titlePreview || (
          <span style={{ color: "var(--color-text-muted)" }}>
            Se generará a partir de la descripción
          </span>
        )}
      </ReadonlyField>

      <FormField
        id="description"
        label="Descripción del problema"
        error={errors.description?.message}
        hint={`Describe qué ocurre, entre ${DESCRIPTION_MIN} y ${DESCRIPTION_MAX} caracteres.`}
        counter={`${descriptionLength}/${DESCRIPTION_MAX}`}
      >
        <TextArea
          id="description"
          invalid={!!errors.description}
          aria-describedby={describedBy("description", true)}
          disabled={frozen}
          {...register("description", {
            required: "La descripción es obligatoria",
            minLength: {
              value: DESCRIPTION_MIN,
              message: `Describe el problema con al menos ${DESCRIPTION_MIN} caracteres`,
            },
            maxLength: {
              value: DESCRIPTION_MAX,
              message: `La descripción no puede superar los ${DESCRIPTION_MAX} caracteres`,
            },
          })}
        />
      </FormField>

      <fieldset className="new-incident-form__field new-incident-form__fieldset">
        <legend className="new-incident-form__label">
          Fotos{" "}
          <span className="new-incident-form__optional">
            (opcional, máx. 3 de 5 MB)
          </span>
        </legend>
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <PhotoUploadList
              value={field.value}
              onChange={field.onChange}
              disabled={frozen}
            />
          )}
        />
      </fieldset>

      <PrimaryButton type="submit" isLoading={isSubmitting}>
        Enviar incidencia
      </PrimaryButton>
    </form>
  );
}
