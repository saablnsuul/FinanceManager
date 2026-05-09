import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TransactionService } from '../../core/services/transaction.service';
import { CurrencyService } from '../../core/services/currency.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe, MatCardModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private txService = inject(TransactionService);
  private currencyService = inject(CurrencyService);

  data$ = combineLatest([
    this.txService.balance$,
    this.txService.totalIncome$,
    this.txService.totalExpense$,
    this.txService.transactions$,
    this.currencyService.currency$,
  ]).pipe(
    map(([balance, income, expense, transactions, currency]) => ({
      balance,
      income,
      expense,
      symbol: { USD: '$', EUR: '€', RUB: '₽' }[currency],
      pieData: this.buildPieData(transactions),
    }))
  );

  private buildPieData(transactions: any[]) {
    const expenseMap = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseMap.set(t.categoryId, (expenseMap.get(t.categoryId) ?? 0) + t.amount);
      });
    return Array.from(expenseMap.entries()).map(([name, value]) => ({ name, value }));
  }
}