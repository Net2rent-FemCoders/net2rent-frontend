import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PinInput from "./PinInput.jsx";

function renderPinInput(value = "") {
  const handleChange = vi.fn();
  render(<PinInput value={value} onChange={handleChange} />);
  return handleChange;
}

describe("PinInput", () => {
  it("renders 4 accessible boxes", () => {
    renderPinInput();
    expect(screen.getByLabelText("Dígito 1 de 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Dígito 4 de 4")).toBeInTheDocument();
  });

  it("advances focus to the next box after typing a digit", () => {
    const handleChange = renderPinInput();
    fireEvent.change(screen.getByLabelText("Dígito 1 de 4"), {
      target: { value: "5" },
    });

    expect(handleChange).toHaveBeenCalledWith("5");
    expect(screen.getByLabelText("Dígito 2 de 4")).toHaveFocus();
  });

  it("clears and moves focus back on Backspace over an empty box", () => {
    const handleChange = renderPinInput("12");
    const thirdBox = screen.getByLabelText("Dígito 3 de 4");
    thirdBox.focus();
    fireEvent.keyDown(thirdBox, { key: "Backspace" });

    expect(handleChange).toHaveBeenCalledWith("1");
    expect(screen.getByLabelText("Dígito 2 de 4")).toHaveFocus();
  });

  it("distributes a pasted code across all boxes", () => {
    const handleChange = renderPinInput();
    fireEvent.paste(screen.getByLabelText("Dígito 1 de 4"), {
      clipboardData: { getData: () => "1234" },
    });

    expect(handleChange).toHaveBeenCalledWith("1234");
  });

  it("strips non-digit characters when pasting", () => {
    const handleChange = renderPinInput();
    fireEvent.paste(screen.getByLabelText("Dígito 1 de 4"), {
      clipboardData: { getData: () => "12a4" },
    });

    expect(handleChange).toHaveBeenCalledWith("124");
  });
});