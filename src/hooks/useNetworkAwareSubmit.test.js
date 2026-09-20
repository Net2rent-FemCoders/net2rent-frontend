import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useNetworkAwareSubmit } from "./useNetworkAwareSubmit.js";

describe("useNetworkAwareSubmit", () => {
  afterEach(() => {
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
  });

  it("returns the result and clears frozen/error on a successful submit", async () => {
    const submitFn = vi.fn().mockResolvedValue({ code: "INC-1" });
    const { result } = renderHook(() => useNetworkAwareSubmit(submitFn));

    let value;
    await act(async () => {
      value = await result.current.submit({ name: "Aïda" });
    });

    expect(value).toEqual({ ok: true, data: { code: "INC-1" } });
    expect(result.current.frozen).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets the connectivity message and freezes when the request has no response", async () => {
    const submitFn = vi.fn().mockRejectedValue({});
    const { result } = renderHook(() => useNetworkAwareSubmit(submitFn));

    let value;
    await act(async () => {
      value = await result.current.submit({ name: "Aïda" });
    });

    expect(value).toEqual({ ok: false, error: {} });
    expect(result.current.error).toBe(
      "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
    );
    expect(result.current.frozen).toBe(true);
  });

  it("sets the server's message but does not freeze on a business error", async () => {
    const err = { response: { data: { message: "Conflicto" } } };
    const submitFn = vi.fn().mockRejectedValue(err);
    const { result } = renderHook(() => useNetworkAwareSubmit(submitFn));

    let value;
    await act(async () => {
      value = await result.current.submit({ name: "Julia" });
    });

    expect(value).toEqual({ ok: false, error: err });
    expect(result.current.error).toBe("Conflicto");
    expect(result.current.frozen).toBe(false);
  });

    it("is frozen while offline, even without attempting a submit", () => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });
      const submitFn = vi.fn();
      const { result } = renderHook(() => useNetworkAwareSubmit(submitFn));

      expect(result.current.frozen).toBe(true);
      expect(submitFn).not.toHaveBeenCalled();
    });
});
