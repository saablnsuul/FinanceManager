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
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
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