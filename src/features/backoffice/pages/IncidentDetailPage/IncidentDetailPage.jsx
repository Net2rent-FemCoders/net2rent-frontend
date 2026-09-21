import { useIncidentActions } from "../../hooks/useIncidentActions.js";
import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Pencil, XCircle, UserPlus, Pause, UserRound } from "lucide-react";
import { formatDate } from "../../../../shared/utils/formatDate";
import HeroIncidentCard from "../../components/ui/molecules/HeroIncidentCard/HeroIncidentCard";
import ClassificationCard from "../../components/ui/organisms/ClassificationCard/ClassificationCard";
import ChecklistCard from "../../components/ui/organisms/ChecklistCard/ChecklistCard";
import IncidentEditForm from "../../components/ui/organisms/IncidentEditForm/IncidentEditForm";
import Button from "../../../../shared/components/ui/atoms/Button/Button";
import Spinner from "../../../../shared/components/ui/atoms/Spinner/Spinner";
import DataList from "../../components/ui/molecules/DataList/DataList.jsx";
import { getIncidentById } from "../../services/incidentApi";
import ActionsMenu from "../../components/ui/molecules/ActionsMenu/ActionsMenu";
import RejectionModal from "../../components/ui/organisms/RejectionModal/RejectionModal";
import ConfirmationModal from "../../components/ui/organisms/ConfirmationModal/ConfirmationModal.jsx";
import PauseModal from "../../components/ui/organisms/PauseModal/PauseModal";
import ResolutionModal from "../../components/ui/organisms/ResolutionModal/ResolutionModal";
import NoticeBox from "../../../../shared/components/ui/molecules/NoticeBox/NoticeBox";
import { useIncidentChecklist } from "../../hooks/useIncidentChecklist";
import { useIncidentTimeline } from "../../hooks/useIncidentTimeline.js";
import { useAuthStore } from "../../../auth/store/authStore";
import { ROLES } from "../../../../shared/constants/nav";
import { INCIDENT_STATUS } from "../../../../shared/constants/incidentStatus";
import "./IncidentDetailPage.scss";
import ReporterCard from "../../components/ui/organisms/ReporterCard/ReporterCard";
import LodgingCard from "../../components/ui/organisms/LodgingCard/LodgingCard";
import IncidentImageGallery from "../../components/ui/organisms/IncidentImageGallery/IncidentImageGallery.jsx";
import IncidentPrimaryAction from "../../components/ui/molecules/IncidentPrimaryAction/IncidentPrimaryAction";
import NoticeBanner from "../../../../shared/components/ui/molecules/NoticeBanner/NoticeBanner";
import ChronologyCard from "../../components/ui/organisms/ChronologyCard/ChronologyCard.jsx";
import AssignmentModal from "../../components/ui/organisms/AssignmentModal/AssignmentModal.jsx";
import TimeAllocation from "../../components/ui/organisms/TimeAllocation/TimeAllocation.jsx";
import { useIncidentTimeEntries } from "../../hooks/useIncidentTimeEntries.js";

export default function IncidentDetailPage() {
  const { id } = useParams();
  const role = useAuthStore((s) => s.user?.role);
  const canTriage = role === ROLES.COORDINATOR || role === ROLES.ADMIN;
  const isOperator = role === ROLES.OPERATOR;

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [closedNotice, setClosedNotice] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const {
    items: checklistItems,
    loading: checklistLoading,
    error: checklistError,
    adding: checklistAdding,
    pendingIds: checklistPendingIds,
    addItem: addChecklistItem,
    toggleItem: toggleChecklistItem,
    removeItem: removeChecklistItem,
    reorderItem: reorderChecklistItem,
  } = useIncidentChecklist(id);

  const {
    entries: timelineEntries,
    loading: timelineLoading,
    error: timelineError,
    submitting: timelineSubmitting,
    addComment: addTimelineComment,
    reload: reloadTimeline,
  } = useIncidentTimeline(id);

  const {
    entries: timeEntries,
    loading: timeLoading,
    error: timeError,
    adding: timeAdding,
    pendingIds: timePendingIds,
    addEntry: addTimeEntry,
    updateEntry: updateTimeEntry,
    removeEntry: removeTimeEntry,
  } = useIncidentTimeEntries(id);

  const loadIncident = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getIncidentById(id);
      setIncident(data);
    } catch (err) {
      setLoadError(
        err.response?.status === 404
          ? "La incidencia no existe o no es de tu cuenta."
          : "No se pudo cargar la incidencia.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const actions = useIncidentActions({
    id,
    incident,
    setIncident,
    reloadTimeline,
    loadIncident,
  });

  useEffect(() => {
    loadIncident();
  }, [loadIncident]);

  useEffect(() => {
    if (!closedNotice) return;
    const t = setTimeout(() => setClosedNotice(false), 3000);
    return () => clearTimeout(t);
  }, [closedNotice]);

  if (loading) return <Spinner />;
  if (loadError) return <p role="alert">{loadError}</p>;
  if (!incident) return null;

  const imputedMinutes = timeEntries.reduce(
    (sum, e) => sum + Number(e.minutes || 0),
    0,
  );

  const canClaim =
    isOperator &&
    incident.assigneeName == null &&
    incident.status === INCIDENT_STATUS.NEW;

  const isUnclassified = incident.category == null;
  const isTerminal =
    incident.status === INCIDENT_STATUS.CLOSED ||
    incident.status === INCIDENT_STATUS.REJECTED;

  const isWorkLocked =
    isTerminal || incident.status === INCIDENT_STATUS.RESOLVED;

  const inProgress = incident.status === INCIDENT_STATUS.IN_PROGRESS;

  const workLocked = isOperator ? !inProgress : isWorkLocked;

  const operatorWorkHint = !isOperator
    ? null
    : incident.status === INCIDENT_STATUS.ASSIGNED
      ? "Comienza la incidencia para imputar tiempos, editar el checklist y añadir comentarios."
      : incident.status === INCIDENT_STATUS.PAUSED
        ? "Reanuda la incidencia para volver a registrar trabajo."
        : null;

  const canReject =
    canTriage &&
    [
      INCIDENT_STATUS.NEW,
      INCIDENT_STATUS.ASSIGNED,
      INCIDENT_STATUS.IN_PROGRESS,
      INCIDENT_STATUS.PAUSED,
    ].includes(incident.status);

  const canClose = canTriage && incident.status === INCIDENT_STATUS.RESOLVED;

  const canEdit = canTriage && !isUnclassified && !editing && !isTerminal;

  const isClassified = incident.category != null && incident.priority != null;
  const canAssign =
    canTriage &&
    isClassified &&
    [
      INCIDENT_STATUS.NEW,
      INCIDENT_STATUS.ASSIGNED,
      INCIDENT_STATUS.IN_PROGRESS,
      INCIDENT_STATUS.PAUSED,
    ].includes(incident.status);

  const secondaryActions = [];

  if (incident.status === INCIDENT_STATUS.IN_PROGRESS) {
    secondaryActions.push({
      id: "pause",
      label: "Pausar trabajo",
      icon: Pause,
      onSelect: () => {
        actions.clearError("pause");
        setPauseOpen(true);
      },
    });
  }

  if (canReject) {
    secondaryActions.push({
      id: "reject",
      label: "Rechazar incidencia",
      icon: XCircle,
      danger: true,
      onSelect: () => {
        actions.clearError("reject");
        setRejectOpen(true);
      },
    });
  }

  const assignButton = canAssign && (
    <Button
      variant={incident.assigneeName ? "secondary" : "primary"}
      onClick={() => {
        actions.clearError("assign");
        setAssignOpen(true);
      }}
    >
      <UserPlus size={16} aria-hidden="true" />
      {incident.assigneeName ? "Reasignar operario" : "Asignar operario"}
    </Button>
  );

  const heroActions = (
    <>
      {canClose && (
        <Button
          variant="primary"
          onClick={() => {
            actions.clearError("close");
            setCloseOpen(true);
          }}
        >
          Cerrar
        </Button>
      )}
      {canClaim && (
        <Button
          variant="primary"
          onClick={actions.claim}
          disabled={actions.claiming}
        >
          {actions.claiming ? "Asignando…" : "Asignármela"}
        </Button>
      )}
      <IncidentPrimaryAction
        status={incident.status}
        loading={actions.executing}
        onStart={actions.start}
        onResume={actions.resume}
        onResolve={() => {
          actions.clearError("resolve");
          setResolveOpen(true);
        }}
      />
      {!incident.assigneeName && assignButton}
      {canEdit && (
        <Button
          variant="secondary"
          aria-label="Editar incidencia"
          onClick={() => {
            actions.setSaved(false);
            actions.clearError("save");
            setEditing(true);
          }}
        >
          <Pencil size={18} aria-hidden="true" />
        </Button>
      )}
      {secondaryActions.length > 0 && <ActionsMenu items={secondaryActions} />}
      {incident.assigneeName && assignButton}{" "}
    </>
  );

  return (
    <section className="incident-detail">
      <Link to="/backoffice/incidencias" className="incident-detail__back">
        ← Volver al listado
      </Link>

      <HeroIncidentCard
        code={incident.code}
        title={incident.title}
        status={incident.status}
        priority={incident.priority}
        category={incident.category}
        assigneeName={incident.assigneeName}
        actions={heroActions}
      />

      {actions.claimError && (
        <NoticeBanner tone="error" onClose={() => actions.clearError("claim")}>
          {actions.claimError}
        </NoticeBanner>
      )}

      {actions.executeError && (
        <NoticeBanner
          tone="error"
          onClose={() => actions.clearError("execute")}
        >
          {actions.executeError}
        </NoticeBanner>
      )}

      {closedNotice && (
        <NoticeBanner tone="success" onClose={() => setClosedNotice(false)}>
          Incidencia cerrada.
        </NoticeBanner>
      )}

      {actions.closeError && (
        <NoticeBanner tone="error" onClose={() => actions.clearError("close")}>
          {actions.closeError}
        </NoticeBanner>
      )}

      {incident.status === INCIDENT_STATUS.REJECTED &&
        incident.rejectionReason && (
          <NoticeBox tone="warning">
            <strong>Motivo del rechazo:</strong> {incident.rejectionReason}
          </NoticeBox>
        )}

      {incident.status === INCIDENT_STATUS.PAUSED && incident.pauseReason && (
        <NoticeBox tone="warning">
          <strong>Motivo de la pausa:</strong> {incident.pauseReason}
        </NoticeBox>
      )}

      {operatorWorkHint && <NoticeBox tone="brand">{operatorWorkHint}</NoticeBox>}

      {(incident.status === INCIDENT_STATUS.RESOLVED ||
        incident.status === INCIDENT_STATUS.CLOSED) &&
        incident.resolutionNote && (
          <NoticeBox>
            <strong>Nota de resolución:</strong> {incident.resolutionNote}
            {incident.minutesSpent != null && ` (${incident.minutesSpent} min)`}
          </NoticeBox>
        )}

      {canTriage && isUnclassified && !isTerminal && (
        <ClassificationCard
          onSubmit={(v) =>
            actions.classify(v, { onSuccess: () => setEditing(false) })
          }
          primaryLabel={
            isUnclassified ? "Guardar clasificación" : "Guardar cambios"
          }
          saving={actions.saving}
          error={actions.saveError}
          saved={actions.saved}
        />
      )}

      {canTriage && !isUnclassified && editing && (
        <IncidentEditForm
          initialTitle={incident.title}
          initialCategory={incident.category}
          initialPriority={incident.priority}
          onSubmit={(v) =>
            actions.edit(v, { onSuccess: () => setEditing(false) })
          }
          onCancel={() => setEditing(false)}
          saving={actions.saving}
          error={actions.saveError}
          saved={actions.saved}
        />
      )}

      <ReporterCard
        message={incident.description}
        media={
          incident.images?.length > 0 ? (
            <IncidentImageGallery
              incidentId={incident.id}
              images={incident.images}
            />
          ) : null
        }
        aside={
          <div className="incident-detail__reporter">
            <h2 className="reporter-card__title">
              <UserRound size={18} aria-hidden="true" />
              <span>Reportante</span>
            </h2>
            <DataList
              items={[
                {
                  label: "Nombre",
                  value:
                    `${incident.guestFirstName ?? ""} ${incident.guestLastName ?? ""}`.trim(),
                },
                { label: "Contacto", value: incident.guestContact },
                { label: "Apertura", value: formatDate(incident.openedAt) },
              ].filter((item) => item.value)}
            />
          </div>
        }
      />

      <LodgingCard
        name={incident.lodgingName}
        address={incident.lodgingAddress}
        reference={incident.lodgingRef}
        accessNotes={incident.lodgingAccessNotes}
        mapEmbedUrl={
          incident.lodgingAddress
            ? `https://maps.google.com/maps?q=${encodeURIComponent(incident.lodgingAddress)}&output=embed`
            : undefined
        }
        mapsUrl={
          incident.lodgingAddress
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(incident.lodgingAddress)}`
            : undefined
        }
      />

      <ChecklistCard
        items={checklistItems}
        loading={checklistLoading}
        error={checklistError}
        adding={checklistAdding}
        pendingIds={checklistPendingIds}
        disabled={workLocked}
        onAdd={addChecklistItem}
        onToggle={toggleChecklistItem}
        onRemove={removeChecklistItem}
        onReorder={reorderChecklistItem}
      />

      <div className="incident-detail__two-col">
        <ChronologyCard
          entries={timelineEntries}
          onAddComment={addTimelineComment}
          loading={timelineLoading}
          error={timelineError}
          submitting={timelineSubmitting}
          canComment={!workLocked}
        />

        <TimeAllocation
          entries={timeEntries}
          loading={timeLoading}
          error={timeError}
          adding={timeAdding}
          pendingIds={timePendingIds}
          disabled={workLocked}
          onImpute={addTimeEntry}
          onUpdate={updateTimeEntry}
          onRemove={removeTimeEntry}
        />
      </div>

      <RejectionModal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        incidentCode={incident.code}
        lodgingName={incident.lodgingName}
        onReject={(reason) =>
          actions.reject(reason, { onSuccess: () => setRejectOpen(false) })
        }
        submitting={actions.rejecting}
        error={actions.rejectError}
      />

      <PauseModal
        isOpen={pauseOpen}
        onClose={() => setPauseOpen(false)}
        incidentCode={incident.code}
        lodgingName={incident.lodgingName}
        onPause={(reason) =>
          actions.pause(reason, { onSuccess: () => setPauseOpen(false) })
        }
        submitting={actions.pausing}
        error={actions.pauseError}
      />

      <ResolutionModal
        isOpen={resolveOpen}
        onClose={() => setResolveOpen(false)}
        incidentCode={incident.code}
        lodgingName={incident.lodgingName}
        onResolve={(v) =>
          actions.resolve(v, { onSuccess: () => setResolveOpen(false) })
        }
        submitting={actions.resolving}
        error={actions.resolveError}
        imputedMinutes={imputedMinutes}
      />

      <AssignmentModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        incidentCode={incident.code}
        lodgingName={incident.lodgingName}
        isReassign={Boolean(incident.assigneeName)}
        onAssign={(v) =>
          actions.assign(v, { onSuccess: () => setAssignOpen(false) })
        }
        submitting={actions.assigning}
        error={actions.assignError}
        actions={heroActions}
      />

      <ConfirmationModal
        isOpen={closeOpen}
        onClose={() => setCloseOpen(false)}
        onConfirm={() =>
          actions.close({
            onSuccess: () => {
              setCloseOpen(false);
              setClosedNotice(true);
            },
            onError: () => setCloseOpen(false),
          })
        }
        title="Cerrar incidencia"
        subtitle={[incident.code, incident.lodgingName]
          .filter(Boolean)
          .join(" · ")}
        message="Una vez cerrada, la incidencia no podrá editarse, comentarse ni reabrirse."
        confirmLabel="Cerrar incidencia"
      />
    </section>
  );
}
