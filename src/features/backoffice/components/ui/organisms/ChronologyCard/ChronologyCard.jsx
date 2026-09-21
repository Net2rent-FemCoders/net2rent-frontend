import { useId, useState } from "react";
import { ClockArrowRight, Send } from "lucide-react";
import { formatDate } from "../../../../../../shared/utils/formatDate.js";
import { toStatusModifier } from "../../../../../../shared/constants/incidentStatus.js";
import Input from "../../../../../../shared/components/ui/atoms/Input/Input.jsx";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button.jsx";
import "./ChronologyCard.scss";

export default function ChronologyCard({
  entries = [],
  onAddComment,
  loading = false,
  error = null,
  submitting = false,
  canComment = true,
  title = "Cronología",
  className = "",
}) {
  const [draft, setDraft] = useState("");
  const [formError, setFormError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || submitting) return;

    setFormError(null);
    try {
      await onAddComment(text);
      setDraft("");
    } catch {
      setFormError("No se pudo publicar el comentario. Inténtalo de nuevo.");
    }
  }

  const classes = ["chronology", className].filter(Boolean).join(" ");
  const titleId = useId();

  return (
    <section className={classes} aria-labelledby={titleId}>
      <h2 className="chronology__title" id={titleId}>
        <ClockArrowRight size={18} aria-hidden="true" />
        <span>{title}</span>
      </h2>

      {loading ? (
        <p className="chronology__empty" role="status">
          Cargando cronología…
        </p>
      ) : error ? (
        <p className="chronology__empty" role="alert">
          No se pudo cargar la cronología.
        </p>
      ) : entries.length === 0 ? (
        <p className="chronology__empty">
          Aún no hay actividad ni comentarios.
        </p>
      ) : (
        <ol className="chronology__list">
          {entries.map((entry) => {
            const statusMod = entry.status
              ? toStatusModifier(entry.status)
              : null;
            const dotClasses = [
              "chronology__dot",
              statusMod && `chronology__dot--${statusMod}`,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li key={entry.id} className="chronology__item">
                <span className={dotClasses} aria-hidden="true" />
                <div className="chronology__body">
                  <p className="chronology__head">
                    <span className="chronology__event">{entry.title}</span>
                    <time className="chronology__meta" dateTime={entry.at}>
                      {entry.atLabel ?? formatDate(entry.at)}
                      {entry.author ? ` · ${entry.author}` : ""}
                    </time>
                  </p>
                  {entry.description && (
                    <p className="chronology__text">{entry.description}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {canComment ? (
        <form className="chronology__add" onSubmit={handleSubmit}>
          <Input
            className="chronology__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Añadir un comentario interno"
            aria-label="Nuevo comentario interno"
            disabled={submitting}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!draft.trim() || submitting}
          >
            <Send size={16} aria-hidden="true" />
            {submitting ? "Enviando…" : "Enviar"}
          </Button>
        </form>
      ) : (
        <p className="chronology__closed" role="note">
          No se pueden añadir comentarios en este estado.
        </p>
      )}

      {formError && (
        <p className="chronology__error" role="alert">
          {formError}
        </p>
      )}
    </section>
  );
}