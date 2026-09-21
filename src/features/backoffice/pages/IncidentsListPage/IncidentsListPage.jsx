import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, RefreshCw } from "lucide-react";
import { useIncidentList } from "../../hooks/useIncidentList.js";
import {
  listActiveLodgings,
  listOperators,
} from "../../services/incidentApi.js";
import SearchBar from "../../components/ui/molecules/SearchBar/SearchBar.jsx";
import StatusBadgeIncident from "../../components/ui/molecules/StatusBadgeIncident/StatusBadgeIncident.jsx";
import ToggleIncident from "../../components/ui/molecules/ToggleIncident/ToggleIncident.jsx";
import TableIncident from "../../components/ui/organisms/TableIncident/TableIncident.jsx";
import DropdownField from "../../../../shared/components/ui/atoms/DropdownField/DropdownField.jsx";
import Input from "../../../../shared/components/ui/atoms/Input/Input.jsx";
import Skeleton from "../../../../shared/components/ui/atoms/Skeleton/Skeleton.jsx";
import Button from "../../../../shared/components/ui/atoms/Button/Button.jsx";
import { useAuthStore } from "../../../auth/store/authStore.js";
import { ROLES } from "../../../../shared/constants/nav.js";
import { INCIDENT_SCOPE } from "../../../../shared/constants/incidentScope.js";
import {
  ALL_STATUS,
  STATUS_BADGE_FILTERS,
} from "../../../../shared/constants/statusBadgeIncident.js";
import {
  CATEGORY_FILTER_OPTIONS,
  PRIORITY_FILTER_OPTIONS,
} from "../../../../shared/constants/incidentFilterOptions.js";
import LoadErrorNotice from "../../../../shared/components/ui/molecules/LoadErrorNotice/LoadErrorNotice.jsx";
import "./IncidentsListPage.scss";

const HEADER_STATUSES = STATUS_BADGE_FILTERS.filter((s) => s !== ALL_STATUS);

const FILTER_KEYS = [
  "status",
  "priority",
  "category",
  "lodgingId",
  "assigneeId",
  "unassigned",
  "openedFrom",
  "openedTo",
];

const ADVANCED_FILTER_KEYS = [
  "priority",
  "category",
  "lodgingId",
  "assigneeId",
  "unassigned",
  "openedFrom",
  "openedTo",
];

const OPERATOR_UNASSIGNED = "UNASSIGNED";

export default function IncidentsListPage() {
  const navigate = useNavigate();
  const {
    filters,
    rows,
    counters,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    updateParams,
    goToPage,
    reload,
  } = useIncidentList();

  const role = useAuthStore((s) => s.user?.role);
  const isOperator = role === ROLES.OPERATOR;
  const scopeValue = filters.scope || INCIDENT_SCOPE.MINE;

  useEffect(() => {
    if (isOperator && !filters.scope) {
      updateParams({
        scope: INCIDENT_SCOPE.MINE,
        sort: "priority",
        dir: "desc",
      });
    }
  }, [isOperator, filters.scope, updateParams]);

  const [lodgings, setLodgings] = useState([]);
  const [operators, setOperators] = useState([]);
  useEffect(() => {
    let active = true;
    Promise.all([listActiveLodgings(), listOperators()])
      .then(([lods, ops]) => {
        if (active) {
          setLodgings(lods);
          setOperators(ops);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.code, r.title, r.accommodation]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const currentStatus = filters.status || ALL_STATUS;
  const totalCount = HEADER_STATUSES.reduce(
    (sum, s) => sum + (counters[s] ?? 0),
    0,
  );
  const onStatusClick = (status) =>
    updateParams({ status: status === ALL_STATUS ? null : status });

  const lodgingOptions = [
    { value: "ALL", label: "Todos los alojamientos" },
    ...lodgings.map((l) => ({
      value: String(l.id),
      label: `${l.ref} · ${l.name}`,
    })),
  ];
  const operatorOptions = [
    { value: "ALL", label: "Todos los operarios" },
    { value: OPERATOR_UNASSIGNED, label: "Sin asignar" },
    ...operators.map((o) => ({ value: String(o.id), label: o.name })),
  ];
  const operatorValue = filters.unassigned
    ? OPERATOR_UNASSIGNED
    : (filters.assigneeId ?? "ALL");
  const onOperatorChange = (e) => {
    const v = e.target.value;
    if (v === "ALL") updateParams({ assigneeId: null, unassigned: null });
    else if (v === OPERATOR_UNASSIGNED)
      updateParams({ unassigned: true, assigneeId: null });
    else updateParams({ assigneeId: v, unassigned: null });
  };

  const activeAdvancedCount = ADVANCED_FILTER_KEYS.filter(
    (k) => filters[k],
  ).length;

  const hasActiveFilters =
    FILTER_KEYS.some((k) => filters[k]) || search.trim() !== "";
  const clearFilters = () => {
    setSearch("");
    updateParams(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])));
  };

  return (
    <section className="incidents-page">
      <div className="incidents-page__header">
        <div className="incidents-page__headerbar">
          <h1 className="incidents-page__title">Incidencias</h1>

          {!isOperator && (
            <Button
              variant="primary"
              className="incidents-page__create"
              onClick={() => navigate("/backoffice/nueva-incidencia")}
            >
              <Plus size={16} aria-hidden="true" />
              Nueva incidencia
            </Button>
          )}
        </div>

        {isOperator && (
          <ToggleIncident
            className="incidents-page__scope"
            value={scopeValue}
            onChange={(next) => updateParams({ scope: next })}
          />
        )}

        <div
          className="incidents-page__counters"
          role="group"
          aria-label="Filtrar por estado"
        >
          <StatusBadgeIncident
            status={ALL_STATUS}
            count={totalCount}
            active={currentStatus === ALL_STATUS}
            onClick={() => onStatusClick(ALL_STATUS)}
          />
          {HEADER_STATUSES.map((s) => (
            <StatusBadgeIncident
              key={s}
              status={s}
              count={counters[s] ?? 0}
              active={currentStatus === s}
              onClick={() => onStatusClick(s)}
            />
          ))}
        </div>
      </div>

      <div className="incidents-page__toolbar">
        <SearchBar
          className="incidents-page__search"
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código, alojamiento o descripción"
        />

        <Button
          variant="secondary"
          className="incidents-page__filter-toggle"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="incidents-filters"
        >
          <Filter size={16} aria-hidden="true" />
          Filtros
          {activeAdvancedCount > 0 && (
            <span className="incidents-page__filter-badge" aria-hidden="true">
              {activeAdvancedCount}
            </span>
          )}
        </Button>

        <Button
          variant="secondary"
          className="incidents-page__reload"
          onClick={reload}
          disabled={loading}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Recargar
        </Button>
      </div>

      <div
        className="incidents-page__filters-card"
        id="incidents-filters"
        hidden={!filtersOpen}
      >
        <DropdownField
          className="incidents-page__filter"
          value={filters.category || "ALL"}
          onChange={(e) => updateParams({ category: e.target.value })}
          options={CATEGORY_FILTER_OPTIONS}
          aria-label="Filtrar por categoría"
        />
        <DropdownField
          className="incidents-page__filter"
          value={filters.priority || "ALL"}
          onChange={(e) => updateParams({ priority: e.target.value })}
          options={PRIORITY_FILTER_OPTIONS}
          aria-label="Filtrar por prioridad"
        />
        <DropdownField
          className="incidents-page__filter"
          value={filters.lodgingId ?? "ALL"}
          onChange={(e) => updateParams({ lodgingId: e.target.value })}
          options={lodgingOptions}
          aria-label="Filtrar por alojamiento"
        />
        {!isOperator && (
          <DropdownField
            className="incidents-page__filter"
            value={operatorValue}
            onChange={onOperatorChange}
            options={operatorOptions}
            aria-label="Filtrar por operario"
          />
        )}
        <DropdownField
          className="incidents-page__filter"
          value={`${filters.sort}:${filters.dir}`}
          onChange={(e) => {
            const [sort, dir] = e.target.value.split(":");
            updateParams({ sort, dir });
          }}
          options={[
            { value: "openedAt:desc", label: "Fecha (más reciente)" },
            { value: "openedAt:asc", label: "Fecha (más antigua)" },
            { value: "priority:desc", label: "Prioridad (mayor)" },
            { value: "priority:asc", label: "Prioridad (menor)" },
          ]}
          aria-label="Ordenar por"
        />
        <label className="incidents-page__filter incidents-page__daterange">
          <span className="incidents-page__daterange-label">Fecha inicio</span>
          <Input
            type="date"
            value={filters.openedFrom ?? ""}
            onChange={(e) =>
              updateParams({ openedFrom: e.target.value || null })
            }
          />
        </label>
        <label className="incidents-page__filter incidents-page__daterange">
          <span className="incidents-page__daterange-label">Fecha fin</span>
          <Input
            type="date"
            value={filters.openedTo ?? ""}
            onChange={(e) => updateParams({ openedTo: e.target.value || null })}
          />
        </label>
        {hasActiveFilters && (
          <Button variant="tertiary" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {error ? (
        <LoadErrorNotice
          message="No se pudieron cargar las incidencias."
          onRetry={reload}
        />
      ) : loading && rows.length === 0 ? (
        <div className="incidents-page__skeleton" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              width="100%"
              height={44}
              radius={8}
              className="incidents-page__skeleton-row"
            />
          ))}
        </div>
      ) : (
        <TableIncident
          incidents={visibleRows}
          onRowClick={(inc) => navigate(`/backoffice/incidencias/${inc.id}`)}
          page={page}
          totalPages={totalPages}
          totalResults={totalElements}
          onPrevPage={() => goToPage(page - 1)}
          onNextPage={() => goToPage(page + 1)}
          onGoToPage={goToPage}
          emptyMessage="No hay incidencias con esos filtros"
          emptyAction={
            hasActiveFilters && (
              <Button variant="secondary" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )
          }
        />
      )}
    </section>
  );
}