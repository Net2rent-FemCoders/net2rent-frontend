import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PauseModal from "./PauseModal.jsx";

function renderModal(props = {}) {
  const onPause = vi.fn();
  const onClose = vi.fn();
  const utils = render(
    <PauseModal
      isOpen
      onClose={onClose}
      onPause={onPause}
      incidentCode="INC-2026-000001"
      lodgingName="Piso Centro"
      {...props}
    />,
  );
  return { ...utils, onPause, onClose };
}

describe("PauseModal", () => {
  it("disables the submit button until a reason is filled", () => {
    renderModal();
    const submit = screen.getByRole("button", { name: "Confirmar pausa" });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Motivo de la pausa"), {
      target: { value: "Falta material" },
    });
    expect(submit).toBeEnabled();
  });

  it("submits the trimmed reason", () => {
    const { onPause } = renderModal();

    fireEvent.change(screen.getByLabelText("Motivo de la pausa"), {
      target: { value: "  Falta material  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar pausa" }));

    expect(onPause).toHaveBeenCalledWith("Falta material");
  });

  it("disables the submit button and shows the loading label while submitting", () => {
    renderModal({ submitting: true });
    expect(screen.getByRole("button", { name: "Pausando..." })).toBeDisabled();
  });

  it("shows the backend error message", () => {
    renderModal({
      error: "No puedes editar una incidencia que no tienes asignada",
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No puedes editar una incidencia que no tienes asignada",
    );
  });

  it("resets the reason when reopened after a previous fill", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <PauseModal isOpen onClose={onClose} onPause={vi.fn()} />,
    );

    fireEvent.change(screen.getByLabelText("Motivo de la pausa"), {
      target: { value: "Falta material" },
    });

    rerender(<PauseModal isOpen={false} onClose={onClose} onPause={vi.fn()} />);
    rerender(<PauseModal isOpen onClose={onClose} onPause={vi.fn()} />);

    expect(screen.getByLabelText("Motivo de la pausa").value).toBe("");
  });
});