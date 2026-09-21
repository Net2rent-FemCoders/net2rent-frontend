import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import ContentLayout from "../../components/ui/organisms/ContentLayout/ContentLayout.jsx";
import PageHeader from "../../components/ui/molecules/PageHeader/PageHeader.jsx";
import Logo from "../../components/ui/atoms/Logo/Logo.jsx";
import GuestIncidentItem from "../../components/ui/organisms/GuestIncidentItem/GuestIncidentItem.jsx";
import EmptyState from "../../components/ui/organisms/EmptyState/EmptyState.jsx";
import PrimaryButton from "../../components/ui/atoms/PrimaryButton/PrimaryButton.jsx";
import NoticeBox from "../../../../shared/components/ui/molecules/NoticeBox/NoticeBox.jsx";
import { useGuestAuthStore } from "../../store/guestAuthStore.js";
import { fetchGuestIncidents } from "../../services/guestApi.js";
import { truncate } from "../../../../shared/utils/truncate.js";
import TextButton from "../../components/ui/atoms/TextButton/TextButton.jsx";
import Modal from "../../../../shared/components/ui/molecules/Modal/Modal.jsx";
import Button from "../../../../shared/components/ui/atoms/Button/Button.jsx";
import GuestIncidentItemSkeleton from "../../components/ui/molecules/GuestIncidentItemSkeleton/GuestIncidentItemSkeleton.jsx";
import "./MyLodgingPage.scss";

export default function MyLodgingPage() {
  const lodgingName = useGuestAuthStore((state) => state.lodgingName);
  const lodgingRef = useGuestAuthStore((state) => state.lodgingRef);
  const [incidents, setIncidents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const logout = useGuestAuthStore((state) => state.logout);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    let active = true;

    fetchGuestIncidents()
      .then((data) => {
        if (!active) return;
        setIncidents(data);
        setStatus("success");
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err.response?.data?.message ??
            "No se pudieron cargar las incidencias. Inténtalo de nuevo.",
        );
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRetry = () => {
    setStatus("loading");
    setError("");
    fetchGuestIncidents()
      .then((data) => {
        setIncidents(data);
        setStatus("success");
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ??
            "No se pudieron cargar las incidencias. Inténtalo de nuevo.",
        );
        setStatus("error");
      });
  };

  return (
    <ContentLayout
      contained={false}
      header={
        <>
          <Logo className="my-lodging-page__logo" />
          <PageHeader
            eyebrow="Tu alojamiento"
            title={lodgingName ?? "Mi alojamiento"}
            reference={lodgingRef ?? ""}
          />
        </>
      }
    >
      <div className="my-lodging-page">
        <PrimaryButton
          className="my-lodging-page__report"
          onClick={() => navigate("/incidencias/nueva")}
        >
          Reportar incidencia
        </PrimaryButton>

        <div className="my-lodging-page__section-head">
          <h2 className="my-lodging-page__section-title">Tus incidencias</h2>
          {status === "success" && (
            <span className="my-lodging-page__count">
              {incidents.length} {incidents.length === 1 ? "incidencia" : "incidencias"}
            </span>
          )}
        </div>

        {status === "loading" && (
          <ul className="my-lodging-page__list" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <GuestIncidentItemSkeleton key={i} />
            ))}
          </ul>
        )}

        {status === "error" && (
          <div className="my-lodging-page__error">
            <AlertCircle size={24} aria-hidden="true" />
            <p>{error}</p>
            <PrimaryButton onClick={handleRetry}>Reintentar</PrimaryButton>
          </div>
        )}

        {status === "success" && incidents.length === 0 && (
          <EmptyState icon={CheckCircle2} title="Todo en orden">
            No hay incidencias en tu alojamiento.
          </EmptyState>
        )}

        {status === "success" && incidents.length > 0 && (
          <>
            <NoticeBox>
              Para incidencias urgentes como una fuga de agua o un corte de luz,
              llama directamente al teléfono de emergencias del alojamiento.
            </NoticeBox>
            <ul className="my-lodging-page__list">
              {incidents.map((incident) => (
                <GuestIncidentItem
                  key={incident.id}
                  to={`/incidencias/${incident.id}`}
                  code={incident.code}
                  title={truncate(incident.description)}
                  status={incident.status}
                  openedAt={incident.openedAt}
                  resolvedAt={incident.resolvedAt}
                  closedAt={incident.closedAt}
                />
              ))}
            </ul>
          </>
        )}
        {status === "success" && (
            <TextButton
                className="my-lodging-page__logout"
                onClick={() => setConfirmOpen(true)}
            >
              <LogOut size={16} aria-hidden="true" />
              Salir
            </TextButton>
        )}
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Cerrar sesión"
        closeLabel="Cancelar"
        footer={
          <div className="my-lodging-page__logout-actions">
            <Button variant="primary" onClick={handleLogout}>
              Sí, cerrar sesión
            </Button>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
          </div>
        }
      >
        <p>
          ¿Seguro que quieres salir? Tendrás que volver a introducir la
          referencia y el PIN para acceder de nuevo.
        </p>
      </Modal>
    </ContentLayout>
  );
}