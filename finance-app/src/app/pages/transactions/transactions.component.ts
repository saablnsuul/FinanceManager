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

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    AsyncPipe, DatePipe, NgClass,
    MatCardModule, MatTableModule, MatIconModule,
    MatButtonModule, MatDialogModule, MatChipsModule,
    FilterBarComponent,
  ],
  template: `
    <div class="page-header">
      <h2>Transactions</h2>
      <button mat-raised-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> Add Transaction
      </button>
    </div>

    <app-filter-bar />

    <mat-card>
      <table mat-table [dataSource]="(transactions$ | async) ?? []" class="full-table">
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Type</th>
          <td mat-cell *matCellDef="let row">
            <mat-icon [ngClass]="row.type">
              {{ row.type === 'income' ? 'arrow_upward' : 'arrow_downward' }}
            </mat-icon>
          </td>
        </ng-container>

        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let row">{{ row.date | date:'dd MMM yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Category</th>
          <td mat-cell *matCellDef="let row">
            <mat-chip>{{ getCategoryName(row.categoryId) }}</mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Description</th>
          <td mat-cell *matCellDef="let row">{{ row.description || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef>Amount</th>
          <td mat-cell *matCellDef="let row" [ngClass]="row.type">
            {{ row.type === 'income' ? '+' : '-' }}${{ row.amount | number:'1.2-2' }}
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button color="warn" (click)="remove(row.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>

      @if ((transactions$ | async)?.length === 0) {
        <p class="empty">No transactions found. Try changing the filters.</p>
      }
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h2 { margin: 0; }
    .full-table { width: 100%; }
    .income { color: #43a047; }
    .expense { color: #e53935; }
    .empty { text-align: center; color: rgba(0,0,0,0.54); padding: 32px; }
  `],
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