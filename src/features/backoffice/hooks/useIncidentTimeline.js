import { useCallback, useEffect, useState } from 'react';
import { getIncidentTimeline, addIncidentComment } from '../services/incidentApi.js';
import { mapTimeline, mapTimelineItemToEntry } from '../services/timelineAdapter.js';

export function useIncidentTimeline(incidentId) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchTimeline = useCallback(async () => {
        const items = await getIncidentTimeline(incidentId);
        return mapTimeline(items);
    }, [incidentId]);

    useEffect(() => {
        if (incidentId == null) return;
        let active = true;
        setLoading(true);
        setError(null);
        fetchTimeline()
            .then((mapped) => { if (active) setEntries(mapped); })
            .catch((err) => { if (active) setError(err); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [incidentId, fetchTimeline]);

    const reload = useCallback(async () => {
        setError(null);
        try {
            setEntries(await fetchTimeline());
        } catch (err) {
            setError(err);
        }
    }, [fetchTimeline]);

    const addComment = useCallback(async (text) => {
        setSubmitting(true);
        try {
            const created = await addIncidentComment(incidentId, text);
            setEntries((prev) => [...prev, mapTimelineItemToEntry(created, prev.length)]);
        } finally {
            setSubmitting(false);
        }
    }, [incidentId]);

    return { entries, loading, error, submitting, addComment, reload };
}