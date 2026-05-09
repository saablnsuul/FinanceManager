import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, map } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NestedTreeControl } from '@angular/cdk/tree';
import { CategoryService } from '../../core/services/category.service';
import { BudgetService } from '../../core/services/budget.service';
import { Category } from '../../models/category.model';

interface CategoryNode extends Category {
  children?: CategoryNode[];
  budgetLimit?: number;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    AsyncPipe, ReactiveFormsModule,
    MatCardModule, MatTreeModule, MatIconModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  template: `
    <div class="categories-layout">
      <mat-card class="tree-card">
        <mat-card-title>Category Tree</mat-card-title>
        <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
          <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding>
            <button mat-icon-button disabled></button>
            <mat-icon [style.color]="node.color">{{ node.icon }}</mat-icon>
            <span class="cat-label">{{ node.name }}</span>
            @if (node.budgetLimit) {
              <span class="budget-chip">${{ node.budgetLimit }}/mo</span>
            }
            <button mat-icon-button color="warn" (click)="remove(node.id)" class="delete-btn">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-tree-node>

          <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChildren">
            <div class="mat-tree-node">
              <button mat-icon-button matTreeNodeToggle>
                <mat-icon>{{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}</mat-icon>
              </button>
              <mat-icon [style.color]="node.color">{{ node.icon }}</mat-icon>
              <span class="cat-label">{{ node.name }}</span>
              @if (node.budgetLimit) {
                <span class="budget-chip">${{ node.budgetLimit }}/mo</span>
              }
              <button mat-icon-button color="warn" (click)="remove(node.id)" class="delete-btn">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            <div [class.hidden]="!treeControl.isExpanded(node)" role="group">
              <ng-container matTreeNodeOutlet />
            </div>
          </mat-nested-tree-node>
        </mat-tree>
      </mat-card>

      <div class="side-forms">
        <mat-card>
          <mat-card-title>Add Category</mat-card-title>
          <form [formGroup]="addForm" (ngSubmit)="addCategory()" class="cat-form">
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Parent category</mat-label>
              <mat-select formControlName="parentId">
                <mat-option [value]="null">— Root —</mat-option>
                @for (cat of rootCategories$ | async; track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Icon (Material icon name)</mat-label>
              <input matInput formControlName="icon" placeholder="e.g. shopping_cart" />
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="addForm.invalid">
              Add Category
            </button>
          </form>
        </mat-card>

        <mat-card>
          <mat-card-title>Set Monthly Budget</mat-card-title>
          <form [formGroup]="budgetForm" (ngSubmit)="setBudget()" class="cat-form">
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="categoryId">
                @for (cat of allCategories$ | async; track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Monthly limit ($)</mat-label>
              <input matInput type="number" formControlName="limit" min="1" />
            </mat-form-field>
            <button mat-raised-button color="accent" type="submit" [disabled]="budgetForm.invalid">
              Save Budget
            </button>
          </form>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .categories-layout { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
    .tree-card { min-height: 400px; }
    .side-forms { display: flex; flex-direction: column; gap: 16px; }
    .cat-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
    .cat-label { margin: 0 8px; flex: 1; }
    .budget-chip { font-size: 11px; background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; }
    .delete-btn { opacity: 0; transition: opacity 0.15s; }
    .mat-tree-node:hover .delete-btn, .mat-nested-tree-node:hover .delete-btn { opacity: 1; }
    .hidden { display: none; }
  `],
})
export class CategoriesComponent {
  private categoryService = inject(CategoryService);
  private budgetService = inject(BudgetService);
  private fb = inject(FormBuilder);

  treeControl = new NestedTreeControl<CategoryNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<CategoryNode>();

  allCategories$ = this.categoryService.categories$;
  rootCategories$ = this.categoryService.categories$.pipe(
    map(cats => cats.filter(c => c.parentId === null))
  );

  addForm = this.fb.group({
    name: ['', Validators.required],
    parentId: [null],
    icon: ['label'],
  });

  budgetForm = this.fb.group({
    categoryId: [null, Validators.required],
    limit: [null, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    combineLatest([
      this.categoryService.categories$,
      this.budgetService.budgets$,
    ]).pipe(
      map(([cats, budgets]) => this.buildTree(cats, budgets))
    ).subscribe(tree => {
      this.dataSource.data = tree;
      this.treeControl.dataNodes = tree;
    });
  }

  hasChildren = (_: number, node: CategoryNode) =>
    !!node.children && node.children.length > 0;

  private buildTree(cats: Category[], budgets: any[]): CategoryNode[] {
    const map = new Map<string, CategoryNode>();
    cats.forEach(c => {
      const budget = budgets.find(b => b.categoryId === c.id);
      map.set(c.id, { ...c, children: [], budgetLimit: budget?.monthlyLimit });
    });
    const roots: CategoryNode[] = [];
    map.forEach(node => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children!.push(node);
      } else if (!node.parentId) {
        roots.push(node);
      }
    });
    return roots;
  }

  addCategory(): void {
    if (this.addForm.valid) {
      const v = this.addForm.value;
      this.categoryService.add({
        name: v.name!,
        parentId: v.parentId ?? null,
        icon: v.icon || 'label',
        color: '#78909C',
      });
      this.addForm.reset({ icon: 'label', parentId: null });
    }
  }

  setBudget(): void {
    if (this.budgetForm.valid) {
      const v = this.budgetForm.value;
      this.budgetService.setBudget(v.categoryId!, v.limit!);
      this.budgetForm.reset();
    }
  }

  remove(id: string): void {
    this.categoryService.remove(id);
  }
}