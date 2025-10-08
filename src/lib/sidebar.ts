// src/lib/sidebar.ts
export const LS_KEY = "sidebar:collapsed" as const;
export const WIDTH_EXPANDED = 280;
export const WIDTH_COLLAPSED = 80;

export function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : false;
  } catch {
    return false;
  }
}

export function currentSidebarWidth(collapsed: boolean) {
  return collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED;
}

export function dispatchSidebarWidth(width: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("sidebar:width", { detail: { width } }));
}
