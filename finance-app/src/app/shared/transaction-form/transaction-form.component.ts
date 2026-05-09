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
import { CommonModule, AsyncPipe } from '@angular/common';

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
    CommonModule,
    AsyncPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatRadioModule,
  ],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
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