function asApiBase(value?: string) {
  const raw = value?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }

  return "";
}

export function getBackendApiBaseUrl() {
  return (
    asApiBase(process.env.API_URL) ||
    asApiBase(process.env.NEXT_PUBLIC_API_URL)
  );
}

export const BROWSER_API_BASE =
  asApiBase(process.env.NEXT_PUBLIC_API_URL) ||
  getBackendApiBaseUrl() ||
  "/mappa-api";
