export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: Date;
  description: string;
  currency: 'USD' | 'EUR' | 'RUB';
}