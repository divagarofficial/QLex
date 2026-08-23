/**
 * Resolves a document/file URL to a valid absolute URL for viewing, printing, or downloading.
 * Correctly handles local dev URLs (http://localhost:8000), relative paths (/uploads/...),
 * and rewrites legacy localhost URLs when deployed to production via process.env.NEXT_PUBLIC_API_URL.
 */
export function getFileUrl(
  rawUrl?: string | null,
  orderId?: string | null,
  filename?: string | null
): string {
  const defaultApiBase = "https://qlex-backend-ybnb435gbq-el.a.run.app";
  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL || defaultApiBase
  ).replace(/\/+$/, "");

  let url = rawUrl || "";

  // If url starts with http://localhost:8000 or http://127.0.0.1:8000
  if (url.startsWith("http://localhost:8000") || url.startsWith("http://127.0.0.1:8000")) {
    if (apiBase && !apiBase.includes("localhost:8000") && !apiBase.includes("127.0.0.1:8000")) {
      url = url.replace(/^http:\/\/(localhost|127\.0\.0\.1):8000/, apiBase);
    }
  } else if (url.startsWith("/")) {
    // Relative path like /uploads/drafts/...
    url = `${apiBase}${url}`;
  }

  // If url is still empty, attempt to construct fallback from orderId & filename
  if (!url) {
    if (orderId && filename) {
      return `${apiBase}/uploads/drafts/${orderId}/${filename}`;
    }
    if (orderId) {
      return `${apiBase}/uploads/drafts/${orderId}`;
    }
    return "";
  }

  return url;
}
