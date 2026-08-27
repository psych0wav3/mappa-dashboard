export type ApiEmployee = {
  id: string;
  userId?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  status?: "ACTIVE" | "INACTIVE" | string;
};

export type Tech = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  active: boolean;
  role: "OWNER" | "TECH";
};

export type CreateTechnicianInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};
