export type CompanyProfile = {
  id: string;
  name: string;
  tradeName: string | null;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
};

export type UpdateCompanyProfileInput = {
  tradeName: string;
  email: string;
  phone: string;
};
