import { useParams, useNavigate } from "react-router-dom";
import ContentLayout from "../components/ui/organisms/ContentLayout/ContentLayout.jsx";
import SuccessPanel from "../components/ui/organisms/SuccessPanel/SuccessPanel.jsx";
import NoticeBox from "../../../shared/components/ui/molecules/NoticeBox/NoticeBox.jsx";
import PrimaryButton from "../components/ui/atoms/PrimaryButton/PrimaryButton.jsx";

function ConfirmationPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  return (
    <ContentLayout>
      <SuccessPanel
        title="Incidencia enviada"
        code={code}
        codeLabel="Tu código"
        action={
          <PrimaryButton onClick={() => navigate("/alojamiento")}>
            Volver a mi alojamiento
          </PrimaryButton>
        }
      >
        Gracias por avisarnos. El equipo de mantenimiento ya la tiene.
      </SuccessPanel>

      <NoticeBox>
        Revisamos las incidencias nuevas en el mismo día. Verás el estado
        actualizado en «Tus incidencias». Si es urgente, llama a la recepción
        del alojamiento.
      </NoticeBox>
    </ContentLayout>
  );
}

export default ConfirmationPage;