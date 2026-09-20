import { useCallback, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus.js";
import { isNetworkError, getErrorMessage } from "../shared/utils/apiError.js";

export function useNetworkAwareSubmit(
  submitFn,
  { fallbackMessage, onSuccess, onError } = {},
) {
  const isOnline = useOnlineStatus();
  const [error, setError] = useState(null);
  const [frozen, setFrozen] = useState(false);

  const submit = useCallback(
    async (values) => {
      setError(null);
      try {
        const result = await submitFn(values);
        setFrozen(false);
        onSuccess?.(result);
        return { ok: true, data: result };
      } catch (err) {
        setError(getErrorMessage(err, fallbackMessage));
        setFrozen(isNetworkError(err));
        onError?.(err);
        return { ok: false, error: err };
      }
    },
    [submitFn, fallbackMessage, onSuccess, onError],
  );

  return { submit, frozen: frozen || !isOnline, error };
}
