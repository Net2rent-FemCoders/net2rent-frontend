import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import IncidentPrimaryAction from "./IncidentPrimaryAction.jsx";
import { INCIDENT_STATUS } from "../../../../../../shared/constants/incidentStatus.js";

describe("IncidentPrimaryAction", () => {
  it("shows Comenzar for ASSIGNED and calls onStart", () => {
    const onStart = vi.fn();
    render(
      <IncidentPrimaryAction
        status={INCIDENT_STATUS.ASSIGNED}
        onStart={onStart}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Comenzar" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("shows Resolver for IN_PROGRESS and calls onResolve", () => {
    const onResolve = vi.fn();
    render(
      <IncidentPrimaryAction
        status={INCIDENT_STATUS.IN_PROGRESS}
        onResolve={onResolve}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Resolver" }));
    expect(onResolve).toHaveBeenCalledTimes(1);
  });

  it("shows Reanudar for PAUSED and calls onResume", () => {
    const onResume = vi.fn();
    render(
      <IncidentPrimaryAction
        status={INCIDENT_STATUS.PAUSED}
        onResume={onResume}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reanudar" }));
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it("shows the loading label and disables the button while loading", () => {
    render(
      <IncidentPrimaryAction
        status={INCIDENT_STATUS.ASSIGNED}
        loading
        onStart={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Comenzando..." }),
    ).toBeDisabled();
  });

  it("renders nothing for a status without a primary action", () => {
    const { container } = render(
      <IncidentPrimaryAction status={INCIDENT_STATUS.RESOLVED} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});