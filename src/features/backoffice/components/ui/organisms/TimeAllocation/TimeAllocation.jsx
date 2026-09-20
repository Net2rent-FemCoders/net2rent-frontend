import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button.jsx";
import Input from "../../../../../../shared/components/ui/atoms/Input/Input.jsx";
import "./TimeAllocation.scss";

function extractErrorMessage(err, fallback) {
  return (
    err.response?.data?.errors?.[0]?.message ??
    err.response?.data?.message ??
    fallback
  );
}

export default function TimeAllocation({
  entries = [],
  loading = false,
  error = null,
  adding = false,
  disabled = false,
  pendingIds = new Set(),
  onImpute,
  onUpdate,
  onRemove,
  title = "Imputación de tiempos",
  className = "",
}) {
  const [concept, setConcept] = useState("");
  const [minutes, setMinutes] = useState("");
  const [submitError, setSubmitError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editConcept, setEditConcept] = useState("");
  const [editMinutes, setEditMinutes] = useState("");

  const total = entries.reduce((sum, e) => sum + Number(e.minutes || 0), 0);
  const canSubmit = !adding && concept.trim().length > 0 && Number(minutes) > 0;
  const canSaveEdit = editConcept.trim().length > 0 && Number(editMinutes) > 0;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitError(null);
    try {
      await onImpute(concept.trim(), Number(minutes));
      setConcept("");
      setMinutes("");
    } catch (err) {
      setSubmitError(extractErrorMessage(err, "No se pudo imputar el tiempo"));
    }
  }

  function startEdit(entry) {
    setSubmitError(null);
    setEditingId(entry.id);
    setEditConcept(entry.concept);
    setEditMinutes(String(entry.minutes));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditConcept("");
    setEditMinutes("");
  }

  async function handleSaveEdit(entryId) {
    if (!canSaveEdit) return;
    setSubmitError(null);
    try {
      await onUpdate(entryId, {
        concept: editConcept.trim(),
        minutes: Number(editMinutes),
      });
      cancelEdit();
    } catch (err) {
      setSubmitError(
        extractErrorMessage(err, "No se pudo editar la imputación"),
      );
    }
  }

  async function handleRemove(entryId) {
    setSubmitError(null);
    try {
      await onRemove(entryId);
    } catch (err) {
      setSubmitError(
        extractErrorMessage(err, "No se pudo eliminar la imputación"),
      );
    }
  }

  const classes = ["time-allocation", className].filter(Boolean).join(" ");

  return (
    <section className={classes} aria-busy={loading || adding}>
      <header className="time-allocation__header">
        <h2 className="time-allocation__title">{title}</h2>
        <p
          className="time-allocation__total"
          aria-label={`Total ${total} minutos`}
        >
          {total} min
        </p>
      </header>

      {loading && <p className="time-allocation__hint">Cargando tiempos...</p>}

      {error && (
        <p className="time-allocation__hint" role="alert">
          No se pudieron cargar los tiempos
        </p>
      )}

      {!loading && entries.length > 0 && (
        <ul className="time-allocation__list">
          {entries.map((entry) => {
            const pending = pendingIds.has(entry.id);
            const isEditing = editingId === entry.id;

            if (isEditing) {
              return (
                <li
                  key={entry.id}
                  className="time-allocation__row time-allocation__row--editing"
                >
                  <div className="time-allocation__field-concept">
                    <Input
                      value={editConcept}
                      onChange={(e) => setEditConcept(e.target.value)}
                      aria-label="Editar concepto"
                      maxLength={100}
                      disabled={pending}
                    />
                  </div>
                  <div className="time-allocation__field-minutes">
                    <Input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(e.target.value)}
                      aria-label="Editar minutos"
                      disabled={pending}
                    />
                  </div>
                  <div className="time-allocation__actions">
                    <button
                      type="button"
                      className="time-allocation__action"
                      onClick={() => handleSaveEdit(entry.id)}
                      disabled={pending || !canSaveEdit}
                      aria-label="Guardar cambios"
                    >
                      <Check size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="time-allocation__action"
                      onClick={cancelEdit}
                      disabled={pending}
                      aria-label="Cancelar edición"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li key={entry.id} className="time-allocation__row">
                <div className="time-allocation__info">
                  <span className="time-allocation__primary">
                    {entry.concept}
                  </span>
                  <span className="time-allocation__secondary">
                    {entry.authorName}
                  </span>
                </div>
                <span className="time-allocation__minutes">
                  {entry.minutes} min
                </span>

                {!disabled && (
                  <div className="time-allocation__actions">
                    <button
                      type="button"
                      className="time-allocation__action"
                      onClick={() => startEdit(entry)}
                      disabled={pending}
                      aria-label={`Editar imputación: ${entry.concept}`}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="time-allocation__action time-allocation__action--danger"
                      onClick={() => handleRemove(entry.id)}
                      disabled={pending}
                      aria-label={`Eliminar imputación: ${entry.concept}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!disabled && (
        <>
          {submitError && (
            <p className="time-allocation__hint" role="alert">
              {submitError}
            </p>
          )}

          <form className="time-allocation__add" onSubmit={handleSubmit}>
            <div className="time-allocation__field-concept">
              <Input
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Concepto (ej. desplazamiento)"
                aria-label="Concepto"
                maxLength={100}
                disabled={adding}
              />
            </div>

            <div className="time-allocation__field-minutes">
              <Input
                type="number"
                min="1"
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="Minutos"
                aria-label="Minutos"
                disabled={adding}
              />
            </div>

            <Button type="submit" variant="primary" disabled={!canSubmit}>
              {adding ? "Imputando..." : "Imputar"}
            </Button>
          </form>
        </>
      )}
    </section>
  );
}