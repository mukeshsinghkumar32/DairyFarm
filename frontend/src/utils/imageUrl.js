/**
 * Resolves uploaded and external image URLs reliably across development and production environments.
 * Handles:
 * - Full remote URLs (http/https)
 * - Data and Blob URLs
 * - Backend relative upload paths (/uploads/products/..., /uploads/sellers/..., /uploads/seller/...)
 * - Avoids double slash (//) protocol-relative domain errors
 */
export function getImageUrl(path, fallback = "") {
  if (!path) return fallback;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  // Normalize path to always begin with a single slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Determine base backend origin
  let baseUrl = import.meta.env.VITE_Backend_URL;
  const storageUrl = import.meta.env.VITE_STORAGE_URL;
  const apiUrl = import.meta.env.VITE_API_URL;

  if (storageUrl && storageUrl.startsWith("http")) {
    baseUrl = storageUrl.replace(/\/+$/, "");
  } else if (apiUrl && apiUrl.startsWith("http")) {
    baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "");
  }
  console.log(baseUrl);
  return `${baseUrl}${cleanPath}`;
}
