import httpClient from "../../../shared/api/httpClient";

export async function loginRequest({ email, password }) {
    const { data } = await httpClient.post('/auth/login', { email, password });
    return data;
}

export async function meRequest() {
    const { data } = await httpClient.get('/auth/me');
    return data;
}

export async function changePasswordRequest({ currentPassword, newPassword }) {
    await httpClient.patch('/auth/password', { currentPassword, newPassword });
}