import { useState } from "react";
import {
    closeIncident,
    classifyIncident,
    correctIncidentText,
    rejectIncident,
    claimIncident,
    startIncident,
    pauseIncident,
    resumeIncident,
    resolveIncident,
    assignOperator,
} from "../services/incidentApi";
import { withMinDuration } from "../../../shared/utils/withMinDuration.js";

/**
 * @param {object}   params
 * @param {string}   params.id
 * @param {object}   params.incident
 * @param {Function} params.setIncident
 * @param {Function} params.reloadTimeline
 * @param {Function} params.loadIncident
 */
export function useIncidentActions({
                                       id,
                                       incident,
                                       setIncident,
                                       reloadTimeline,
                                       loadIncident,
                                   }) {
    const [busy, setBusy] = useState(null);

    const [errors, setErrors] = useState({});

    const [saved, setSaved] = useState(false);

    const setError = (key, message) =>
        setErrors((prev) => ({ ...prev, [key]: message }));

    const clearError = (key) => setError(key, null);

    /**
     * runAction: the shared try/catch/finally pattern
     *
     * @param {string}   key       action identifier ('reject', 'pause'...)
     * @param {Function} apiCall   function that returns the API promise
     * @param {object}   options
     * @param {string}   options.fallback         message shown if the API doesn't return one
     * @param {boolean}  options.minDuration      wrap with withMinDuration (minimum spinner time)
     * @param {boolean}  options.refreshTimeline  reload the timeline when done (default true)
     * @param {boolean}  options.tracksSaved      this action manages the "saved" flag (classify/edit)
     * @param {Function} options.onSuccess        extra effect on success (e.g. close the modal)
     * @param {Function} options.onError          extra effect on error (e.g. close modal, retry)
     */
    async function runAction(key, apiCall, options = {}) {
        const {
            fallback,
            minDuration = false,
            refreshTimeline = true,
            tracksSaved = false,
            onSuccess,
            onError,
        } = options;

        setBusy(key);
        clearError(key);
        if (tracksSaved) setSaved(false);

        try {
            const promise = apiCall();
            const updated = await (minDuration ? withMinDuration(promise) : promise);

            setIncident(updated);
            if (refreshTimeline) await reloadTimeline();
            if (tracksSaved) setSaved(true);

            onSuccess?.(updated);
        } catch (err) {
            setError(key, err.response?.data?.message ?? fallback);
            onError?.(err);
        } finally {
            setBusy(null);
        }
    }

    const classify = (values, opts = {}) =>
        runAction("save", () => classifyIncident(id, values), {
            fallback: "No se pudo guardar la clasificación. Inténtalo de nuevo.",
            refreshTimeline: false,
            tracksSaved: true,
            onSuccess: opts.onSuccess,
        });

    const edit = (values, opts = {}) =>
        runAction(
            "save",
            async () => {
                let updated = incident;

                if (values.title !== incident.title) {
                    updated = await correctIncidentText(id, {
                        title: values.title,
                        description: incident.description,
                    });
                }

                if (
                    values.category !== incident.category ||
                    values.priority !== incident.priority
                ) {
                    updated = await classifyIncident(id, {
                        category: values.category,
                        priority: values.priority,
                    });
                }

                return updated;
            },
            {
                fallback: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
                refreshTimeline: false,
                tracksSaved: true,
                onSuccess: opts.onSuccess,
            },
        );

    const reject = (reason, opts = {}) =>
        runAction("reject", () => rejectIncident(id, reason), {
            fallback: "No se pudo rechazar la incidencia. Inténtalo de nuevo",
            onSuccess: opts.onSuccess,
        });

    const close = (opts = {}) =>
        runAction("close", () => closeIncident(id), {
            fallback: "No se pudo cerrar la incidencia. Inténtalo de nuevo.",
            onSuccess: opts.onSuccess,
            onError: opts.onError,
        });

    const claim = () =>
        runAction("claim", () => claimIncident(id), {
            fallback: "No se pudo asignar la incidencia. Inténtalo de nuevo.",
            onError: (err) => {
                if (err.response?.status === 409) loadIncident();
            },
        });

    const start = () =>
        runAction("execute", () => startIncident(id), {
            fallback: "No se pudo comenzar la incidencia. Inténtalo de nuevo.",
            minDuration: true,
        });

    const resume = () =>
        runAction("execute", () => resumeIncident(id), {
            fallback: "No se pudo reanudar la incidencia. Inténtalo de nuevo.",
            minDuration: true,
        });

    const pause = (reason, opts = {}) =>
        runAction("pause", () => pauseIncident(id, reason), {
            fallback: "No se pudo pausar la incidencia. Inténtalo de nuevo.",
            onSuccess: opts.onSuccess,
        });

    const resolve = ({ minutes, note }, opts = {}) =>
        runAction("resolve", () => resolveIncident(id, { minutes, note }), {
            fallback: "No se pudo resolver la incidencia. Inténtalo de nuevo.",
            onSuccess: opts.onSuccess,
        });

    const assign = ({ operatorId, reason }, opts = {}) =>
        runAction("assign", () => assignOperator(id, { operatorId, reason }), {
            fallback: "No se pudo asignar el operario. Inténtalo de nuevo",
            onSuccess: opts.onSuccess,
        });

    return {
        classify,
        edit,
        reject,
        close,
        claim,
        start,
        resume,
        pause,
        resolve,
        assign,

        saving: busy === "save",
        rejecting: busy === "reject",
        claiming: busy === "claim",
        executing: busy === "execute",
        pausing: busy === "pause",
        resolving: busy === "resolve",
        assigning: busy === "assign",

        saveError: errors.save ?? null,
        rejectError: errors.reject ?? null,
        claimError: errors.claim ?? null,
        executeError: errors.execute ?? null,
        pauseError: errors.pause ?? null,
        resolveError: errors.resolve ?? null,
        assignError: errors.assign ?? null,
        closeError: errors.close ?? null,

        saved,
        setSaved,

        clearError,
    };
}