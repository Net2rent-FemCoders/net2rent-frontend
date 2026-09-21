import { useState } from "react";
import { useAuthStore } from "../../../auth/store/authStore.js";
import { changePasswordRequest } from "../../../auth/services/authApi.js";
import ProfileCard from "../../components/ui/molecules/ProfileCard/ProfileCard.jsx";
import ChangePasswordForm from "../../components/ui/organisms/ChangePasswordForm/ChangePasswordForm.jsx";
import NoticeBanner from "../../../../shared/components/ui/molecules/NoticeBanner/NoticeBanner.jsx";
import "./ProfilePage.scss";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleChangePassword({ currentPassword, newPassword }) {
    setSubmitting(true);
    setFeedback(null);
    try {
      await changePasswordRequest({ currentPassword, newPassword });
      setFeedback({
        type: "Ok",
        message: "Contraseña actualizada correctamente.",
      });
    } catch (err) {
      const message =
        err.response?.data?.message ??
        "No se pudo cambiar la contraseña. Inténtalo de nuevo.";
      setFeedback({ type: "Error", message });
    } finally {
      setSubmitting(false);
    }
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <div className="profile-page">
      <ProfileCard name={fullName} email={user?.email} role={user?.role} />

      {feedback && (
        <NoticeBanner tone={feedback.type === "Error" ? "error" : "success"}>
          {feedback.message}
        </NoticeBanner>
      )}

      <ChangePasswordForm
        onSubmit={handleChangePassword}
        submitting={submitting}
      />
    </div>
  );
}