"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { toast } from "sonner";

import {
  deleteTechnician,
} from "@/app/(private)/technicians/actions";

import TechnicianFilters from "./TechnicianFilters";
import TechnicianList from "./TechnicianList";
import TechnicianStats from "./TechnicianStats";

import type {
  Technician,
  TechnicianTab,
} from "./technician.types";

import {
  applyLocalInactiveStatus,
  filterTechnicians,
  getTechnicianCounts,
  readInactiveTechnicianIds,
  writeInactiveTechnicianIds,
} from "./technician.utils";

type TechnicianTableProps = {
  initialData: Technician[];
};

export default function TechnicianTable({
  initialData,
}: TechnicianTableProps) {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const createdToastShownRef =
    useRef(false);

  const [
    rows,
    setRows,
  ] = useState<Technician[]>(
    initialData ?? [],
  );

  const [
    tab,
    setTab,
  ] = useState<TechnicianTab>(
    "active",
  );

  const [
    query,
    setQuery,
  ] = useState("");

  useEffect(() => {
    setRows(
      applyLocalInactiveStatus(
        initialData ?? [],
      ),
    );

    setTab("active");
    setQuery("");
  }, [initialData]);

  useEffect(() => {
    const wasCreated =
      searchParams.get(
        "created",
      ) === "1";

    if (
      !wasCreated ||
      createdToastShownRef.current
    ) {
      return;
    }

    createdToastShownRef.current =
      true;

    toast.success(
      "Técnico cadastrado com sucesso.",
    );

    router.replace(
      "/technicians",
      {
        scroll: false,
      },
    );
  }, [
    router,
    searchParams,
  ]);

  const counts =
    useMemo(
      () =>
        getTechnicianCounts(
          rows,
        ),
      [rows],
    );

  const data =
    useMemo(
      () =>
        filterTechnicians(
          rows,
          tab,
          query,
        ),
      [
        rows,
        tab,
        query,
      ],
    );

  function handleDeactivate(
    id: string,
  ) {
    const inactiveIds =
      readInactiveTechnicianIds();

    inactiveIds.add(id);

    writeInactiveTechnicianIds(
      inactiveIds,
    );

    setRows(
      (current) =>
        current.map(
          (technician) =>
            technician.id === id
              ? {
                  ...technician,
                  active: false,
                }
              : technician,
        ),
    );

    setTab("inactive");

    toast.success(
      "Técnico inativado.",
    );
  }

  function handleReactivate(
    id: string,
  ) {
    const inactiveIds =
      readInactiveTechnicianIds();

    inactiveIds.delete(id);

    writeInactiveTechnicianIds(
      inactiveIds,
    );

    setRows(
      (current) =>
        current.map(
          (technician) =>
            technician.id === id
              ? {
                  ...technician,
                  active: true,
                }
              : technician,
        ),
    );

    setTab("active");

    toast.success(
      "Técnico reativado.",
    );
  }

  async function handleDelete(
    id: string,
  ) {
    try {
      await deleteTechnician(
        id,
      );

      const inactiveIds =
        readInactiveTechnicianIds();

      inactiveIds.delete(id);

      writeInactiveTechnicianIds(
        inactiveIds,
      );

      setRows(
        (current) =>
          current.filter(
            (technician) =>
              technician.id !== id,
          ),
      );

      toast.success(
        "Técnico excluído definitivamente.",
      );

      router.refresh();

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o técnico.",
      );

      return false;
    }
  }

  return (
    <div className="space-y-5">
      <TechnicianStats counts={counts} />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <TechnicianFilters tab={tab} query={query} counts={counts} onTabChange={setTab} onQueryChange={setQuery} />

        <TechnicianList technicians={data} onDeactivate={handleDeactivate} onReactivate={handleReactivate} onDelete={handleDelete} />
      </section>
    </div>
  );
}