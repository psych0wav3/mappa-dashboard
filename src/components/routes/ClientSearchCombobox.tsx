"use client";

import * as React from "react";
import { ChevronsUpDown, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type ClientLite = {
  id: string;
  firstName: string;
  lastName: string;
  street?: string | null;
  number?: string | null;
  city?: string | null;
  uf?: string | null;
  lat?: number | null;
  lng?: number | null;
};

function addressOf(c: ClientLite) {
  const parts = [c.street, c.number, c.city, c.uf].filter(Boolean);
  return parts.join(", ");
}

export default function ClientSearchCombobox({
  clients,
  value,
  onChange,
  label = "Cliente / Local",
  placeholder = "Buscar cliente ou endereço…",
  disabled,
}: {
  clients: ClientLite[];
  value?: string;
  onChange: (clientId: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  const items = React.useMemo(
    () =>
      clients.map((c) => ({
        id: c.id,
        title: `${c.firstName} ${c.lastName}`.trim(),
        subtitle: addressOf(c),
      })),
    [clients]
  );

  const current = items.find((i) => i.id === value);

  return (
    <div className={cn(disabled && "opacity-60 pointer-events-none")}>
      <label className="text-xs font-medium text-neutral-600">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="mt-1 h-10 w-full justify-between"
          >
            <span className="truncate flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neutral-400" />
              {current ? (
                <>
                  <span className="truncate">{current.title}</span>
                  <span className="text-neutral-400"> — </span>
                  <span className="truncate text-neutral-600">{current.subtitle}</span>
                </>
              ) : (
                <span className="truncate">{placeholder}</span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command shouldFilter>
            <CommandInput placeholder="Digite nome ou endereço…" />
            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            <CommandGroup>
              {items.map((i) => (
                <CommandItem
                  key={i.id}
                  value={`${i.title} ${i.subtitle}`}
                  onSelect={() => {
                    onChange(i.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === i.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="truncate">{i.title}</div>
                    <div className="truncate text-xs text-neutral-500">{i.subtitle}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
