import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { map } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { FilterBarComponent } from '../../shared/filter-bar/filter-bar.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    AsyncPipe, DatePipe,
    MatCardModule, MatTableModule, MatIconModule, MatChipsModule,
    NgxChartsModule, FilterBarComponent,
  ],
  template: `
    <h2>Transaction History</h2>
    <app-filter-bar />

    <mat-card style="margin-bottom: 24px; padding: 16px;">
      <mat-card-title>Income vs Expenses by Month</mat-card-title>
      @if (chartData$ | async; as chartData) {
        <ngx-charts-bar-vertical-2d
          [results]="chartData"
          [xAxis]="true"
          [yAxis]="true"
          [legend]="true"
          [groupPadding]="8"
          [barPadding]="2"
          scheme="vivid"
          style="height: 280px; display: block;">
        </ngx-charts-bar-vertical-2d>
      }
    </mat-card>

    <mat-card>
      <table mat-table [dataSource]="(transactions$ | async) ?? []" class="history-table">
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let row">{{ row.date | date:'dd.MM.yyyy' }}</td>
        </ng-container>
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Type</th>
          <td mat-cell *matCellDef="let row">
            <mat-chip [color]="row.type === 'income' ? 'primary' : 'warn'" selected>
              {{ row.type }}
            </mat-chip>
          </td>
        </ng-container>
        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Category</th>
          <td mat-cell *matCellDef="let row">{{ getCategoryName(row.categoryId) }}</td>
        </ng-container>
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Description</th>
          <td mat-cell *matCellDef="let row">{{ row.description || '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef>Amount</th>
          <td mat-cell *matCellDef="let row" [style.color]="row.type === 'income' ? '#43a047' : '#e53935'">
            {{ row.type === 'income' ? '+' : '-' }}${{ row.amount | number:'1.2-2' }}
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
    </mat-card>
  `,
  styles: [`.history-table { width: 100%; }`],
})
export class HistoryComponent {
  private txService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  transactions$ = this.txService.filteredTransactions$;
  columns = ['date', 'type', 'category', 'description', 'amount'];

  chartData$ = this.txService.transactions$.pipe(
    map(transactions => {
      const monthMap = new Map<string, { income: number; expense: number }>();
      transactions.forEach(t => {
        const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!monthMap.has(month)) monthMap.set(month, { income: 0, expense: 0 });
        const entry = monthMap.get(month)!;
        if (t.type === 'income') entry.income += t.amount;
        else entry.expense += t.amount;
      });
      return [
        { name: 'Income', series: Array.from(monthMap.entries()).map(([name, v]) => ({ name, value: v.income })) },
        { name: 'Expenses', series: Array.from(monthMap.entries()).map(([name, v]) => ({ name, value: v.expense })) },
      ];
    })
  );

  getCategoryName(id: string): string {
    return this.categoryService.getById(id)?.name ?? id;
  }
}