import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { CurrencyService, Currency } from './core/services/currency.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatListModule, MatIconModule, MatToolbarModule, MatSelectModule],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon>account_balance_wallet</mat-icon>
          <span>FinTrack</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/transactions" routerLinkActive="active-link">
            <mat-icon matListItemIcon>swap_horiz</mat-icon>
            <span matListItemTitle>Transactions</span>
          </a>
          <a mat-list-item routerLink="/categories" routerLinkActive="active-link">
            <mat-icon matListItemIcon>category</mat-icon>
            <span matListItemTitle>Categories</span>
          </a>
          <a mat-list-item routerLink="/history" routerLinkActive="active-link">
            <mat-icon matListItemIcon>history</mat-icon>
            <span matListItemTitle>History</span>
          </a>
        </mat-nav-list>
        <div class="currency-selector">
          <mat-select [value]="'USD'" (selectionChange)="onCurrencyChange($event.value)">
            <mat-option value="USD">$ USD</mat-option>
            <mat-option value="EUR">€ EUR</mat-option>
            <mat-option value="RUB">₽ RUB</mat-option>
          </mat-select>
        </div>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>Personal Finance Manager</span>
        </mat-toolbar>
        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { width: 220px; padding: 0; }
    .sidenav-header { display: flex; align-items: center; gap: 10px; padding: 20px 16px 8px; font-size: 1.2rem; font-weight: 600; }
    .content { padding: 24px; }
    .active-link { background: rgba(0,0,0,0.08); border-radius: 8px; }
    .currency-selector { padding: 16px; margin-top: auto; }
  `],
})
export class AppComponent {
  private currencyService = inject(CurrencyService);
  onCurrencyChange(val: Currency) { this.currencyService.setCurrency(val); }
}