import { prisma } from "../../lib/prisma.js";
import { CreateClientRequest } from "../../type/type.js";

//interface CreateClientRequest {
// nome?: string;
// telefone: string;
//}

export class CreateClientService {
  async execute({ nome, telefone }: CreateClientRequest) {
    if (!telefone || typeof telefone !== "string" || telefone.trim() === "") {
      throw new Error("O telefone é obrigatório.");
    }

    const formattedPhone = telefone.trim();
    const formattedName = nome?.trim() ? nome.trim() : null;

    const clientAlreadyExists = await prisma.cliente.findUnique({
      where: {
        telefone: formattedPhone,
      },
    });

    if (clientAlreadyExists) {
      throw new Error("Já existe um cliente cadastrado com este telefone.");
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome: formattedName,
        telefone: formattedPhone,
      },
    });

    return cliente;
  }
}
