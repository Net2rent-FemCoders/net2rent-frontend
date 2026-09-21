import { createPortal } from "react-dom";
import { TriangleAlert } from "lucide-react";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button.jsx";
import "./ConfirmToast.scss";

export default function ConfirmToast({
  isOpen,
  message,
  confirmLabel = "Sí, estoy seguro",
  cancelLabel = "No, cancelar",
  onConfirm,
  onCancel,
  busy = false,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="confirm-toast"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
    >
      <div className="confirm-toast__body">
        <TriangleAlert
          size={20}
          className="confirm-toast__icon"
          aria-hidden="true"
        />
        <p className="confirm-toast__message">{message}</p>
      </div>
      <div className="confirm-toast__actions">
        <Button
          variant="primary"
          className="confirm-toast__confirm confirm-toast__confirm--danger"
          onClick={onConfirm}
          disabled={busy}
        >
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
      </div>
    </div>,
    document.body,
  );
}