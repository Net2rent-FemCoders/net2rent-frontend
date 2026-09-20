import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import TextField from "../../../../../../shared/components/ui/atoms/TextField/TextField.jsx";
import TextArea from "../../../../../../shared/components/ui/atoms/TextArea/TextArea.jsx";
import FormField from "../../../../../../shared/components/ui/molecules/FormField/FormField.jsx";
import {
  INCIDENT_PRIORITY,
  INCIDENT_PRIORITY_LABEL,
} from "../../../../../../shared/constants/incidentPriority.js";
import {
  INCIDENT_CATEGORY,
  INCIDENT_CATEGORY_LABEL,
} from "../../../../../../shared/constants/incidentCategory.js";
import NoticeBox from "../../../../../../shared/components/ui/molecules/NoticeBox/NoticeBox.jsx";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button.jsx";
import PhoneField from "../../../../../../shared/components/ui/molecules/PhoneField/PhoneField.jsx";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import PhotoUploadList from "../../../../../../shared/components/ui/organisms/PhotoUploadList/PhotoUploadList.jsx";
import "./PhoneIncidentForm.scss";
import { useFormDraft } from "../../../../../../hooks/useFormDraft.js";

const DESC_MIN = 10;
const DESC_MAX = 2000;

const DRAFT_KEY = "phoneIncidentDraft";

const NAME_FILTER = /[^\p{L}\p{M} '-]/gu;
const NAME_PATTERN = /^[\p{L}\p{M} '-]+$/u;

function onlyNameChars(value) {
  return value.replace(NAME_FILTER, "");
}

function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PhoneIncidentForm({
  lodgings = [],
  operators = [],
  onSubmit,
  submitError,
  onDiscard,
  loadingOptions = false,
  frozen = false,
}) {
  const [draft, updateDraft, clearDraft] = useFormDraft(DRAFT_KEY, {
    lodgingId: "",
    operatorId: "",
    openedDate: today(),
    openedTime: new Date().toTimeString().slice(0, 5),
    firstName: "",
    lastName: "",
    contact: "",
    category: "",
    priority: INCIDENT_PRIORITY.NORMAL,
    description: "",
  });

  const {
    register,
    handleSubmit,
    getValues,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      ...draft,
      images: [],
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

  const descriptionValue = useWatch({ control, name: "description" });
  const descriptionLength = (descriptionValue ?? "").length;

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

  function handleDiscard() {
    reset();
    clearDraft();
    onDiscard?.();
  }

  async function handleFormSubmit(values) {
    const succeeded = await onSubmit(values);
    if (succeeded) clearDraft();
  }

  return (
    <form
      className="phone-incident-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
    >
      <NoticeBox tone="brand">
        Registro por vía telefónica. Solo aparecen los alojamientos activos de
        tu cuenta; el título y el código se generan al guardar.
      </NoticeBox>
      {submitError && (
        <div className="phone-incident-form__alert" role="alert">
          {submitError}
        </div>
      )}

      <div className="phone-incident-form__row">
        <FormField
          id="lodgingId"
          label="Alojamiento (activos)"
          error={errors.lodgingId?.message}
          required
        >
          <select
            className="text-field"
            disabled={frozen || loadingOptions}
            {...register("lodgingId", {
              required: "Selecciona un alojamiento",
            })}
          >
            <option value="">
              {loadingOptions
                ? "Cargando alojamientos..."
                : "Selecciona un alojamiento"}
            </option>
            {lodgings.map((lodging) => (
              <option key={lodging.id} value={lodging.id}>
                {lodging.ref} · {lodging.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="operatorId" label="Operario asignado (opcional)">
          <select
            className="text-field"
            disabled={frozen}
            {...register("operatorId")}
          >
            <option value="">
              {loadingOptions ? "Cargando operarios..." : "Sin asignar"}
            </option>
            {operators.map((operator) => (
              <option key={operator.id} value={operator.id}>
                {operator.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="phone-incident-form__row">
        <FormField
          id="openedDate"
          label="Fecha de apertura"
          error={errors.openedDate?.message}
          required
        >
          <TextField
            type="date"
            max={today()}
            invalid={!!errors.openedDate}
            disabled={frozen}
            {...register("openedDate", {
              required: "La fecha de apertura es obligatoria",
              validate: (date) => {
                const time = getValues("openedTime") || "00:00";
                return (
                  new Date(`${date}T${time}`) <= new Date() ||
                  "No se admiten fechas ni horas futuras."
                );
              },
            })}
          />
        </FormField>

        <FormField
          id="openedTime"
          label="Hora de apertura"
          helper="Se admiten aperturas pasadas; no futuras."
          error={errors.openedTime?.message}
          required
        >
          <TextField
            type="time"
            invalid={!!errors.openedTime}
            disabled={frozen}
            {...register("openedTime", {
              required: "La hora de apertura es obligatoria",
            })}
          />
        </FormField>
      </div>

      <div className="phone-incident-form__row">
        <FormField
          id="firstName"
          label="Nombre"
          error={errors.firstName?.message}
          required
        >
          <TextField
            placeholder="Nombre del reportante"
            invalid={!!errors.firstName}
            autoComplete="given-name"
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
          required
        >
          <TextField
            placeholder="Apellido"
            invalid={!!errors.lastName}
            autoComplete="family-name"
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

      <div className="phone-incident-form__row">
        <FormField
          id="contact"
          label="Teléfono (opcional)"
          error={errors.contact?.message}
          helper="Formato internacional, p. ej. +34600111222"
        >
          <Controller
            name="contact"
            control={control}
            rules={{
              validate: (v) =>
                !v ||
                isPossiblePhoneNumber(v) ||
                "Introduce un teléfono válido",
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
          error={errors.category?.message}
          required
        >
          <select
            className="text-field"
            disabled={frozen}
            {...register("category", {
              required: "Selecciona una categoría",
            })}
          >
            <option value="">Selecciona una categoría</option>
            {Object.values(INCIDENT_CATEGORY).map((value) => (
              <option key={value} value={value}>
                {INCIDENT_CATEGORY_LABEL[value]}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField id="priority" label="Prioridad">
        <select
          className="text-field"
          disabled={frozen}
          {...register("priority")}
        >
          {" "}
          {Object.values(INCIDENT_PRIORITY).map((value) => (
            <option key={value} value={value}>
              {INCIDENT_PRIORITY_LABEL[value]}
              {value === INCIDENT_PRIORITY.NORMAL ? " (por defecto)" : ""}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        id="description"
        label={`Descripción (${descriptionLength}/${DESC_MAX})`}
        error={errors.description?.message}
        helper={`Mínimo ${DESC_MIN} caracteres`}
        required
      >
        <TextArea
          invalid={!!errors.description}
          placeholder="Qué ocurre, desde cuándo, qué ha intentado el cliente"
          disabled={frozen}
          {...register("description", {
            required: "La descripción es obligatoria",
            minLength: {
              value: DESC_MIN,
              message: `Mínimo ${DESC_MIN} caracteres`,
            },
            maxLength: {
              value: DESC_MAX,
              message: `Máximo ${DESC_MAX} caracteres`,
            },
          })}
        />
      </FormField>

      <fieldset className="phone-incident-form__fieldset">
        <legend>Fotos (opcional, máx. 3 de 5 MB)</legend>
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

      <div className="phone-incident-form__actions">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          Registrar incidencia
        </Button>
        <Button type="button" variant="secondary" onClick={handleDiscard}>
          Descartar
        </Button>
      </div>
    </form>
  );
}
