import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LodgingModal from "./LodgingModal.jsx";

function renderModal(props = {}) {
  const handleSubmit = vi.fn();
  const handleClose = vi.fn();
  render(
    <LodgingModal
      isOpen
      onClose={handleClose}
      onSubmit={handleSubmit}
      {...props}
    />,
  );
  return { handleSubmit, handleClose };
}

describe("LodgingModal", () => {
  it("shows required field errors when creating with an empty form", async () => {
    const { handleSubmit } = renderModal({ mode: "create" });

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(
      await screen.findByText("El nombre es obligatorio", {
        selector: '[role="alert"] *',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("La dirección es obligatoria", {
        selector: '[role="alert"] *',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("El PIN es obligatorio", {
        selector: '[role="alert"] *',
      }),
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("does not require a PIN when editing", async () => {
    const { handleSubmit } = renderModal({
      mode: "edit",
      defaultValues: {
        name: "Apto. Marina 3B",
        address: "Passeig Marítim 44",
        reference: "REF-0031",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
  });

  it("rejects a PIN that isn't exactly 4 digits", async () => {
    renderModal({ mode: "create" });

    fireEvent.change(screen.getByLabelText("Dígito 1 de 4"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(
      await screen.findByText("El código debe tener 4 dígitos", {
        selector: '[role="alert"] *',
      }),
    ).toBeInTheDocument();
  });
});