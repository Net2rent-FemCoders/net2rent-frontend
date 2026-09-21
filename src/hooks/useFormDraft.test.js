import { describe, it, expect, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFormDraft } from "./useFormDraft.js";

describe("useFormDraft", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("starts with initialValues when nothing is stored", () => {
    const { result } = renderHook(() =>
      useFormDraft("draft:test", { name: "" }),
    );
    expect(result.current[0]).toEqual({ name: "" });
  });

  it("starts with what's stored in sessionStorage, if present", () => {
    sessionStorage.setItem("draft:test", JSON.stringify({ name: "Aïda" }));
    const { result } = renderHook(() =>
      useFormDraft("draft:test", { name: "" }),
    );
    expect(result.current[0]).toEqual({ name: "Aïda" });
  });

  it("persists to sessionStorage when the value is updated", () => {
    const { result } = renderHook(() =>
      useFormDraft("draft:test", { name: "" }),
    );
    act(() => {
      result.current[1]({ name: "Pau" });
    });
    expect(sessionStorage.getItem("draft:test")).toBe(
      JSON.stringify({ name: "Pau" }),
    );
  });

  it("clearDraft removes sessionStorage and resets to initialValues", () => {
    const { result } = renderHook(() =>
      useFormDraft("draft:test", { name: "" }),
    );
    act(() => {
      result.current[1]({ name: "Pau" });
    });
    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toEqual({ name: "" });
    expect(sessionStorage.getItem("draft:test")).toBeNull();
  });

  it("falls back to initialValues when the stored JSON is corrupted", () => {
    sessionStorage.setItem("draft:test", "{not valid json");
    const { result } = renderHook(() =>
      useFormDraft("draft:test", { name: "" }),
    );
    expect(result.current[0]).toEqual({ name: "" });
  });
});
