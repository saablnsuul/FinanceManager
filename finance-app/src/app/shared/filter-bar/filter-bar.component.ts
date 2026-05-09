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
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
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