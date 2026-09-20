import { useState, useId } from "react";
import Modal from "../../../../../../shared/components/ui/molecules/Modal/Modal";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button";
import TextArea from "../../../../../../shared/components/ui/atoms/TextArea/TextArea";
import FormField from "../../../../../../shared/components/ui/molecules/FormField/FormField";
import InlineError from "../../../../../../shared/components/ui/atoms/InlineError/InlineError";
import "./PauseModal.scss";

export default function PauseModal({
  isOpen,
  onClose,
  incidentCode,
  lodgingName,
  onPause,
  submitting = false,
  error = null,
}) {
  const [reason, setReason] = useState("");
  const [wasOpen, setWasOpen] = useState(isOpen);
  const formId = useId();
  const reasonId = useId();

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setReason("");
  }

  const canSubmit = reason.trim().length > 0 && !submitting;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    onPause?.(reason.trim());
  }

  function handleClose() {
    setReason("");
    onClose?.();
  }

  const subtitle = [incidentCode, lodgingName].filter(Boolean).join(" . ");

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pausar incidencia"
      subtitle={subtitle}
      footer={
        <div className="pause-modal__actions">
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={!canSubmit}
          >
            {submitting ? "Pausando..." : "Confirmar pausa"}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      }
    >
      <form id={formId} className="pause-modal__form" onSubmit={handleSubmit}>
        <FormField id={reasonId} label="Motivo de la pausa">
          <TextArea
            rows={4}
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explica por qué se pausa el trabajo"
          />
        </FormField>

        {error && <InlineError>{error}</InlineError>}
      </form>
    </Modal>
  );
}