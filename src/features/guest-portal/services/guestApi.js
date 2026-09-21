import guestHttpClient from "./guestHttpClient";

export async function requestGuestAccess(ref, pin) {
  const { data } = await guestHttpClient.post("/api/guest/access", {
    ref,
    pin,
  });
  return data;
}

export async function fetchGuestIncidents() {
  const { data } = await guestHttpClient.get("/api/guest/incidents");
  return data;
}

export async function fetchGuestIncidentDetail(id) {
  const { data } = await guestHttpClient.get(`/api/guest/incidents/${id}`);
  return data;
}

function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function toCreatePayload(values) {
  const images = await Promise.all((values.images ?? []).map(fileToDataUri));
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    contact: values.contact?.trim() || null,
    category: values.category || null,
    description: values.description,
    images,
  };
}

export async function createGuestIncident(values) {
  const { data } = await guestHttpClient.post(
    "/api/guest/incidents",
    await toCreatePayload(values),
  );
  return data;
}