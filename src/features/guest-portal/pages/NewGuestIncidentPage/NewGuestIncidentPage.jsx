import { useNavigate } from "react-router-dom";
import ContentLayout from "../../components/ui/organisms/ContentLayout/ContentLayout.jsx";
import PageHeader from "../../components/ui/molecules/PageHeader/PageHeader.jsx";
import NewIncidentForm from "../../components/ui/organisms/NewIncidentForm/NewIncidentForm.jsx";
import ReadonlyField from "../../../../shared/components/ui/molecules/ReadonlyField/ReadonlyField.jsx";
import { useGuestAuthStore } from "../../store/guestAuthStore.js";
import { createGuestIncident } from "../../services/guestApi.js";
import "./NewGuestIncidentPage.scss";

const reportDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function NewGuestIncidentPage() {
  const navigate = useNavigate();
  const lodgingName = useGuestAuthStore((state) => state.lodgingName);
  const lodgingAddress = useGuestAuthStore((state) => state.lodgingAddress);

  async function handleSubmit(values) {
    const incident = await createGuestIncident(values);
    navigate(`/incidencias/confirmacion/${incident.code}`);
  }

  return (
    <ContentLayout
      header={
        <PageHeader
          backLabel="Volver"
          onBack={() => navigate("/alojamiento")}
          title="Nueva incidencia"
        />
      }
    >
      <div className="new-guest-incident-page">
        <ReadonlyField label="Fecha del reporte" tag="Automático">
          {reportDateFormatter.format(new Date())}
        </ReadonlyField>

        <ReadonlyField label="Dirección del alojamiento" tag="Fijo">
          <strong>{lodgingAddress || "Dirección no disponible"}</strong>
          {lodgingName && (
            <>
              <br />
              <span style={{ color: "var(--color-text-muted)" }}>
                {lodgingName}
              </span>
            </>
          )}
        </ReadonlyField>

        <NewIncidentForm onSubmit={handleSubmit} />
      </div>
    </ContentLayout>
  );
}

export default NewGuestIncidentPage;