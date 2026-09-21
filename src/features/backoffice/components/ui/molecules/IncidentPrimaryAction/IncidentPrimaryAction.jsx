import Button from "../../../../../../shared/components/ui/atoms/Button/Button";
import { INCIDENT_STATUS } from "../../../../../../shared/constants/incidentStatus";

const ACTION_BY_STATUS = {
  [INCIDENT_STATUS.ASSIGNED]: {
    label: "Comenzar",
    loadingLabel: "Comenzando...",
    handlerKey: "onStart",
  },
  [INCIDENT_STATUS.IN_PROGRESS]: {
    label: "Resolver",
    loadingLabel: "Resolver",
    handlerKey: "onResolve",
  },
  [INCIDENT_STATUS.PAUSED]: {
    label: "Reanudar",
    loadingLabel: "Reanudando...",
    handlerKey: "onResume",
  },
};

export default function IncidentPrimaryAction({
  status,
  loading = false,
  onStart,
  onResolve,
  onResume,
}) {
  const config = ACTION_BY_STATUS[status];
  if (!config) return null;

  const handleClick = { onStart, onResolve, onResume }[config.handlerKey];

  return (
    <Button variant="primary" disabled={loading} onClick={handleClick}>
      {loading ? config.loadingLabel : config.label}
    </Button>
  );
}