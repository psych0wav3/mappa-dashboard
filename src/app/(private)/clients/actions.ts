export {
  getClientById,
  listClients,
} from "./clients.queries";

export {
  addClientAddress,
  createClient,
  deleteClient,
} from "./clients.mutations";

export type {
  AddClientAddressInput,
  Client,
  ClientAddress,
  ClientStatus,
  CreateClientInput,
} from "./clients.types";
