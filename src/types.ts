export type StatusDemanda = 'pendente' | 'em_andamento' | 'concluido';

export type StatusPacote = 'rascunho' | 'solicitado' | 'aprovado' | 'entregue' | 'assinado';

export type UserRole = 'dev' | 'cliente';

export interface AuthUser {
  role: UserRole;
  empresaId?: string; // Obrigatório se role === 'cliente'
  nome: string;
  email: string;
  cargo?: string;
}

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  emailContato: string;
  nomeContato: string;
  telefoneContato: string;
  tetoMensal: number; // Ex: 3000.00
  criadoEm: string;
  // Responsável por Aprovação Prévia de Demandas (Fase 1)
  respAprovacaoNome: string;
  respAprovacaoEmail: string;
  // Responsável por Aceite e Entrega de Software (Fase 2)
  respEntregaNome: string;
  respEntregaEmail: string;
}

export interface NivelComplexidade {
  id: string;
  nome: string; // Baixa, Média, Alta, Crítica
  descricao: string;
  valorPadrao: number; // R$ 300, R$ 800, R$ 1600, R$ 2800
  empresaId?: string | null; // Opcional: para contratos específicos
}

export interface ItemDemanda {
  id: string;
  titulo: string;
  descricao: string;
  empresaId: string;
  nivelComplexidadeId: string;
  status: StatusDemanda;
  dataCriacao: string;
  pacoteId?: string | null;
}

export interface AssinaturaEntrega {
  id: string;
  pacoteId: string;
  nomeSignatario: string;
  cpfFuncao: string;
  signatureDataUrl: string; // Base64 Canvas
  ipAddress: string;
  userAgent: string;
  dataAssinatura: string;
  hashAutenticacao: string;
}

export interface PacoteEntrega {
  id: string;
  titulo: string;
  empresaId: string;
  dataCompetencia: string; // YYYY-MM
  itemIds: string[];
  valorTotalCalculado: number;
  valorOverride?: number | null;
  status: StatusPacote;
  tokenAprovacao: string; // UUID v4
  tokenAssinatura: string; // UUID v4
  dataCriacao: string;
  dataAprovacaoEscopo?: string | null;
  aprovadoPorNome?: string | null;
  assinatura?: AssinaturaEntrega | null;
  observacoes?: string;
}

export interface FechamentoMensal {
  competencia: string; // YYYY-MM
  empresaId: string;
  totalEntregueMes: number;
  tetoMensal: number;
  saldoDiferidoAnterior: number;
  valorFaturavelMes: number;
  novoSaldoDiferido: number;
  pacotes: PacoteEntrega[];
}
