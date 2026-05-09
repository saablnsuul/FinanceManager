import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { FilterBarComponent } from '../../shared/filter-bar/filter-bar.component';
import { TransactionFormComponent } from '../../shared/transaction-form/transaction-form.component';
import { CommonModule, DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe,
    AsyncPipe, DatePipe, NgClass,
    MatCardModule, MatTableModule, MatIconModule,
    MatButtonModule, MatDialogModule, MatChipsModule,
    FilterBarComponent,
  ],
  templateUrl: './transactions.component.html',
  styleUrls: [ './transactions.component.scss' ],
})
export class TransactionsComponent {
  private txService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);

  transactions$ = this.txService.filteredTransactions$;
  columns = ['type', 'date', 'category', 'description', 'amount', 'actions'];

  getCategoryName(id: string): string {
    return this.categoryService.getById(id)?.name ?? id;
  }

  remove(id: string): void {
    this.txService.removeTransaction(id);
  }

  openForm(): void {
    const ref = this.dialog.open(TransactionFormComponent, { width: '520px' });
    ref.componentInstance.submitted.subscribe((value: any) => {
      this.txService.addTransaction({
        ...value,
        date: new Date(value.date),
        currency: 'USD',
      });
      ref.close();
    });
  }
}