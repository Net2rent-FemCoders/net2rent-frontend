import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/ui/molecules/SearchBar/SearchBar.jsx";
import RoleFilter from "../../components/ui/molecules/RoleFilter/RoleFilter.jsx";
import UserCard from "../../components/ui/molecules/UserCard/UserCard.jsx";
import EditUserModal from "../../components/ui/organisms/EditUserModal/EditUserModal.jsx";
import ConfirmationModal from "../../components/ui/organisms/ConfirmationModal/ConfirmationModal.jsx";
import ConfirmToast from "../../components/ui/molecules/ConfirmToast/ConfirmToast.jsx";
import Skeleton from "../../../../shared/components/ui/atoms/Skeleton/Skeleton.jsx";
import {
  listUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deactivateUser,
  getActiveIncidentsCount,
} from "../../services/userApi.js";
import { useAuthStore } from "../../../auth/store/authStore.js";
import {
  ALL_ROLES,
  ROLES,
  ROLE_FILTER_OPTIONS,
} from "../../../../shared/constants/nav.js";
import "./UsersPage.scss";
import LoadErrorNotice from "../../../../shared/components/ui/molecules/LoadErrorNotice/LoadErrorNotice.jsx";

const STATUS_FILTER = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

const FILTER_OPTIONS = [
  ...ROLE_FILTER_OPTIONS,
  { value: STATUS_FILTER.ACTIVE, label: "Activos" },
  { value: STATUS_FILTER.INACTIVE, label: "Inactivos" },
];

const BACKEND_TO_FORM_FIELD = {
  firstName: "name",
  lastName: "name",
};

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const lastName = parts.pop();
  return { firstName: parts.join(" "), lastName };
}

function fullName(user) {
  return `${user.firstName} ${user.lastName}`.trim();
}

function loadErrorMessage(err) {
  return err.response?.status === 403
    ? "No tienes permiso para gestionar usuarios."
    : "No se pudieron cargar los usuarios.";
}

export default function UsersPage() {
  const role = useAuthStore((s) => s.user?.role);
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = role === ROLES.ADMIN;
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(ALL_ROLES);

  const [modalMode, setModalMode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [operatorIncidentCount, setOperatorIncidentCount] = useState(0);
  const [toastTarget, setToastTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await listUsers();
        if (!active) return;
        setUsers(data);
        setLoadError("");
      } catch (err) {
        if (!active) return;
        setLoadError(loadErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function refreshUsers() {
    setLoading(true);
    setLoadError("");
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      setLoadError(loadErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setSelected(null);
    setSubmitError("");
    setFieldErrors({});
    setModalMode("create");
  }

  function openEdit(user) {
    setSelected(user);
    setSubmitError("");
    setFieldErrors({});
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setSelected(null);
  }

  async function handleSubmit(values) {
    setSubmitError("");
    setFieldErrors({});
    try {
      const { name, email, role: userRole, password } = values;
      if (modalMode === "create") {
        await createUser({
          ...splitName(name),
          email,
          role: userRole,
          password,
        });
      } else {
        await updateUser(selected.id, {
          ...splitName(name),
          email,
          role: userRole,
        });
        if (password) {
          await resetUserPassword(selected.id, password);
        }
      }
      closeModal();
      await refreshUsers();
    } catch (err) {
      const data = err.response?.data;
      const backendErrors = data?.errors ?? [];

      if (backendErrors.length > 0) {
        const mapped = {};
        backendErrors.forEach(({ field, message }) => {
          mapped[BACKEND_TO_FORM_FIELD[field] ?? field] = message;
        });
        setFieldErrors(mapped);
      } else if (data?.message) {
        setSubmitError(data.message);
      } else {
        setSubmitError("No se pudo guardar el usuario.");
      }
    }
  }

  function closeConfirmModal() {
    setConfirmTarget(null);
    setOperatorIncidentCount(0);
  }

  async function handleDeactivateClick(user) {
    if (user.role === ROLES.OPERATOR) {
      try {
        const count = await getActiveIncidentsCount(user.id);
        setOperatorIncidentCount(count);
        setConfirmTarget(user);
        return;
      } catch {
        // If the count fails, we proceed with the normal flow, assuming 0 incidents.
      }
    }
    setOperatorIncidentCount(0);
    setConfirmTarget(user);
  }

  function handleReassign() {
    if (!confirmTarget) return;
    const id = confirmTarget.id;
    closeConfirmModal();
    navigate(`/backoffice/incidencias?assigneeId=${id}`);
  }

  function confirmDeactivate() {
    if (!confirmTarget) return;
    setToastTarget(confirmTarget);
    closeConfirmModal();
  }

  async function confirmIrreversibleDeactivate() {
    if (!toastTarget) return;
    setRemoving(true);
    try {
      await deactivateUser(toastTarget.id);
      setToastTarget(null);
      await refreshUsers();
    } catch (err) {
      const data = err.response?.data;
      setLoadError(data?.message ?? "No se pudo desactivar el usuario.");
      setToastTarget(null);
    } finally {
      setRemoving(false);
    }
  }

  function cancelIrreversibleDeactivate() {
    setToastTarget(null);
  }

  const currentUserEmail = currentUser?.email?.toLowerCase();

  const term = search.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const isRoleFilter = Object.values(ROLES).includes(filter);
    const matchesFilter =
      filter === ALL_ROLES ||
      (isRoleFilter && user.role === filter) ||
      (filter === STATUS_FILTER.ACTIVE && user.active) ||
      (filter === STATUS_FILTER.INACTIVE && !user.active);
    const matchesSearch =
      !term ||
      fullName(user).toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  const filterCounts = {
    [ALL_ROLES]: users.length,
    [ROLES.ADMIN]: users.filter((u) => u.role === ROLES.ADMIN).length,
    [ROLES.COORDINATOR]: users.filter((u) => u.role === ROLES.COORDINATOR)
      .length,
    [ROLES.OPERATOR]: users.filter((u) => u.role === ROLES.OPERATOR).length,
    [STATUS_FILTER.ACTIVE]: users.filter((u) => u.active).length,
    [STATUS_FILTER.INACTIVE]: users.filter((u) => !u.active).length,
  };

  return (
    <div className="users-page">
      <div className="users-page__toolbar">
        <SearchBar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          onCreate={isAdmin ? openCreate : undefined}
          createLabel="Nuevo usuario"
          placeholder="Buscar usuario"
        />
      </div>

      <div className="users-page__filters">
        <RoleFilter
          value={filter}
          onChange={setFilter}
          options={FILTER_OPTIONS}
          counts={filterCounts}
        />
      </div>

      <div className="users-page__count" aria-live="polite">
        {filteredUsers.length}{" "}
        {filteredUsers.length === 1 ? "usuario" : "usuarios"}
      </div>

      {loading && users.length === 0 && (
        <div className="users-page__skeleton" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              width="100%"
              height={72}
              radius={8}
              className="users-page__skeleton-row"
            />
          ))}
        </div>
      )}
      {loadError && (
        <LoadErrorNotice message={loadError} onRetry={refreshUsers} />
      )}
      {!loading && !loadError && users.length === 0 && (
        <p>Todavía no hay usuarios registrados.</p>
      )}
      {!loading &&
        !loadError &&
        users.length > 0 &&
        filteredUsers.length === 0 && (
          <p>No se encontraron usuarios con los filtros actuales.</p>
        )}

      <div className="users-page__list">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            name={fullName(user)}
            email={user.email}
            role={user.role}
            active={user.active}
            onEdit={isAdmin ? () => openEdit(user) : undefined}
            onDeactivate={
              isAdmin &&
              user.active &&
              user.email?.toLowerCase() !== currentUserEmail
                ? () => handleDeactivateClick(user)
                : undefined
            }
          />
        ))}
      </div>

      {isAdmin && (
        <EditUserModal
          key={modalMode}
          mode={modalMode === "create" ? "create" : "edit"}
          isOpen={modalMode !== null}
          onClose={closeModal}
          user={
            modalMode === "edit" && selected
              ? {
                  name: fullName(selected),
                  email: selected.email,
                  role: selected.role,
                }
              : null
          }
          onSave={handleSubmit}
          submitError={submitError}
          fieldErrors={fieldErrors}
        />
      )}

      {isAdmin && (
        <ConfirmationModal
          isOpen={!!confirmTarget && operatorIncidentCount === 0}
          onClose={closeConfirmModal}
          onConfirm={confirmDeactivate}
          title="Desactivar usuario"
          subtitle={confirmTarget ? fullName(confirmTarget) : undefined}
          message={
            confirmTarget?.role === ROLES.OPERATOR
              ? "Si el operario tiene incidencias activas asignadas, no podrá desactivarse."
              : "Dejará de poder acceder al sistema, pero se conservará todo su historial."
          }
          confirmLabel="Desactivar"
          tone="danger"
        />
      )}

      {isAdmin && operatorIncidentCount > 0 && (
        <ConfirmationModal
          isOpen={!!confirmTarget && operatorIncidentCount > 0}
          onClose={closeConfirmModal}
          onConfirm={handleReassign}
          title="No se puede desactivar"
          subtitle={confirmTarget ? fullName(confirmTarget) : undefined}
          message={
            confirmTarget
              ? `El operario ${fullName(confirmTarget)} tiene ${operatorIncidentCount} incidencia(s) activa(s) y no puede desactivarse. Primero deben reasignarse sus incidencias a otro(s) operario(s).`
              : undefined
          }
          confirmLabel="Reasignar"
          cancelLabel="Cancelar"
          tone="default"
        />
      )}

      {isAdmin && (
        <ConfirmToast
          isOpen={!!toastTarget}
          onConfirm={confirmIrreversibleDeactivate}
          onCancel={cancelIrreversibleDeactivate}
          busy={removing}
          message={
            toastTarget
              ? `Esta acción no es reversible, si desactiva a ${fullName(toastTarget)} no podrá reactivarlo de nuevo`
              : ""
          }
        />
      )}
    </div>
  );
}