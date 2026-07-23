import type {
  ApiAddress,
  RouteWeekday,
} from "./routes.types";

export function toApiDate(value?: string | null) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");

    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

export function normalizeStatus(
  value?: string | null,
) {
  return String(value || "")
    .replace(/[_\s-]/g, "")
    .toLowerCase();
}

export function splitName(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

export function addressLabel(
  address?: string | ApiAddress | null,
) {
  if (!address) {
    return "Endereço não informado";
  }

  if (typeof address === "string") {
    return (
      address.trim() ||
      "Endereço não informado"
    );
  }

  const line = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    address.city &&
      `${address.city}${
        address.state
          ? `/${address.state}`
          : ""
      }`,
    address.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return line || "Endereço não informado";
}

export function getAddressLatitude(
  address?: string | ApiAddress | null,
) {
  if (
    !address ||
    typeof address === "string"
  ) {
    return 0;
  }

  return Number(address.latitude || 0);
}

export function getAddressLongitude(
  address?: string | ApiAddress | null,
) {
  if (
    !address ||
    typeof address === "string"
  ) {
    return 0;
  }

  return Number(address.longitude || 0);
}

export function parseScheduledTime(
  description?: string | null,
) {
  const content = String(description || "");

  const patterns = [
    /hor[aá]rio\s*previsto\s*:\s*(\d{1,2}:\d{2})/i,
    /hor[aá]rio\s*:\s*(\d{1,2}:\d{2})/i,
    /\b(\d{2}:\d{2})\b/,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return "Horário não informado";
}

export function parseTechnicianId(
  description?: string | null,
) {
  const content = String(description || "");

  const match = content.match(
    /t[eé]cnico\s*id\s*:\s*([a-f0-9-]{36})/i,
  );

  return match?.[1] || null;
}

export function parseTechnicianName(
  description?: string | null,
) {
  const content = String(description || "");

  const match = content.match(
    /t[eé]cnico\s*:\s*([^\n]+)/i,
  );

  return match?.[1]?.trim() || null;
}

export function parseFrequencyLabel(
  description?: string | null,
) {
  const content = String(description || "");

  const match = content.match(
    /frequ[eê]ncia\s*:\s*([^\n]+)/i,
  );

  return match?.[1]?.trim() || "Avulsa";
}

export function parseServiceKind(
  description?: string | null,
  title?: string | null,
):
  | "POOL_CLEANING"
  | "ADDITIONAL_SERVICE" {
  const content = `${title || ""} ${
    description || ""
  }`.toLocaleLowerCase("pt-BR");

  if (
    content.includes("limpeza") ||
    content.includes("aspiração") ||
    content.includes("aspiracao")
  ) {
    return "POOL_CLEANING";
  }

  return "ADDITIONAL_SERVICE";
}

export function parseWeekdays(
  description?: string | null,
): RouteWeekday[] {
  const content = String(description || "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[áàâã]/g, "a")
    .replace(/[éê]/g, "e");

  const weekdays: Array<{
    value: RouteWeekday;
    patterns: string[];
  }> = [
    {
      value: "MONDAY",
      patterns: ["segunda", "seg"],
    },
    {
      value: "TUESDAY",
      patterns: ["terca", "ter"],
    },
    {
      value: "WEDNESDAY",
      patterns: ["quarta", "qua"],
    },
    {
      value: "THURSDAY",
      patterns: ["quinta", "qui"],
    },
    {
      value: "FRIDAY",
      patterns: ["sexta", "sex"],
    },
    {
      value: "SATURDAY",
      patterns: ["sabado", "sab"],
    },
    {
      value: "SUNDAY",
      patterns: ["domingo", "dom"],
    },
  ];

  return weekdays
    .filter((weekday) =>
      weekday.patterns.some((pattern) =>
        content.includes(pattern),
      ),
    )
    .map((weekday) => weekday.value);
}

export function parseWeekdaysLabel(
  description?: string | null,
) {
  const labels: Record<RouteWeekday, string> = {
    MONDAY: "Seg",
    TUESDAY: "Ter",
    WEDNESDAY: "Qua",
    THURSDAY: "Qui",
    FRIDAY: "Sex",
    SATURDAY: "Sáb",
    SUNDAY: "Dom",
  };

  const weekdays = parseWeekdays(description);

  if (!weekdays.length) {
    return "Não se aplica";
  }

  return weekdays
    .map((weekday) => labels[weekday])
    .join(", ");
}