import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Budget } from '../../models/budget.model';
import { TransactionService } from './transaction.service';

export interface BudgetStatus {
  categoryId: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private budgets$$ = new BehaviorSubject<Budget[]>([
    { categoryId: 'food', monthlyLimit: 500, month: this.currentMonth() },
    { categoryId: 'transport', monthlyLimit: 150, month: this.currentMonth() },
    { categoryId: 'housing', monthlyLimit: 1200, month: this.currentMonth() },
    { categoryId: 'entertainment', monthlyLimit: 200, month: this.currentMonth() },
  ]);

  private txService = inject(TransactionService);

  readonly budgets$ = this.budgets$$.asObservable();

  readonly budgetStatuses$ = combineLatest([
    this.budgets$$,
    this.txService.transactions$,
  ]).pipe(
    map(([budgets, transactions]) => {
      const month = this.currentMonth();
      return budgets
        .filter(b => b.month === month)
        .map(budget => {
          const spent = transactions
            .filter(t =>
              t.type === 'expense' &&
              t.categoryId === budget.categoryId &&
              this.toMonth(t.date) === month
            )
            .reduce((sum, t) => sum + t.amount, 0);

          const remaining = budget.monthlyLimit - spent;
          const percentage = Math.min((spent / budget.monthlyLimit) * 100, 100);

          return {
            categoryId: budget.categoryId,
            limit: budget.monthlyLimit,
            spent,
            remaining,
            percentage,
            isOverBudget: spent > budget.monthlyLimit,
          } satisfies BudgetStatus;
        });
    })
  );

  setBudget(categoryId: string, limit: number): void {
    const month = this.currentMonth();
    const current = this.budgets$$.getValue();
    const exists = current.findIndex(b => b.categoryId === categoryId && b.month === month);

    if (exists >= 0) {
      const updated = [...current];
      updated[exists] = { ...updated[exists], monthlyLimit: limit };
      this.budgets$$.next(updated);
    } else {
      this.budgets$$.next([...current, { categoryId, monthlyLimit: limit, month }]);
    }
  }

  removeBudget(categoryId: string): void {
    const month = this.currentMonth();
    this.budgets$$.next(
      this.budgets$$.getValue().filter(b => !(b.categoryId === categoryId && b.month === month))
    );
  }

  private currentMonth(): string {
    return new Date().toISOString().slice(0, 7);
  }

  private toMonth(date: Date | string): string {
    return new Date(date).toISOString().slice(0, 7);
  }
}