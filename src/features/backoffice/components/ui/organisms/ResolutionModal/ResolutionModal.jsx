import { useState, useId } from "react";
import Modal from "../../../../../../shared/components/ui/molecules/Modal/Modal.jsx";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button.jsx";
import Input from "../../../../../../shared/components/ui/atoms/Input/Input.jsx";
import TextArea from "../../../../../../shared/components/ui/atoms/TextArea/TextArea.jsx";
import FormField from "../../../../../../shared/components/ui/molecules/FormField/FormField.jsx";
import InlineError from "../../../../../../shared/components/ui/atoms/InlineError/InlineError.jsx";
import "./ResolutionModal.scss";

export default function ResolutionModal({
  isOpen,
  onClose,
  incidentCode,
  lodgingName,
  onResolve,
  submitting = false,
  error = null,
  imputedMinutes = 0,
}) {
  const [note, setNote] = useState("");
  const [wasOpen, setWasOpen] = useState(isOpen);
  const formId = useId();
  const minutesId = useId();
  const noteId = useId();

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setNote("");
  }

  const hasImputedTime = imputedMinutes > 0;
  const canSubmit = hasImputedTime && note.trim().length > 0 && !submitting;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    onResolve?.({ minutes: imputedMinutes, note: note.trim() });
  }

  const subtitle = [incidentCode, lodgingName].filter(Boolean).join(" · ");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolver incidencia"
      subtitle={subtitle}
      footer={
        <div className="resolution-modal__actions">
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={!canSubmit}
          >
            {submitting ? "Guardando..." : "Marcar como resuelta"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        className="resolution-modal__form"
        onSubmit={handleSubmit}
      >
        <FormField
          id={minutesId}
          label="Minutos invertidos"
          hint={
            hasImputedTime
              ? "Calculado desde la imputación de tiempos."
              : "Aún no hay tiempo imputado. Impútalo antes de resolver."
          }
        >
          <Input
            type="text"
            readOnly
            value={`${imputedMinutes} min`}
            className="resolution-modal__minutes"
            tabIndex={-1}
          />
        </FormField>

        <FormField id={noteId} label="Nota de resolución">
          <TextArea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Qué se ha hecho y con qué material"
          />
        </FormField>

        {error && <InlineError>{error}</InlineError>}
      </form>
    </Modal>
  );
}