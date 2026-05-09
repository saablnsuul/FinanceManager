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
  template: `
    @if (data$ | async; as data) {
      <div class="dashboard-grid">
        <mat-card class="kpi-card">
          <mat-card-title>Balance</mat-card-title>
          <p class="kpi-value" [class.negative]="data.balance < 0">
            {{ data.symbol }}{{ data.balance | number:'1.2-2' }}
          </p>
        </mat-card>

        <mat-card class="kpi-card income">
          <mat-card-title>Income</mat-card-title>
          <p class="kpi-value">{{ data.symbol }}{{ data.income | number:'1.2-2' }}</p>
        </mat-card>

        <mat-card class="kpi-card expense">
          <mat-card-title>Expenses</mat-card-title>
          <p class="kpi-value">{{ data.symbol }}{{ data.expense | number:'1.2-2' }}</p>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-title>Expenses by Category</mat-card-title>
          <ngx-charts-pie-chart
            [results]="data.pieData"
            [legend]="true"
            [labels]="true"
            [doughnut]="true">
          </ngx-charts-pie-chart>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 16px; }
    .chart-card { grid-column: 1 / -1; height: 350px; }
    .kpi-value { font-size: 2rem; font-weight: 600; margin: 8px 0 0; }
    .negative { color: #e53935; }
    .income .kpi-value { color: #43a047; }
    .expense .kpi-value { color: #e53935; }
  `],
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