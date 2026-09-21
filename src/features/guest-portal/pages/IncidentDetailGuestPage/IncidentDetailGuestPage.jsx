import {useEffect, useId, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import ContentLayout from "../../components/ui/organisms/ContentLayout/ContentLayout.jsx";
import PageHeader from "../../components/ui/molecules/PageHeader/PageHeader.jsx";
import StatusBadge from "../../../../shared/components/ui/atoms/StatusBadge/StatusBadge.jsx";
import PrimaryButton from "../../components/ui/atoms/PrimaryButton/PrimaryButton.jsx";
import { formatDate } from "../../../../shared/utils/formatDate.js";
import { fetchGuestIncidentDetail } from "../../services/guestApi.js";
import NoticeBox from "../../../../shared/components/ui/molecules/NoticeBox/NoticeBox.jsx";
import IncidentDetailGuestSkeleton from "../../components/ui/molecules/IncidentDetailGuestSkeleton/IncidentDetailGuestSkeleton.jsx";
import GuestIncidentTimeline from "../../components/ui/organisms/GuestIncidentTimeline/GuestIncidentTimeline.jsx";
import ImageGallery from "../../../../shared/components/ui/organisms/ImageGallery/ImageGallery.jsx";
import "./IncidentDetailGuestPage.scss";

const CLOSED_STATES = new Set(["RESOLVED", "CLOSED", "REJECTED"]);

export default function IncidentDetailGuestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [descExpanded, setDescExpanded] = useState(false);
  const descId = useId();
  const isLongDesc = (incident?.description ?? "").length > 320;

  useEffect(() => {
    let active = true;

    fetchGuestIncidentDetail(id)
      .then((data) => {
        if (!active) return;
        setIncident(data);
        setStatus("success");
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 404) {
          setStatus("notfound");
        } else {
          setError(
            err.response?.data?.message ??
              "No se pudo cargar la incidencia. Inténtalo de nuevo.",
          );
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleBack = () => navigate(-1);

  if (status === "notfound") {
    return (
      <ContentLayout
        contained={false}
        header={
          <PageHeader
            backLabel="Mi alojamiento"
            onBack={handleBack}
            title="Incidencia no encontrada"
          />
        }
      >
        <div className="incident-detail-guest__error">
          <AlertCircle size={24} aria-hidden="true" />
          <p>No hemos encontrado esta incidencia en tu alojamiento.</p>
          <PrimaryButton onClick={() => navigate("/alojamiento")}>
            Volver a mi alojamiento
          </PrimaryButton>
        </div>
      </ContentLayout>
    );
  }

  const showNote = incident && !CLOSED_STATES.has(incident.status);

  return (
    <ContentLayout
      contained={false}
      header={
        <PageHeader
          backLabel="Mi alojamiento"
          onBack={handleBack}
          eyebrow={incident?.code}
          title={incident ? incident.description : "Detalle de la incidencia"}
        />
      }
    >
      <div className="incident-detail-guest">
        {status === "loading" && <IncidentDetailGuestSkeleton />}

        {status === "error" && (
          <div className="incident-detail-guest__error">
            <AlertCircle size={24} aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {status === "success" && incident && (
          <div className="incident-detail-guest__card">
            <div className="incident-detail-guest__top">
              <div className="incident-detail-guest__field">
                <span className="incident-detail-guest__label">Estado</span>
                <StatusBadge status={incident.status} />
              </div>

              <div className="incident-detail-guest__dates">
                <div className="incident-detail-guest__field incident-detail-guest__field--right">
                  <span className="incident-detail-guest__label">
                    Reportada
                  </span>
                  <time
                    className="incident-detail-guest__date"
                    dateTime={incident.openedAt}
                  >
                    {formatDate(incident.openedAt)}
                  </time>
                </div>
                {incident.resolvedAt && (
                  <div className="incident-detail-guest__field incident-detail-guest__field--right">
                    <span className="incident-detail-guest__label">
                      Resuelta
                    </span>
                    <time
                      className="incident-detail-guest__date"
                      dateTime={incident.resolvedAt}
                    >
                      {formatDate(incident.resolvedAt)}
                    </time>
                  </div>
                )}
              </div>
            </div>

            <div
              className="incident-detail-guest__divider"
              aria-hidden="true"
            />

            {incident.status === "REJECTED" && incident.rejectionReason && (
              <NoticeBox tone="warning">
                <strong>Motivo del rechazo</strong> {incident.rejectionReason}
              </NoticeBox>
            )}

            <div className="incident-detail-guest__desc">
              <span className="incident-detail-guest__label">Descripción</span>
              <p
                  id={descId}
                  className={
                    isLongDesc && !descExpanded
                        ? "incident-detail-guest__text incident-detail-guest__text--clamped"
                        : "incident-detail-guest__text"
                  }
              >
                {incident.description}
              </p>
              {isLongDesc && (
                  <button
                      type="button"
                      className="incident-detail-guest__toggle"
                      onClick={() => setDescExpanded((v) => !v)}
                      aria-expanded={descExpanded}
                      aria-controls={descId}
                  >
                    {descExpanded ? "Ver menos" : "Ver más"}
                  </button>
              )}
            </div>

            {incident.images?.length > 0 && (
              <div className="incident-detail-guest__images">
                <span className="incident-detail-guest__label">
                  Fotos adjuntas
                </span>
                <ImageGallery
                  images={incident.images.map((src) => ({ src }))}
                  downloadPrefix={`incidencia-${incident.code}`}
                />
              </div>
            )}

            {showNote && (
              <div className="incident-detail-guest__note">
                Te avisaremos aquí cuando el estado cambie. No hace falta volver
                a reportarla.
              </div>
            )}

            <GuestIncidentTimeline incident={incident} />
          </div>
        )}
      </div>
    </ContentLayout>
  );
}