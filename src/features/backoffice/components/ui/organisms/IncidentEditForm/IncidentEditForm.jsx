import { useState, useId } from "react";
import FormField from "../../../../../../shared/components/ui/molecules/FormField/FormField.jsx";
import TextField from "../../../../../../shared/components/ui/atoms/TextField/TextField.jsx";
import DropdownField from "../../../../../../shared/components/ui/atoms/DropdownField/DropdownField.jsx";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button.jsx";
import NoticeBox from "../../../../../../shared/components/ui/molecules/NoticeBox/NoticeBox.jsx";
import {
  INCIDENT_CATEGORY,
  INCIDENT_CATEGORY_LABEL,
} from "../../../../../../shared/constants/incidentCategory.js";
import {
  INCIDENT_PRIORITY,
  INCIDENT_PRIORITY_LABEL,
} from "../../../../../../shared/constants/incidentPriority.js";
import "./IncidentEditForm.scss";

const CATEGORY_OPTIONS = Object.values(INCIDENT_CATEGORY).map((value) => ({
  value,
  label: INCIDENT_CATEGORY_LABEL[value],
}));
const PRIORITY_OPTIONS = Object.values(INCIDENT_PRIORITY).map((value) => ({
  value,
  label: INCIDENT_PRIORITY_LABEL[value],
}));

export default function IncidentEditForm({
  initialTitle = "",
  initialCategory = "",
  initialPriority = "",
  onSubmit,
  onCancel,
  saving = false,
  error = null,
  saved = false,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [priority, setPriority] = useState(initialPriority);
  const titleId = useId();
  const categoryId = useId();
  const priorityId = useId();

  const canSubmit =
    Boolean(title.trim()) && Boolean(category) && Boolean(priority) && !saving;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit?.({ title: title.trim(), category, priority });
  }

  return (
    <form className="incident-edit" onSubmit={handleSubmit} noValidate>
      <h2 className="incident-edit__title">Editar incidencia</h2>

      <FormField id={titleId} label="Título" required>
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          disabled={saving}
        />
      </FormField>

      <div className="incident-edit__row">
        <FormField id={categoryId} label="Categoría" required>
          <DropdownField
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={saving}
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {CATEGORY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </DropdownField>
        </FormField>

        <FormField id={priorityId} label="Prioridad" required>
          <DropdownField
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={saving}
          >
            <option value="" disabled>
              Selecciona una prioridad
            </option>
            {PRIORITY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </DropdownField>
        </FormField>
      </div>

      {error && (
        <div role="alert">
          <NoticeBox tone="danger">{error}</NoticeBox>
        </div>
      )}
      <div className="incident-edit__footer">
        <p className="incident-edit__status" role="status" aria-live="polite">
          {saved ? "Cambios guardados." : ""}
        </p>

        <div className="incident-edit__actions">
          <Button type="submit" variant="primary" disabled={!canSubmit}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
}