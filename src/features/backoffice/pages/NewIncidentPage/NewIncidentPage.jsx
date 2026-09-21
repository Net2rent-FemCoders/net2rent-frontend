import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import PhoneIncidentForm from "../../components/ui/organisms/PhoneIncidentForm/PhoneIncidentForm.jsx";
import Button from "../../../../shared/components/ui/atoms/Button/Button.jsx";
import {
  listActiveLodgings,
  listOperators,
  createPhoneIncident,
} from "../../services/incidentApi.js";
import { useAuthStore } from "../../../auth/store/authStore.js";
import { ROLES } from "../../../../shared/constants/nav.js";
import "./NewIncidentPage.scss";
import LoadErrorNotice from "../../../../shared/components/ui/molecules/LoadErrorNotice/LoadErrorNotice.jsx";
import { useNetworkAwareSubmit } from "../../../../hooks/useNetworkAwareSubmit.js";

export default function NewIncidentPage() {
  const role = useAuthStore((s) => s.user?.role);

  const [lodgings, setLodgings] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [createdCode, setCreatedCode] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    if (role === ROLES.OPERATOR) return;

    let alive = true;
    Promise.all([listActiveLodgings(), listOperators()])
      .then(([lodgingsData, operatorsData]) => {
        if (!alive) return;
        setLodgings(lodgingsData);
        setOperators(operatorsData);
      })
      .catch(() => {
        if (alive)
          setLoadError("No se pudieron cargar alojamientos u operarios.");
      })
      .finally(() => {
        if (alive) setLoadingOptions(false);
      });
    return () => {
      alive = false;
    };
  }, [role]);

  if (role === ROLES.OPERATOR) {
    return <Navigate to="/backoffice/incidencias" replace />;
  }

  function registerAnother() {
    setCreatedCode(null);
    setFormKey((k) => k + 1);
  }

  return (
    <section className="new-incident-page">
      {!createdCode && (
        <>
          <h1>Nueva incidencia</h1>
          <p>
            Registro telefónico de una incidencia sobre un alojamiento de tu
            cuenta.
          </p>
        </>
      )}

      {loadError && <LoadErrorNotice message={loadError} />}

      {createdCode ? (
        <div className="new-incident-page__success" role="status">
          <p>
            Incidencia registrada con el código <strong>{createdCode}</strong>.
          </p>
          <Button variant="primary" onClick={registerAnother}>
            Registrar nueva incidencia
          </Button>
        </div>
      ) : (
        <PhoneIncidentFormWithNetworkAwareness
          key={formKey}
          lodgings={lodgings}
          operators={operators}
          loadingOptions={loadingOptions}
          onCreated={setCreatedCode}
          onDiscard={() => setFormKey((k) => k + 1)}
        />
      )}
    </section>
  );
}

function PhoneIncidentFormWithNetworkAwareness({
  lodgings,
  operators,
  loadingOptions,
  onCreated,
  onDiscard,
}) {
  const { submit, frozen, error } = useNetworkAwareSubmit(createPhoneIncident, {
    fallbackMessage: "No se pudo registrar la incidencia. Inténtalo de nuevo.",
    onSuccess: (incident) => onCreated(incident.code),
  });

  async function handleFormSubmit(values) {
    const { ok } = await submit(values);
    return ok;
  }

  return (
    <PhoneIncidentForm
      lodgings={lodgings}
      operators={operators}
      loadingOptions={loadingOptions}
      onSubmit={handleFormSubmit}
      submitError={error}
      frozen={frozen}
      onDiscard={onDiscard}
    />
  );
}
