import Skeleton from "../../../../../../shared/components/ui/atoms/Skeleton/Skeleton.jsx";
import "./IncidentDetailGuestSkeleton.scss";

export default function IncidentDetailGuestSkeleton() {
  return (
    <div className="incident-detail-guest-skeleton" aria-hidden="true">
      <div className="incident-detail-guest-skeleton__top">
        <div className="incident-detail-guest-skeleton__field">
          <Skeleton width={60} height={12} radius={4} />
          <Skeleton width={90} height={24} radius={999} />
        </div>
        <div className="incident-detail-guest-skeleton__field incident-detail-guest-skeleton__field--right">
          <Skeleton width={70} height={12} radius={4} />
          <Skeleton width={110} height={15} radius={4} />
        </div>
      </div>

      <div
        className="incident-detail-guest-skeleton__divider"
        aria-hidden="true"
      />

      <div className="incident-detail-guest-skeleton__desc">
        <Skeleton width={90} height={12} radius={4} />
        <Skeleton width="100%" height={14} radius={4} />
        <Skeleton width="100%" height={14} radius={4} />
        <Skeleton width="70%" height={14} radius={4} />
      </div>
    </div>
  );
}