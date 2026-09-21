import { useState, useId } from "react";
import Modal from "../../../../../../shared/components/ui/molecules/Modal/Modal";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button";
import TextArea from "../../../../../../shared/components/ui/atoms/TextArea/TextArea";
import FormField from "../../../../../../shared/components/ui/molecules/FormField/FormField";
import InlineError from "../../../../../../shared/components/ui/atoms/InlineError/InlineError";
import "./RejectionModal.scss";

export default function RejectionModal({
  isOpen,
  onClose,
  incidentCode,
  lodgingName,
  onReject,
  submitting = false,
  error = null,
}) {
  const [reason, setReason] = useState("");
  const formId = useId();
  const reasonId = useId();

  const canSubmit = reason.trim().length > 0 && !submitting;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    onReject?.(reason.trim());
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
      title="Rechazar incidencia"
      subtitle={subtitle}
      footer={
        <div className="rejection-modal__actions">
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={!canSubmit}
          >
            {submitting ? "Rechazando..." : "Confirmar rechazo"}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        className="rejection-modal__form"
        onSubmit={handleSubmit}
      >
        <FormField id={reasonId} label="Motivo del rechazo">
          <TextArea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeHolder="Explica por qué se rechaza la incidencia (será público para el huesped)"
          />
        </FormField>

        {error && <InlineError>{error}</InlineError>}
      </form>
    </Modal>
  );
}