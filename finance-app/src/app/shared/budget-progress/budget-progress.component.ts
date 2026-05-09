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
import { DecimalPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget-progress',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe,
    AsyncPipe, NgClass,
    MatCardModule, MatProgressBarModule, MatIconModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule,
  ],
  templateUrl: './budget-progress.component.html',
  styleUrls: ['./budget-progress.component.scss'],
})
export class BudgetProgressComponent {
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);

  statuses$ = this.budgetService.budgetStatuses$;

  getCategoryName(id: string): string {
    return this.categoryService.getById(id)?.name ?? id;
  }
}