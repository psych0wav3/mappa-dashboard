export const AQUA_MAPPA_CONTACT = {
  company: "Kora Tecnologia",
  cnpj: "63.655.269/0001-26",
  email: "contato@aquamappa.com.br",
  whatsapp: "(11) 96012-0258",
  whatsappNumber: "5511960120258",
};

export function getAquaMappaWhatsAppUrl(
  message = "Olá! Gostaria de conhecer melhor o Aqua Mappa.",
) {
  return `https://wa.me/${AQUA_MAPPA_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}