import { useCallback, useEffect, useState } from "react";
import {
  getIncidentTimeEntries,
  addIncidentTimeEntry,
  updateIncidentTimeEntry,
  deleteIncidentTimeEntry,
} from "../services/incidentApi.js";

export function useIncidentTimeEntries(incidentId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [pendingIds, setPendingIds] = useState(() => new Set()); // filas ocupadas (edit/delete)

  useEffect(() => {
    if (incidentId == null) return;
    let active = true;
    setLoading(true);
    setError(null);
    getIncidentTimeEntries(incidentId)
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [incidentId]);

  const markPending = useCallback((entryId, isPending) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(entryId);
      else next.delete(entryId);
      return next;
    });
  }, []);

  const addEntry = useCallback(
    async (concept, minutes) => {
      setAdding(true);
      try {
        const list = await addIncidentTimeEntry(incidentId, {
          concept,
          minutes,
        });
        setEntries(list);
      } finally {
        setAdding(false);
      }
    },
    [incidentId],
  );

  const updateEntry = useCallback(
    async (entryId, { concept, minutes }) => {
      markPending(entryId, true);
      try {
        const list = await updateIncidentTimeEntry(incidentId, entryId, {
          concept,
          minutes,
        });
        setEntries(list);
      } finally {
        markPending(entryId, false);
      }
    },
    [incidentId, markPending],
  );

  const removeEntry = useCallback(
    async (entryId) => {
      markPending(entryId, true);
      try {
        const list = await deleteIncidentTimeEntry(incidentId, entryId);
        setEntries(list);
      } finally {
        markPending(entryId, false);
      }
    },
    [incidentId, markPending],
  );

  return {
    entries,
    loading,
    error,
    adding,
    pendingIds,
    addEntry,
    updateEntry,
    removeEntry,
  };
}