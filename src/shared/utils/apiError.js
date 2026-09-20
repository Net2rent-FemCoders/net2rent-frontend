export function isNetworkError(error) {
  return !error.response;
}

export function getErrorMessage(error, fallback) {
  if (isNetworkError(error)) {
    return "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
  }
  return error.response?.data?.message ?? fallback;
}
