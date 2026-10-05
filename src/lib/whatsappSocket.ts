let sockAtual: any = null;

export function setWhatsAppSocket(sock: any) {
  sockAtual = sock;
}

export function getWhatsAppSocket() {
  if (!sockAtual) {
    throw new Error("WhatsApp ainda não está conectado.");
  }

  return sockAtual;
}
