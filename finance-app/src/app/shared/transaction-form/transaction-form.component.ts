import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { CategoryService } from '../../core/services/category.service';

function positiveAmountValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === '') return null;
  return value > 0 ? null : { notPositive: true };
}

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selected = new Date(control.value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selected <= today ? null : { futureDate: true };
}

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatRadioModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
      <mat-radio-group formControlName="type" class="type-toggle">
        <mat-radio-button value="income">Income</mat-radio-button>
        <mat-radio-button value="expense">Expense</mat-radio-button>
      </mat-radio-group>

      <mat-form-field appearance="outline">
        <mat-label>Amount</mat-label>
        <input matInput type="number" formControlName="amount" />
        @if (form.get('amount')?.hasError('notPositive')) {
          <mat-error>Amount must be greater than 0</mat-error>
        }
        @if (form.get('amount')?.hasError('required')) {
          <mat-error>Amount is required</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Category</mat-label>
        <mat-select formControlName="categoryId">
          @for (cat of categories$ | async; track cat.id) {
            <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Date</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="date" />
        <mat-datepicker-toggle matIconSuffix [for]="picker" />
        <mat-datepicker #picker />
        @if (form.get('date')?.hasError('futureDate')) {
          <mat-error>Cannot set a future date</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Description</mat-label>
        <textarea matInput formControlName="description" rows="2" />
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
        Add Transaction
      </button>
    </form>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px; }
    .type-toggle { grid-column: 1 / -1; display: flex; gap: 16px; }
    .full-width { grid-column: 1 / -1; }
  `],
})
export class TransactionFormComponent {
  submitted = output<any>();

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  categories$ = this.categoryService.categories$;

  form = this.fb.group({
    type: ['expense', Validators.required],
    amount: [null, [Validators.required, positiveAmountValidator]],
    categoryId: [null, Validators.required],
    date: [new Date(), [Validators.required, futureDateValidator]],
    description: ['', Validators.maxLength(200)],
  });

  submit(): void {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
      this.form.reset({ type: 'expense', date: new Date() });
    }
  }
}