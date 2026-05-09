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
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
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