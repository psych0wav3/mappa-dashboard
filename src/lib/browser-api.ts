/**
 * Prefixo same-origin. O browser só fala HTTPS com o Amplify;
 * o Route Handler em /mappa-api encaminha para a API HTTP.
 */
export const BROWSER_API_BASE = "/mappa-api";

function asHttpBase(value?: string) {
  const raw = value?.trim();

  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }

  return "";
}

export function getBackendApiBaseUrl() {
  return (
    asHttpBase(process.env.API_URL) ||
    asHttpBase(process.env.NEXT_PUBLIC_API_URL)
  );
}
