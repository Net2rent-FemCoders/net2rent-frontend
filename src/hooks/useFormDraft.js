import { useState } from "react";

export function useFormDraft(key, initialValues) {
  const [values, setValues] = useState(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValues;
    } catch {
      return initialValues;
    }
  });

  function updateValues(next) {
    setValues(next);
    try {
      sessionStorage.setItem(key, JSON.stringify(next));
    } catch {
      // sessionStorage may be unavailable (private browsing) or full; the draft simply won't persist.
    }
  }

  function clearDraft() {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // sessionStorage may be unavailable; nothing to clean up in that case.
    }
    setValues(initialValues);
  }

  return [values, updateValues, clearDraft];
}
