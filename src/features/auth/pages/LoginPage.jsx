import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated } from '../store/authStore.js';
import LoginForm from '../components/ui/organisms/LoginForm/LoginForm.jsx';
import './LoginPage.scss';
import ThemeToggle from "../../guest-portal/components/ui/atoms/ThemeToggle/ThemeToggle.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  if (isAuthenticated) return <Navigate to="/backoffice" replace />;

  async function handleSubmit(values) {
    const result = await login(values);
    if (result.ok) {
      const target = location.state?.from?.pathname ?? '/backoffice';
      navigate(target, { replace: true });
    }
  }

  return (
    <main className="login-page" id="login-main">
      <a className="skip-link" href="#login-main">Saltar al contenido</a>
      <ThemeToggle className="login-page__theme-toggle" />
      <div className="login-page__form-panel">
        <section className="login-page__card" aria-labelledby="login-title">
          <div className="login-page__brand">
            <img className="login-page__logo" src="/images/logo-r.png" alt="net2rent" />
          </div>

          <h1 id="login-title" className="login-page__title">Inicia sesión en tu cuenta</h1>
          <p className="login-page__subtitle">
            Bienvenido de nuevo: introduce tus credenciales para continuar.
          </p>

          <LoginForm
            onSubmit={handleSubmit}
            submitError={error}
            isSubmitting={status === 'loading'}
            onForgot={() => { /* Pending: password recovery flow */ }}
          />
        </section>
      </div>

      <aside className="login-page__brand-panel">
        <div className="login-page__brand-panel-inner">
          <span className="login-page__accent" aria-hidden="true" />
          <p className="login-page__tagline">
            Todas las incidencias de mantenimiento de tus alojamientos,
            en un único flujo de trabajo.
          </p>
          <p className="login-page__panel-meta">
            Uso interno · net2Rent Property Management
          </p>
        </div>
      </aside>
    </main>
  );
}