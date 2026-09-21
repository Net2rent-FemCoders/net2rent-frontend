import StatusBadge from "../../../../../../shared/components/ui/atoms/StatusBadge/StatusBadge.jsx";
import PriorityBadge from "../../atoms/PriorityBadge/PriorityBadge.jsx";
import Avatar from "../../../../../../shared/components/ui/atoms/Avatar/Avatar.jsx";
import PageButton from "../../atoms/PageButton/PageButton.jsx";
import EmptyMessage from "../../atoms/EmptyMessage/EmptyMessage.jsx";
import { INCIDENT_CATEGORY_LABEL } from "../../../../../../shared/constants/incidentCategory.js";
import "./TableIncident.scss";

export default function TableIncident({
  incidents = [],
  onRowClick,
  page = 1,
  totalPages = 1,
  totalResults = 0,
  onPrevPage,
  onNextPage,
  onGoToPage,
  emptyMessage,
  emptyAction,
  className = "",
}) {
  const classes = ["table-incident", className].filter(Boolean).join(" ");
  const PAGE_WINDOW_SIZE = 3;
  const windowStart =
    Math.floor((page - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const windowEnd = Math.min(windowStart + PAGE_WINDOW_SIZE - 1, totalPages);
  const visiblePages = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i,
  );

  if (incidents.length === 0) {
    return (
      <div className={classes}>
        <EmptyMessage message={emptyMessage} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className={classes}>
      {/* ── MOBILE: cards ── */}
      <div className="table-incident__cards">
        {incidents.map((inc) => (
          <div
            key={inc.code}
            className="table-incident__card"
            onClick={() => onRowClick?.(inc)}
          >
            <div className="table-incident__card-header">
              <a
                href="#"
                className="table-incident__td--link"
                onClick={(e) => {
                  e.preventDefault();
                  onRowClick?.(inc);
                }}
              >
                {inc.code}
              </a>
              <StatusBadge status={inc.status} />
              <PriorityBadge priority={inc.priority} />
            </div>

            <div className="table-incident__card-title">{inc.title}</div>

            <div className="table-incident__card-meta">
              <span className="table-incident__card-accommodation">
                {inc.accommodation}
              </span>
              <span className="table-incident__card-date">{inc.createdAt}</span>
            </div>

            <div className="table-incident__card-footer">
              <Avatar name={inc.assignee || ""} size="sm" />
              <span className="table-incident__card-assignee">
                {inc.assignee ?? "Sin asignar"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP: tabla ── */}
      <div className="table-incident__desktop">
        <div className="table-incident__scroll">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Incidencia</th>
                <th>Categoría</th>
                <th>Alojamiento</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Asignada a</th>
                <th className="table-incident__th--right">Creada</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.code} onClick={() => onRowClick?.(inc)}>
                  <td className="table-incident__td--code">
                    <a
                      href="#"
                      className="table-incident__td--link"
                      onClick={(e) => {
                        e.preventDefault();
                        onRowClick?.(inc);
                      }}
                    >
                      {inc.code}
                    </a>
                  </td>
                  <td className="table-incident__td--title">{inc.title}</td>
                  <td className="table-incident__td--muted">
                    {INCIDENT_CATEGORY_LABEL[inc.category] ?? "Sin categorizar"}
                  </td>
                  <td className="table-incident__td--muted">
                    {inc.accommodation}
                  </td>
                  <td>
                    <StatusBadge status={inc.status} />
                  </td>
                  <td>
                    <PriorityBadge priority={inc.priority} />
                  </td>
                  <td className="table-incident__td--muted">
                    {inc.assignee ?? "Sin asignar"}
                  </td>
                  <td className="table-incident__td--date">{inc.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
      <div className="table-incident__footer">
          <span className="table-incident__info">
            {incidents.length} de {totalResults} incidencias · página {page} de{" "}
            {totalPages}
          </span>
          <div className="table-incident__pagination">
            {totalPages > PAGE_WINDOW_SIZE && page > 1 && (
              <PageButton onClick={onPrevPage}>Anterior</PageButton>
            )}
            {visiblePages.map((p) => (
              <PageButton
                key={p}
                active={p === page}
                onClick={() => onGoToPage?.(p)}
              >
                {p}
              </PageButton>
            ))}
            {totalPages > PAGE_WINDOW_SIZE && page < totalPages && (
              <PageButton onClick={onNextPage}>Siguiente</PageButton>
            )}
          </div>
        </div>
    </div>
  );
}