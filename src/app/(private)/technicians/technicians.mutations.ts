"use server";

import { revalidatePath } from "next/cache";
import { getCompanyId, mappaFetch } from "@/lib/mappa/api";
import { runTechnicianRequest } from "./technicians.request";
import { normalizeEmployee } from "./technicians.normalizers";
import type { ApiEmployee, CreateTechnicianInput } from "./technicians.types";

function revalidateTechnicianPaths() {
  revalidatePath("/technicians");
  revalidatePath("/dashboard");
  revalidatePath("/routes/builder");
}

export async function createTechnician(data: CreateTechnicianInput) {
  const companyId = await getCompanyId();
  const payload = {
    name: data.name.trim(),
    email: data.email.trim().toLocaleLowerCase("pt-BR"),
    password: data.password.trim(),
    phone: data.phone?.trim() || "",
  };
  const created = await runTechnicianRequest("create", () =>
    mappaFetch<ApiEmployee | null>(`/api/companies/${companyId}/employees`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );

  revalidateTechnicianPaths();
  return created ?? true;
}

export async function updateTechnicianStatus(
  employeeUserId: string,
  status: "ACTIVE" | "INACTIVE",
) {
  if (!employeeUserId) throw new Error("ID do técnico não informado.");

  const companyId = await getCompanyId();
  const updated = await runTechnicianRequest("update", () =>
    mappaFetch<ApiEmployee>(
      `/api/companies/${companyId}/employees/${employeeUserId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    ),
  );

  revalidateTechnicianPaths();
  return normalizeEmployee(updated);
}

export async function deleteTechnician(employeeUserId: string) {
  if (!employeeUserId) throw new Error("ID do técnico não informado.");
  const companyId = await getCompanyId();

  await runTechnicianRequest("delete", () =>
    mappaFetch<null>(`/api/companies/${companyId}/employees/${employeeUserId}`, {
      method: "DELETE",
    }),
  );
  revalidateTechnicianPaths();
  return true;
}
