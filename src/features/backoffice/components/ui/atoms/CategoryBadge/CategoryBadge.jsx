import { INCIDENT_CATEGORY_LABEL } from '../../../../../../shared/constants/incidentCategory.js';
import './CategoryBadge.scss';

export default function CategoryBadge({ category, className = '' }) {
    if (!category) return null;
    const label = INCIDENT_CATEGORY_LABEL[category];
    if (!label) return null;

    return (
        <span className={`category-badge ${className}`.trim()}>
            <span className="visually-hidden">Categoría: </span>
            {label}
        </span>
    );
}