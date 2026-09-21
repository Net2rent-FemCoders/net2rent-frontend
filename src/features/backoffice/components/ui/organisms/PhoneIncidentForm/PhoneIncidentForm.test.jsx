import { describe, it, expect, vi, beforeEach } from "vitest";
import { INCIDENT_CATEGORY } from "../../../../../../shared/constants/incidentCategory.js";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PhoneIncidentForm from "./PhoneIncidentForm.jsx";

function renderPhoneIncidentForm(props = {}) {
  const handleSubmit = vi.fn();
  render(<PhoneIncidentForm onSubmit={handleSubmit} {...props} />);
  return handleSubmit;
}

describe("PhoneIncidentForm", () => {
  it("shows required field errors when submitting an empty form", async () => {
    const handleSubmit = renderPhoneIncidentForm();

    fireEvent.click(
      screen.getByRole("button", { name: "Registrar incidencia" }),
    );

    expect(
      await screen.findByText("Selecciona un alojamiento", {
        selector: '[role="alert"] *',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("El nombre es obligatorio", {
        selector: '[role="alert"] *',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("El apellido es obligatorio", {
        selector: '[role="alert"] *',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Selecciona una categoría", {
        selector: '[role="alert"] *',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("La descripción es obligatoria", {
        selector: '[role="alert"] *',
      }),
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("blocks submission when the opening date is in the future", async () => {
    const handleSubmit = renderPhoneIncidentForm();

    fireEvent.change(screen.getByLabelText(/^Hora de apertura/), {
      target: { value: "23:59" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Registrar incidencia" }),
    );

    expect(
      await screen.findByText("No se admiten fechas ni horas futuras.", {
        selector: '[role="alert"] *',
      }),
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("validates phone format when a contact is provided", async () => {
    const handleSubmit = renderPhoneIncidentForm();

    fireEvent.change(screen.getByLabelText(/Teléfono/), {
      target: { value: "600" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Registrar incidencia" }),
    );

    expect(
      await screen.findByText("Introduce un teléfono válido", {
        selector: '[role="alert"] *',
      }),
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("disables its fields when frozen is true", () => {
    renderPhoneIncidentForm({ frozen: true });

    expect(screen.getByLabelText(/^Hora de apertura/)).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Registrar incidencia" }),
    ).not.toBeDisabled();
  });

  describe("PhoneIncidentForm draft persistence", () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it("persists field values to sessionStorage as the user types", () => {
      renderPhoneIncidentForm();

      fireEvent.change(screen.getByPlaceholderText("Nombre del reportante"), {
        target: { value: "Marta" },
      });

      const draft = JSON.parse(sessionStorage.getItem("phoneIncidentDraft"));
      expect(draft.firstName).toBe("Marta");
    });

    it("clears the draft when discarding", () => {
      renderPhoneIncidentForm();

      fireEvent.change(screen.getByPlaceholderText("Nombre del reportante"), {
        target: { value: "Marta" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Descartar" }));

      expect(sessionStorage.getItem("phoneIncidentDraft")).toBeNull();
    });

    it("clears the draft after a successful submit", async () => {
      const onSubmit = vi.fn().mockResolvedValue(true);
      renderPhoneIncidentForm({
        onSubmit,
        lodgings: [{ id: "1", ref: "REF-01", name: "Piso Centro" }],
      });

      fireEvent.change(screen.getByLabelText(/Alojamiento \(activos\)/), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByPlaceholderText("Nombre del reportante"), {
        target: { value: "Marta" },
      });
      fireEvent.change(screen.getByPlaceholderText("Apellido"), {
        target: { value: "Ruiz" },
      });
      fireEvent.change(screen.getByLabelText(/Categoría/), {
        target: { value: Object.values(INCIDENT_CATEGORY)[0] },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Qué ocurre, desde cuándo, qué ha intentado el cliente",
        ),
        { target: { value: "La cerradura no abre desde ayer." } },
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Registrar incidencia" }),
      );

      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      await waitFor(() =>
        expect(sessionStorage.getItem("phoneIncidentDraft")).toBeNull(),
      );
    });
  });
});
