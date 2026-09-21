import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ResolutionModal from "./ResolutionModal.jsx";

function renderModal(props = {}) {
  const onResolve = vi.fn();
  const onClose = vi.fn();
  const utils = render(
    <ResolutionModal
      isOpen
      onClose={onClose}
      onResolve={onResolve}
      incidentCode="INC-2026-000001"
      lodgingName="Piso Centro"
      imputedMinutes={45}
      {...props}
    />,
  );
  return { ...utils, onResolve, onClose };
}

describe("ResolutionModal", () => {
  it("muestra los minutos imputados como solo lectura", () => {
    renderModal({ imputedMinutes: 65 });
    const field = screen.getByLabelText("Minutos invertidos");
    expect(field).toHaveValue("65 min");
    expect(field).toHaveAttribute("readonly");
  });

  it("deshabilita el botón hasta que hay nota (con tiempo imputado)", () => {
    renderModal({ imputedMinutes: 45 });
    const submit = screen.getByRole("button", { name: "Marcar como resuelta" });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Nota de resolución"), {
      target: { value: "Cambiado el filtro" },
    });
    expect(submit).toBeEnabled();
  });

  it("mantiene el botón deshabilitado si no hay tiempo imputado", () => {
    renderModal({ imputedMinutes: 0 });
    fireEvent.change(screen.getByLabelText("Nota de resolución"), {
      target: { value: "Cambiado el filtro" },
    });
    expect(
      screen.getByRole("button", { name: "Marcar como resuelta" }),
    ).toBeDisabled();
  });

  it("envía el total imputado y la nota recortada", () => {
    const { onResolve } = renderModal({ imputedMinutes: 45 });

    fireEvent.change(screen.getByLabelText("Nota de resolución"), {
      target: { value: "  Cambiado el filtro  " },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Marcar como resuelta" }),
    );

    expect(onResolve).toHaveBeenCalledWith({
      minutes: 45,
      note: "Cambiado el filtro",
    });
  });

  it("deshabilita y muestra 'Guardando...' mientras envía", () => {
    renderModal({ submitting: true });
    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
  });

  it("muestra el mensaje de error del backend", () => {
    renderModal({ error: "Quedan 2 tareas del checklist sin completar" });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Quedan 2 tareas del checklist sin completar",
    );
  });

  it("resetea la nota al reabrir y mantiene los minutos de la prop", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <ResolutionModal
        isOpen
        onClose={onClose}
        onResolve={vi.fn()}
        imputedMinutes={45}
      />,
    );

    fireEvent.change(screen.getByLabelText("Nota de resolución"), {
      target: { value: "Cambiado el filtro" },
    });

    rerender(
      <ResolutionModal
        isOpen={false}
        onClose={onClose}
        onResolve={vi.fn()}
        imputedMinutes={45}
      />,
    );
    rerender(
      <ResolutionModal
        isOpen
        onClose={onClose}
        onResolve={vi.fn()}
        imputedMinutes={45}
      />,
    );

    expect(screen.getByLabelText("Nota de resolución").value).toBe("");
    expect(screen.getByLabelText("Minutos invertidos")).toHaveValue("45 min");
  });
});