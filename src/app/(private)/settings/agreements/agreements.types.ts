export type Agreement = {
  id: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type UserAgreement = Agreement & {
  accepted: boolean;
  acceptedAt: string | null;
};

export type SaveAgreementInput = {
  title: string;
  content: string;
  version?: string;
  isActive?: boolean;
};

export type ApiAgreement = {
  id: string;
  title?: string | null;
  content?: string | null;
  version?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  accepted?: boolean | null;
  acceptedAt?: string | null;
};
