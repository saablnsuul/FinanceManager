import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export type Currency = 'USD' | 'EUR' | 'RUB';

const RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  RUB: 90.5,
};

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private currency$$ = new BehaviorSubject<Currency>('USD');
  readonly currency$ = this.currency$$.asObservable();

  convert(amount: number, from: Currency = 'USD'): number {
    const current = this.currency$$.getValue();
    return (amount / RATES[from]) * RATES[current];
  }

  setCurrency(currency: Currency): void {
    this.currency$$.next(currency);
  }

  get symbol(): string {
    const symbols: Record<Currency, string> = { USD: '$', EUR: '€', RUB: '₽' };
    return symbols[this.currency$$.getValue()];
  }
}