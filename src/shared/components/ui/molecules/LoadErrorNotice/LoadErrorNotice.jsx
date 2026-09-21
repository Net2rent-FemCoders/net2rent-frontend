import NoticeBanner from "../NoticeBanner/NoticeBanner.jsx";
import Button from "../../atoms/Button/Button.jsx";

export default function LoadErrorNotice({ message, onRetry }) {
  return (
    <NoticeBanner tone="error">
      {message}
      {onRetry && (
        <Button variant="tertiary" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </NoticeBanner>
  );
}