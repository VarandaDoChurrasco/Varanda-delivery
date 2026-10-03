import { Decimal } from "@prisma/client/runtime/client";

export interface CreateClientRequest {
  nome?: string;
  telefone: string;
}
export interface GetClientRequest {
  id: string;
  telefone: string;
  nome: string | null;
  modoAtendimento: "IA" | "HUMANO";
  createdAt: Date;
  updatedAt: Date;
}

export interface CarrinhoCreateRequest {
  clienteId: string;
}
export interface TamanhoQuentinhaData {
  nome: string;
  preco: number;
  maxProteinas: number;
}

export interface CarrinhoItemCreateRequest {
  carrinhoId: string;
  produtoId: string;
  quantidade: number;
  observacao?: string;
}

export interface CarrinhoItemAdicionalCreateRequest {
  carrinhoItemId: string;
  adicionalId: string;
  quantidade: number;
}

export interface AdicionalCreateRequest {
  nome: string;
  preco: number;
}

export interface ProdutoAdicionalCreateRequest {
  produtoId: string;
  adicionalId: string;
}
export interface RemoveCartRequest {
  carrinhoItemId: string;
  ingrediente: string;
}

export interface ProdutoResponse {
  id: string;
  nome: string;
  descricao: string | null;
  preco: Decimal;
  disponivel: boolean;
  ativo: boolean;
  categoriaId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProdutoCreateRequest {
  nome: string;
  descricao: string | null; // O usuário pode mandar null ou você pode usar 'string?'
  preco: number; // O frontend manda 15.99 (number) e o Prisma aceita!
  disponivel?: boolean; // Opcional, pois tem @default(true) no banco
  ativo?: boolean; // Opcional, pois tem @default(true) no banco
  categoriaId: string; // Obrigatório para vincular à categoria
}

export interface CardapioCreateRequest {
  data: string;
  opcoes: {
    opcaoId: string;
    ordem?: number;
  }[];
}
export interface CardapioItemInput {
  produtoId: string;
  preco: number;
  ordem?: number;
}

export interface CardapioItemCreateRequest {
  cardapioId: string;
  produtoId: string;
  preco: number;
  ordem?: number;
}

export interface BairroCreateRequest {
  nome: string;
  taxaEntrega: number;
}

export interface CalculateCartRequest {
  carrinhoId: string;
  tipo: "DELIVERY" | "RETIRADA";
  bairroId?: string;
}

export interface CheckoutRequest {
  carrinhoId: string;
  tipo: "DELIVERY" | "RETIRADA";

  bairroId?: string;

  endereco?: string;
  // numeroEndereco?: string;
  complemento?: string;
  referencia?: string;

  formaPagamento: "PIX" | "DINHEIRO" | "DEBITO" | "CREDITO";

  trocoPara?: number;
}
