import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Transaction } from '../../models/transaction.model';

export interface TransactionFilter {
  type: 'income' | 'expense' | 'all';
  categoryId: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private transactions$$ = new BehaviorSubject<Transaction[]>([]);
  private filter$$ = new BehaviorSubject<TransactionFilter>({
    type: 'all',
    categoryId: null,
    dateFrom: null,
    dateTo: null,
  });

  readonly transactions$ = this.transactions$$.asObservable();
  readonly filter$ = this.filter$$.asObservable();

  readonly filteredTransactions$ = combineLatest([
    this.transactions$$,
    this.filter$$,
  ]).pipe(
    map(([transactions, filter]) =>
      transactions.filter((t) => {
        if (filter.type !== 'all' && t.type !== filter.type) return false;
        if (filter.categoryId && t.categoryId !== filter.categoryId) return false;
        if (filter.dateFrom && new Date(t.date) < filter.dateFrom) return false;
        if (filter.dateTo && new Date(t.date) > filter.dateTo) return false;
        return true;
      })
    )
  );

  readonly totalIncome$ = this.transactions$.pipe(
    map((t) => t.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0))
  );

  readonly totalExpense$ = this.transactions$.pipe(
    map((t) => t.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0))
  );

  readonly balance$ = combineLatest([this.totalIncome$, this.totalExpense$]).pipe(
    map(([income, expense]) => income - expense)
  );

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const current = this.transactions$$.getValue();
    this.transactions$$.next([
      ...current,
      { ...transaction, id: crypto.randomUUID() },
    ]);
  }

  removeTransaction(id: string): void {
    this.transactions$$.next(
      this.transactions$$.getValue().filter((t) => t.id !== id)
    );
  }

  setFilter(filter: Partial<TransactionFilter>): void {
    this.filter$$.next({ ...this.filter$$.getValue(), ...filter });
  }
}