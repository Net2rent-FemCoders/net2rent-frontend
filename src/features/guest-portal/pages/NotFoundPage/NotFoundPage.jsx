import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AuthLayout from "../../components/ui/organisms/AuthLayout/AuthLayout.jsx";
import PrimaryButton from "../../components/ui/atoms/PrimaryButton/PrimaryButton.jsx";
import {
  useGuestAuthStore,
  selectIsGuestAuthenticated,
} from "../../store/guestAuthStore.js";
import "./NotFoundPage.scss";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const isAuthenticated = useGuestAuthStore(selectIsGuestAuthenticated);
  const lodgingName = useGuestAuthStore((state) => state.lodgingName);

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, []);

  return (
    <AuthLayout>
      <p className="not-found-page__code">404</p>
      <h1 className="not-found-page__title">Vaya, esta página no existe</h1>
      <p className="not-found-page__subtitle">
        {isAuthenticated
          ? `El enlace al que intentabas acceder no existe o ha caducado. Tu sesión en ${lodgingName ?? "tu alojamiento"} sigue activa.`
          : "El enlace al que intentabas acceder no existe o ha caducado."}
      </p>

      <div className="not-found-page__actions">
        <PrimaryButton onClick={() => navigate(-1)}>
          <span className="not-found-page__back-content">
            <ArrowLeft size={18} aria-hidden="true" />
            Volver atrás
          </span>
        </PrimaryButton>
      </div>
    </AuthLayout>
  );
}