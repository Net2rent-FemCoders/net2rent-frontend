import { useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X, ListTodo } from "lucide-react";
import Input from "../../../../../../shared/components/ui/atoms/Input/Input";
import Button from "../../../../../../shared/components/ui/atoms/Button/Button";
import "./ChecklistCard.scss";
import LoadErrorNotice from "../../../../../../shared/components/ui/molecules/LoadErrorNotice/LoadErrorNotice.jsx";

function extractErrorMessage(err, fallback) {
  return (
    err.response?.data?.errors?.[0]?.message ??
    err.response?.data?.message ??
    fallback
  );
}

function SortableItem({ index, item, disabled, pending, onToggle, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const itemClass = [
    "checklist__item",
    isDragging && "checklist__item--dragging",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li ref={setNodeRef} style={style} className={itemClass}>
      <span className="checklist__index" aria-hidden="true">
        {index + 1}
      </span>

      <label className="checklist__check">
        <input
          type="checkbox"
          checked={item.done}
          disabled={disabled || pending}
          onChange={() => onToggle(item)}
        />
        <span
          className={
            "checklist__text" + (item.done ? " checklist__text--done" : "")
          }
        >
          {item.text}
        </span>
      </label>

      <div className="checklist__controls">
        <button
          type="button"
          className="checklist__handle"
          disabled={disabled || pending}
          aria-label={`Mover "${item.text}"`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="checklist__remove"
          onClick={() => onRemove(item)}
          disabled={disabled || pending}
          aria-label={`Eliminar "${item.text}"`}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export default function ChecklistCard({
  items = [],
  loading = false,
  error = null,
  adding = false,
  pendingIds = new Set(),
  disabled = false,
  onAdd,
  onToggle,
  onRemove,
  onReorder,
  title = "Checklist de trabajo",
  className = "",
}) {
  const [draft, setDraft] = useState("");
  const [formError, setFormError] = useState(null);

  const inputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleAdd(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || adding) return;

    setFormError(null);
    try {
      await onAdd(text);
      setDraft("");
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (err) {
      setFormError(
        extractErrorMessage(
          err,
          "No se pudo añadir la tarea. Inténtalo de nuevo.",
        ),
      );
    }
  }

  async function handleToggle(item) {
    if (disabled || pendingIds.has(item.id)) return;
    try {
      await onToggle(item.id, !item.done);
    } catch (err) {
      setFormError(
        extractErrorMessage(err, "No se pudo cambiar el estado de la tarea."),
      );
    }
  }

  async function handleRemove(item) {
    if (disabled || pendingIds.has(item.id)) return;
    try {
      await onRemove(item.id);
    } catch (err) {
      setFormError(
        extractErrorMessage(
          err,
          "No se pudo eliminar la tarea. Inténtalo de nuevo.",
        ),
      );
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = items.findIndex((i) => i.id === active.id);
    const toIndex = items.findIndex((i) => i.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;

    setFormError(null);
    try {
      await onReorder(fromIndex, toIndex);
    } catch (err) {
      setFormError(extractErrorMessage(err, "No se pudo reordenar la tarea."));
    }
  }

  const total = items.length;
  const done = items.filter((t) => t.done).length;
  const percent = total ? (done / total) * 100 : 0;

  const classes = ["checklist", className].filter(Boolean).join(" ");

  const canReorder = typeof onReorder === "function" && !disabled;

  const labelOf = (id) => {
    const item = items.find((i) => i.id === id);
    return item ? `la tarea "${item.text}"` : "la tarea";
  };

  const announcements = {
    onDragStart({ active }) {
      return `Arrastrando ${labelOf(active.id)} de la posición ${items.findIndex((i) => i.id === active.id) + 1}.`;
    },
    onDragOver({ active, over }) {
      if (over && active.id !== over.id) {
        return `${labelOf(active.id)} movida a la posición ${items.findIndex((i) => i.id === over.id) + 1}.`;
      }
      return undefined;
    },
    onDragEnd({ active, over }) {
      if (over && active.id === over.id)
        return `${labelOf(active.id)} soltada en su posición.`;
      return `${labelOf(active.id)} reordenada.`;
    },
    onDragCancel({ active }) {
      return `${labelOf(active.id)} no se ha movido.`;
    },
  };

  return (
    <section className={classes}>
      <header className="checklist__header">
        <h2 className="checklist__title">
          <ListTodo size={18} aria-hidden="true" />
          <span>{title}</span>
        </h2>
        {total > 0 && (
          <p className="checklist__progress" aria-live="polite">
            {done} de {total} {total === 1 ? "tarea" : "tareas"} completadas
          </p>
        )}
      </header>

      {total > 0 && (
        <div className="checklist__bar" aria-hidden="true">
          <div
            className="checklist__bar-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {loading ? (
        <p className="checklist__empty" role="status">
          Cargando checklist…
        </p>
      ) : error ? (
        <LoadErrorNotice message="No se pudo cargar la checklist." />
      ) : total === 0 ? (
        <p className="checklist__empty">
          Aún no hay tareas. Añade la primera abajo.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{ announcements }}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="checklist__list">
              {items.map((item, index) => (
                <SortableItem
                  key={item.id}
                  index={index}
                  item={item}
                  disabled={!canReorder}
                  pending={pendingIds.has(item.id)}
                  onToggle={handleToggle}
                  onRemove={handleRemove}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <form className="checklist__add" onSubmit={handleAdd}>
        <Input
          ref={inputRef}
          className="checklist__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Añadir tarea y pulsar Enter"
          aria-label="Nueva tarea"
          disabled={disabled || adding}
          maxLength={200}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || adding || !draft.trim()}
        >
          <Plus size={16} aria-hidden="true" />
          {adding ? "Añadiendo…" : "Agregar"}
        </Button>
      </form>

      {formError && (
        <p className="checklist__error" role="alert">
          {formError}
        </p>
      )}
    </section>
  );
}