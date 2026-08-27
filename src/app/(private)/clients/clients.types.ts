export type ClientStatus =
  | "ACTIVE"
  | "INACTIVE";

export type ClientAddress = {
  id: string;
  street: string;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isMain: boolean;
};

export type Client = {
  id: string;
  userId?: string | null;
  companyId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  document?: string | null;
  status: ClientStatus;
  active: boolean;
  mainAddress?: ClientAddress | null;
  addresses: ClientAddress[];
};

export type CreateClientInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  document?: string;

  address: {
    street: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
};

export type AddClientAddressInput = {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  isMain?: boolean;
};

export type ApiAddress = {
  id?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isMain?: boolean | null;
};

export type ApiCustomer = {
  id: string;
  userId?: string | null;
  companyId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  status?: string | null;
  mainAddress?: ApiAddress | null;
  addresses?: ApiAddress[] | null;
};
