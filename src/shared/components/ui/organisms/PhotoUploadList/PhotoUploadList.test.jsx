import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PhotoUploadList from "./PhotoUploadList.jsx";

describe("PhotoUploadList", () => {
  it("disables every slot's file input when disabled is true", () => {
    render(<PhotoUploadList value={[]} onChange={vi.fn()} disabled />);

    expect(screen.getByLabelText(/Añadir una foto/)).toBeDisabled();
  });

  it("keeps the file input enabled by default", () => {
    render(<PhotoUploadList value={[]} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/Añadir una foto/)).not.toBeDisabled();
  });
});
