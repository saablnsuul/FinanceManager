import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-budget-progress',
  standalone: true,
  imports: [
    AsyncPipe, NgClass,
    MatCardModule, MatProgressBarModule, MatIconModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule,
  ],
  template: `
    @if (statuses$ | async; as statuses) {
      <div class="budget-list">
        @for (status of statuses; track status.categoryId) {
          @if (getCategoryName(status.categoryId); as catName) {
            <div class="budget-item" [ngClass]="{ 'over-budget': status.isOverBudget }">
              <div class="budget-header">
                <span class="cat-name">{{ catName }}</span>
                <span class="amounts">
                  <span class="spent" [ngClass]="{ danger: status.isOverBudget }">
                    ${{ status.spent | number:'1.0-0' }}
                  </span>
                  &nbsp;/&nbsp;${{ status.limit | number:'1.0-0' }}
                </span>
              </div>
              <mat-progress-bar
                [value]="status.percentage"
                [color]="status.isOverBudget ? 'warn' : status.percentage > 80 ? 'accent' : 'primary'">
              </mat-progress-bar>
              <div class="budget-footer">
                @if (status.isOverBudget) {
                  <span class="warn-text">
                    <mat-icon inline>warning</mat-icon>
                    Over by ${{ (status.spent - status.limit) | number:'1.0-0' }}
                  </span>
                } @else {
                  <span class="ok-text">${{ status.remaining | number:'1.0-0' }} remaining</span>
                }
                <span class="pct">{{ status.percentage | number:'1.0-0' }}%</span>
              </div>
            </div>
          }
        }
        @if (statuses.length === 0) {
          <p class="empty-state">No budgets set for this month.</p>
        }
      </div>
    }
  `,
  styles: [`
    .budget-list { display: flex; flex-direction: column; gap: 16px; }
    .budget-item { padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.08); }
    .budget-item:last-child { border-bottom: none; }
    .budget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .cat-name { font-weight: 500; font-size: 14px; }
    .amounts { font-size: 13px; color: rgba(0,0,0,0.54); }
    .spent.danger { color: #e53935; font-weight: 600; }
    .budget-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; font-size: 12px; }
    .warn-text { display: flex; align-items: center; gap: 2px; color: #e53935; }
    .ok-text { color: rgba(0,0,0,0.54); }
    .pct { font-weight: 500; }
    .empty-state { color: rgba(0,0,0,0.54); font-size: 14px; text-align: center; padding: 24px 0; }
  `],
})
export class BudgetProgressComponent {
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);

  statuses$ = this.budgetService.budgetStatuses$;

  getCategoryName(id: string): string {
    return this.categoryService.getById(id)?.name ?? id;
  }
}