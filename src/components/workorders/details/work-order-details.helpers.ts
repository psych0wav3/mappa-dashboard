import type {
  WorkOrderListItem,
} from "@/app/(private)/workorders/actions";

export type ParsedWorkOrderItem = {
  index: number;
  type: string;
  description: string;
  quantity: string;
  unitPrice: string;
  subtotal: string;
};

export type ParsedWorkOrderDescription = {
  serviceType: string | null;
  notes: string | null;
  items: ParsedWorkOrderItem[];
};

function cleanSentence(
  value: string,
) {
  return value
    .trim()
    .replace(/\.$/, "");
}

function cleanNotes(
  value: string,
) {
  return value
    .replace(
      /Tipo de atendimento:[^\n]*/gi,
      "",
    )
    .replace(
      /Itens da ordem de serviço:[\s\S]*?(?=Observações:|$)/gi,
      "",
    )
    .replace(
      /Total da OS:\s*R?\$?\s*[\d.,]+/gi,
      "",
    )
    .replace(
      /^R?\$?\s*[\d.,]+\s*$/gim,
      "",
    )
    .replace(
      /Observações:/gi,
      "",
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseWorkOrderDescription(
  description?: string | null,
): ParsedWorkOrderDescription {
  const source = String(
    description || "",
  ).trim();

  if (!source) {
    return {
      serviceType: null,
      notes: null,
      items: [],
    };
  }

  const serviceMatch =
    source.match(
      /Tipo de atendimento:\s*([^\n.]+)\.?/i,
    );

  const notesMatch =
    source.match(
      /Observações:\s*([\s\S]*)$/i,
    );

  const itemsBlockMatch =
    source.match(
      /Itens da ordem de serviço:\s*([\s\S]*?)(?:\nTotal da OS:|\n\nObservações:|$)/i,
    );

  const items = String(
    itemsBlockMatch?.[1] || "",
  )
    .split("\n")
    .map((line) =>
      line.trim(),
    )
    .filter(Boolean)
    .map(
      (
        line,
        itemIndex,
      ) => {
        const parts = line
          .split("|")
          .map((part) =>
            part.trim(),
          );

        const firstPart =
          parts[0] || "";

        const firstMatch =
          firstPart.match(
            /^(\d+)\.\s*(.*?)\s*[—-]\s*(.*)$/,
          );

        function field(
          label: string,
        ) {
          const part =
            parts.find(
              (current) =>
                current
                  .toLocaleLowerCase(
                    "pt-BR",
                  )
                  .startsWith(
                    label.toLocaleLowerCase(
                      "pt-BR",
                    ),
                  ),
            );

          return part
            ? part
                .slice(
                  label.length,
                )
                .trim()
            : "—";
        }

        return {
          index: Number(
            firstMatch?.[1] ||
              itemIndex + 1,
          ),

          type:
            firstMatch?.[2]?.trim() ||
            "Item",

          description:
            firstMatch?.[3]?.trim() ||
            firstPart,

          quantity:
            field(
              "Quantidade:",
            ),

          unitPrice:
            field(
              "Valor unitário:",
            ),

          subtotal:
            field(
              "Subtotal:",
            ),
        };
      },
    );

  const explicitNotes =
    cleanNotes(
      notesMatch?.[1] || "",
    );

  const fallbackNotes =
    cleanNotes(source);

  return {
    serviceType:
      serviceMatch?.[1]
        ? cleanSentence(
            serviceMatch[1],
          )
        : null,

    notes:
      explicitNotes ||
      fallbackNotes ||
      null,

    items,
  };
}

export function workOrderOriginLabel(
  order: WorkOrderListItem,
) {
  if (
    order.openedByUserName
  ) {
    return `Criada por ${order.openedByUserName}`;
  }

  return "Criada pela empresa";
}

export function workOrderDisplayCode(
  order: WorkOrderListItem,
) {
  if (
    typeof order.orderNumber === "number" &&
    Number.isFinite(order.orderNumber)
  ) {
    return `OS ${order.orderNumber}`;
  }

  const code = String(
    order.code ||
      order.id ||
      "",
  ).trim();

  if (!code) {
    return "OS";
  }

  if (/^\d+$/.test(code)) {
    return `OS ${code}`;
  }

  return `OS ${code
    .slice(0, 8)
    .toUpperCase()}`;
}

export function resolveWorkOrderItems(
  order: WorkOrderListItem,
  parsed: ParsedWorkOrderDescription,
): ParsedWorkOrderItem[] {
  if (
    Array.isArray(order.items) &&
    order.items.length > 0
  ) {
    return order.items.map(
      (item, index) => ({
        index: index + 1,
        type: item.type,
        description: item.description,
        quantity: String(item.quantity),
        unitPrice: Number(
          item.unitPrice,
        ).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        subtotal: Number(
          item.subtotal,
        ).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
      }),
    );
  }

  return parsed.items;
}