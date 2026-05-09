Overview

FinTrack is a single-page application for managing personal finances. It allows users to record income and expenses, organize them into categories, set monthly budgets, and visualize spending patterns through interactive charts. All data updates reactively across the entire UI using RxJS streams.

Features
Transaction Management

Add income and expense transactions with category, date, amount, and description
Real-time form validation with custom validators (positive amount, no future dates)
Delete transactions
Full transaction history with filtering

Categories & Budgets

Hierarchical category tree (parent → child categories)
Create and remove categories at any nesting level
Set monthly spending limits per category
Real-time budget progress tracking with visual indicators

Dashboard & Analytics

Balance, total income, and total expense KPI cards
Doughnut chart of expenses by category (NGX-Charts)
Income vs. expenses bar chart by month
All values update in real time via combineLatest + async pipe

Multi-Currency Display

Switch between USD ($), EUR (€), and RUB (₽) at any time
Conversion applied globally across the entire UI instantly

Filtering & History

Filter transactions by type (income / expense), category, and date range
Filters applied reactively without page reload
Dedicated history page with monthly comparison chart
