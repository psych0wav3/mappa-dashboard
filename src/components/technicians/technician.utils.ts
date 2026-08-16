import type {
  Technician,
  TechnicianCounts,
  TechnicianDefaults,
  TechnicianTab,
} from "./technician.types";

const INACTIVE_STORAGE_KEY =
  "aqua-mappa:inactive-technicians";

export function getTechnicianName(
  technician?: TechnicianDefaults,
) {
  const explicitName =
    technician?.name?.trim();

  if (explicitName) {
    return explicitName;
  }

  return [
    technician?.firstName,
    technician?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function getTechnicianInitials(
  technician:
    | Technician
    | TechnicianDefaults
    | string,
) {
  const name =
    typeof technician === "string"
      ? technician
      : getTechnicianName(
          technician,
        );

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (
    !parts.length ||
    name === "—"
  ) {
    return "T";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 1)
      .toLocaleUpperCase(
        "pt-BR",
      );
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase(
    "pt-BR",
  );
}

export function readInactiveTechnicianIds() {
  if (
    typeof window ===
    "undefined"
  ) {
    return new Set<string>();
  }

  try {
    const raw =
      window.localStorage.getItem(
        INACTIVE_STORAGE_KEY,
      );

    const parsed =
      raw
        ? JSON.parse(raw)
        : [];

    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(
      parsed.filter(
        (
          item,
        ): item is string =>
          typeof item ===
          "string",
      ),
    );
  } catch {
    return new Set<string>();
  }
}

export function writeInactiveTechnicianIds(
  ids: Set<string>,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    INACTIVE_STORAGE_KEY,
    JSON.stringify(
      Array.from(ids),
    ),
  );
}

export function applyLocalInactiveStatus(
  technicians: Technician[],
) {
  const inactiveIds =
    readInactiveTechnicianIds();

  return technicians.map(
    (technician) => ({
      ...technician,
      active:
        technician.active &&
        !inactiveIds.has(
          technician.id,
        ),
    }),
  );
}

export function getTechnicianCounts(
  technicians: Technician[],
): TechnicianCounts {
  const active =
    technicians.filter(
      (technician) =>
        technician.active,
    ).length;

  return {
    total:
      technicians.length,
    active,
    inactive:
      technicians.length -
      active,
  };
}

export function filterTechnicians(
  technicians: Technician[],
  tab: TechnicianTab,
  query: string,
) {
  const byStatus =
    technicians.filter(
      (technician) =>
        tab === "active"
          ? technician.active
          : !technician.active,
    );

  const keyword =
    query
      .trim()
      .toLocaleLowerCase(
        "pt-BR",
      );

  if (!keyword) {
    return byStatus;
  }

  return byStatus.filter(
    (technician) => {
      const searchableContent =
        [
          technician.firstName,
          technician.lastName,
          technician.email,
          technician.phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase(
            "pt-BR",
          );

      return searchableContent.includes(
        keyword,
      );
    },
  );
}