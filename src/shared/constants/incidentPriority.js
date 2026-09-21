export const INCIDENT_PRIORITY = {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
};

export const INCIDENT_PRIORITY_LABEL = {
    [INCIDENT_PRIORITY.LOW]: 'Baja',
    [INCIDENT_PRIORITY.NORMAL]: 'Normal',
    [INCIDENT_PRIORITY.HIGH]: 'Alta',
    [INCIDENT_PRIORITY.URGENT]: 'Urgente',
};

export function toPriorityModifier(priority) {
    return priority ? priority.toLowerCase() : 'unset';
}