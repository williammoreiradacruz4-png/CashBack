export interface DepositItem {
  valor: number;
  pago: boolean;
}

export type StatusFilter = 'all' | 'pending' | 'paid';

export type DrawBudget = 'any' | 'up_to_50' | '75_plus';

export interface TierStat {
  valor: number;
  paidCount: number;
  totalCount: number;
  savedAmount: number;
  targetAmount: number;
}

export interface LastAction {
  index: number;
  valor: number;
  previousPaid: boolean;
}

export const GOAL_AMOUNT = 6000;
export const STORAGE_KEY = 'app_cashback_6k';
export const LEGACY_STORAGE_KEY = 'desafio6k';
export const TIER_VALUES = [30, 40, 50, 75, 90, 100] as const;

export const INITIAL_DISTRIBUTION: number[] = [
  ...Array<number>(10).fill(30),
  ...Array<number>(20).fill(40),
  ...Array<number>(30).fill(50),
  ...Array<number>(20).fill(75),
  ...Array<number>(10).fill(90),
  ...Array<number>(10).fill(100),
];

export function formatCurrencyBRL(amount: number): string {
  return `R$ ${amount.toLocaleString('pt-BR')}`;
}
