"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type TechLite = { id: string; firstName: string; lastName: string };

export default function TechCombobox({
  technicians,
  value,
  onChange,
  placeholder = "Selecionar técnico…",
  label = "Técnico",
}: {
  technicians: TechLite[];
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const items = React.useMemo(
    () =>
      technicians.map((t) => ({
        id: t.id,
        label: `${t.firstName} ${t.lastName}`.trim(),
      })),
    [technicians]
  );

  const current = items.find((i) => i.id === value);

  return (
    <div>
      <label className="text-xs font-medium text-neutral-600">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="mt-1 h-10 w-full justify-between"
          >
            <span className="truncate flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-400" />
              {current ? current.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter>
            <CommandInput placeholder="Digite para filtrar…" />
            <CommandEmpty>Nenhum técnico encontrado.</CommandEmpty>
            <CommandGroup>
              {items.map((i) => (
                <CommandItem
                  key={i.id}
                  value={i.label}
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
                  {i.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
