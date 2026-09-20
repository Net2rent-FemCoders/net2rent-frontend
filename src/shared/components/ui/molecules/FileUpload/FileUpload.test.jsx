import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FileUpload from "./FileUpload.jsx";

describe("FileUpload", () => {
  it("disables the file input when disabled is true", () => {
    render(<FileUpload id="photo-0" onChange={vi.fn()} disabled />);

    expect(screen.getByLabelText(/Añadir una foto/)).toBeDisabled();
  });

  it("does not disable the file input by default", () => {
    render(<FileUpload id="photo-0" onChange={vi.fn()} />);

    expect(screen.getByLabelText(/Añadir una foto/)).not.toBeDisabled();
  });

  it("disables the remove button when disabled is true and a file is set", () => {
    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    render(
      <FileUpload id="photo-0" value={file} onChange={vi.fn()} disabled />,
    );

    expect(screen.getByRole("button", { name: /quitar foto/i })).toBeDisabled();
  });
});
