export type TechnicianRole = "OWNER" | "TECH";

export type Technician = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  active: boolean;
  role: TechnicianRole;
};

export type TechnicianDefaults = Partial<
  Technician & {
    name: string;
  }
>;

export type TechnicianTab =
  | "active"
  | "inactive";

export type TechnicianCounts = {
  total: number;
  active: number;
  inactive: number;
};