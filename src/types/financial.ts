export type TransactionType = 'Receita' | 'Despesa';
export type CategoryType = 'Receita' | 'Despesa';

export interface Profile {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  data_de_criacao: string;
}

export interface Account {
  id: string;
  nome: string;
  tipo: string;
  saldo_inicial: number;
  usuario_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  nome: string;
  tipo: CategoryType;
  cor: string;
  icone?: string;
  usuario_id: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  tipo: TransactionType;
  valor: number;
  data: string;
  categoria_id: string;
  conta_id: string;
  observacao?: string;
  recorrente: boolean;
  frequencia?: string;
  usuario_id: string;
  created_at: string;
  categorias?: Category;
  contas?: Account;
}

export interface FinancialGoal {
  id: string;
  categoria_id: string;
  usuario_id: string;
  valor_limite: number;
  mes_ano: string;
  created_at: string;
  categorias?: Category;
}

export interface MonthlyBalance {
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}