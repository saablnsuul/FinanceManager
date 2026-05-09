import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    ReactiveFormsModule, AsyncPipe,
    MatFormFieldModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatInputModule, MatButtonModule, MatIconModule,
  ],
  template: `
    <form [formGroup]="filterForm" class="filter-bar">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Type</mat-label>
        <mat-select formControlName="type">
          <mat-option value="all">All</mat-option>
          <mat-option value="income">Income</mat-option>
          <mat-option value="expense">Expense</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Category</mat-label>
        <mat-select formControlName="categoryId">
          <mat-option [value]="null">All categories</mat-option>
          @for (cat of categories$ | async; track cat.id) {
            <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>From</mat-label>
        <input matInput [matDatepicker]="fromPicker" formControlName="dateFrom" />
        <mat-datepicker-toggle matIconSuffix [for]="fromPicker" />
        <mat-datepicker #fromPicker />
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>To</mat-label>
        <input matInput [matDatepicker]="toPicker" formControlName="dateTo" />
        <mat-datepicker-toggle matIconSuffix [for]="toPicker" />
        <mat-datepicker #toPicker />
      </mat-form-field>

      <button mat-stroked-button type="button" (click)="reset()">
        <mat-icon>clear</mat-icon> Reset
      </button>
    </form>
  `,
  styles: [`
    .filter-bar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding: 12px 0; }
    .filter-field { min-width: 160px; }
  `],
})
export class FilterBarComponent implements OnInit {
  private fb = inject(FormBuilder);
  private txService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  categories$ = this.categoryService.categories$;

  filterForm = this.fb.group({
    type: ['all'],
    categoryId: [null],
    dateFrom: [null],
    dateTo: [null],
  });

  ngOnInit(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(value => {
      this.txService.setFilter({
        type: (value.type as any) ?? 'all',
        categoryId: value.categoryId ?? null,
        dateFrom: value.dateFrom ?? null,
        dateTo: value.dateTo ?? null,
      });
    });
  }

  reset(): void {
    this.filterForm.reset({ type: 'all', categoryId: null, dateFrom: null, dateTo: null });
  }
}