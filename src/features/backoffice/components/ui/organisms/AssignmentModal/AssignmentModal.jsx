import { useEffect, useId, useState } from "react";
import Modal from "../../../../../../shared/components/ui/molecules/Modal/Modal";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button";
import TextArea from "../../../../../../shared/components/ui/atoms/TextArea/TextArea";
import FormField from "../../../../../../shared/components/ui/molecules/FormField/FormField";
import InlineError from "../../../../../../shared/components/ui/atoms/InlineError/InlineError";
import { listOperators } from "../../../../services/incidentApi";
import "./AssignmentModal.scss";

export default function AssignmentModal({
  isOpen,
  onClose,
  incidentCode,
  lodgingName,
  isReassign = false,
  onAssign,
  submitting = false,
  error = null,
}) {
  const [operators, setOperators] = useState([]);
  const [operatorId, setOperatorId] = useState("");
  const [reason, setReason] = useState("");
  const formId = useId();
  const operatorFieldId = useId();
  const reasonId = useId();

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    listOperators()
      .then((data) => {
        if (active) setOperators(data);
      })
      .catch(() => {
        if (active) setOperators([]);
      });
    return () => {
      active = false;
    };
  }, [isOpen]);

  const reasonOk = !isReassign || reason.trim().length > 0;
  const canSubmit = operatorId !== "" && reasonOk && !submitting;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    onAssign?.({ operatorId, reason: reason.trim() });
  }

  function handleClose() {
    setOperatorId("");
    setReason("");
    onClose?.();
  }

  const subtitle = [incidentCode, lodgingName].filter(Boolean).join(" . ");
  const title = isReassign ? "Reasignar operario" : "Asignar Operario";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      subtitle={subtitle}
      footer={
        <div className="assignment-modal__actions">
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={!canSubmit}
          >
            {submitting ? "Guardando..." : title}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        className="assignment-modal__form"
        onSubmit={handleSubmit}
      >
        <FormField id={operatorFieldId} label="Operario">
          <select
            id={operatorFieldId}
            className="text-field"
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
          >
            <option value="">Selecciona un operario</option>
            {operators.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name}
              </option>
            ))}
          </select>
        </FormField>

        {isReassign && (
          <FormField id={reasonId} label="Motivo de reasignación">
            <TextArea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeHolder="Explica por qué se reasigna la incidencia"
            />
          </FormField>
        )}

        {error && <InlineError>{error}</InlineError>}
      </form>
    </Modal>
  );
}