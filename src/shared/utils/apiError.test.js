import { describe, it, expect } from "vitest";
import { isNetworkError, getErrorMessage } from "./apiError.js";

describe("apiError", () => {
  describe("isNetworkError", () => {
    it("returns true when the error has no response (no connection, timeout, CORS)", () => {
      expect(isNetworkError({})).toBe(true);
    });

    it("returns false when the server responded, even with an error", () => {
      expect(isNetworkError({ response: { status: 500 } })).toBe(false);
      expect(isNetworkError({ response: { status: 409 } })).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("returns the connectivity message when it is a network error", () => {
      expect(getErrorMessage({}, "fallback")).toBe(
        "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
      );
    });

    it("returns the server's message when there is one", () => {
      const error = {
        response: { data: { message: "Ese email ya está registrado" } },
      };
      expect(getErrorMessage(error, "fallback")).toBe(
        "Ese email ya está registrado",
      );
    });

    it("returns the fallback when the server responds without a message", () => {
      const error = { response: { status: 500, data: {} } };
      expect(getErrorMessage(error, "fallback")).toBe("fallback");
    });
  });
});
