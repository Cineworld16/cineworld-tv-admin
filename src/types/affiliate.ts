export type RowTipo = 'voce' | 'socio' | 'afiliado';

export interface Affiliate {
  key: string;
  label: string;
  tipo: RowTipo;
  vendas: number;
  validas: number;
  canceladas: number;
  receita: number;
  comissao: number;
}

export interface AffiliatesTotals {
  afiliados: number;
  validas: number;
  receita: number;
  comissao: number;
}

export interface SalesPoint {
  date: string; // YYYY-MM-DD
  total: number;
}

export interface PaymentConv {
  method: string;
  attempts: number;
  approved: number;
  rate: number | null;
}

export interface AffiliatesResponse {
  affiliates: Affiliate[];
  totals: AffiliatesTotals;
  resumo: { totalFaturado: number; numVendas: number; ticketMedio: number };
  chart: SalesPoint[];
  conversao: { geral: number | null; porPagamento: PaymentConv[] };
}

export interface AffiliateSale {
  sale_id: string;
  data_compra: string;
  nome: string;
  plano: string;
  valor_total: number | null;
  status: string;
  payment_method: string | null;
  comissao: number | null;
}

export interface AffiliateDetail {
  key: string;
  label: string;
  tipo: RowTipo;
  totals: {
    vendas: number;
    validas: number;
    canceladas: number;
    receita: number;
    comissao: number;
    ticketMedio: number;
  };
  conversion: { attempts: number; approved: number; rate: number | null };
  paymentMethods: { method: string; count: number }[];
  sales: AffiliateSale[];
}
