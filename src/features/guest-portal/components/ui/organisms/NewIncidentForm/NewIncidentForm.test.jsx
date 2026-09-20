import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewIncidentForm from "./NewIncidentForm.jsx";

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Nombre"), {
    target: { value: "Marta" },
  });
  fireEvent.change(screen.getByLabelText("Apellido"), {
    target: { value: "Ruiz" },
  });
  fireEvent.change(screen.getByLabelText("Descripción del problema"), {
    target: { value: "La cerradura no abre desde ayer por la noche." },
  });
}

describe("NewIncidentForm", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("freezes the fields and shows a connectivity message on a network error", async () => {
    const onSubmit = vi.fn().mockRejectedValue({});
    render(<NewIncidentForm onSubmit={onSubmit} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Enviar incidencia" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(
      await screen.findByText(
        "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeDisabled();
  });

  it("does not freeze the form and maps field errors on a business error", async () => {
    const onSubmit = vi.fn().mockRejectedValue({
      response: {
        data: {
          errors: [
            {
              field: "firstName",
              message: "Ya existe una incidencia con estos datos",
            },
          ],
        },
      },
    });
    render(<NewIncidentForm onSubmit={onSubmit} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Enviar incidencia" }));

    expect(
      await screen.findByText("Ya existe una incidencia con estos datos"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "No se pudo enviar la incidencia. Inténtalo de nuevo.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).not.toBeDisabled();
  });

  it("persists field values to sessionStorage as the user types", () => {
    render(<NewIncidentForm onSubmit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Marta" },
    });

    const draft = JSON.parse(sessionStorage.getItem("guestIncidentDraft"));
    expect(draft.firstName).toBe("Marta");
  });

  it("restores a saved draft when the form mounts", () => {
    sessionStorage.setItem(
      "guestIncidentDraft",
      JSON.stringify({
        firstName: "Marta",
        lastName: "",
        contact: "",
        description: "",
        category: "",
      }),
    );

    render(<NewIncidentForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Nombre")).toHaveValue("Marta");
  });

  it("clears the draft after a successful submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ code: "INC-1" });
    render(<NewIncidentForm onSubmit={onSubmit} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Enviar incidencia" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    await waitFor(() =>
      expect(sessionStorage.getItem("guestIncidentDraft")).toBeNull(),
    );
  });
});
