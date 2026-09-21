import { create } from 'zustand';
import { loadSession, saveSession, clearSession } from '../services/authStorage.js';
import { loginRequest } from '../services/authApi.js';

const initial = loadSession();

export const useAuthStore = create((set) => ({
  token: initial?.token ?? null,
  user: initial?.user ?? null,
  status: 'idle',
  error: null,

  async login({ email, password }) {
    set({ status: 'loading', error: null });
    try {
      const data = await loginRequest({ email, password });
      const user = { email: data.email, firstName: data.firstName, lastName: data.lastName, role: data.role };
      saveSession({ token: data.token, user });
      set({ token: data.token, user, status: 'idle', error: null });
      return { ok: true };
    } catch (err) {
      const message =
        err.response?.data?.message ??
        'No se pudo iniciar sesión. Revisa tu conexión e inténtalo de nuevo.';
      set({ status: 'error', error: message });
      return { ok: false, message };
    }
  },

  logout() {
    clearSession();
    set({ token: null, user: null, status: 'idle', error: null });
  },
}));

export const selectIsAuthenticated = (state) => Boolean(state.token);