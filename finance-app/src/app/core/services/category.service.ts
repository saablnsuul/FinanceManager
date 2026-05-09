import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categories$$ = new BehaviorSubject<Category[]>([
    { id: 'food', name: 'Food & Groceries', parentId: null, icon: 'restaurant', color: '#FF7043' },
    { id: 'food-cafe', name: 'Cafes & Restaurants', parentId: 'food', icon: 'local_cafe', color: '#FF8A65' },
    { id: 'food-delivery', name: 'Delivery', parentId: 'food', icon: 'delivery_dining', color: '#FFAB91' },
    { id: 'transport', name: 'Transport', parentId: null, icon: 'directions_car', color: '#42A5F5' },
    { id: 'transport-fuel', name: 'Fuel', parentId: 'transport', icon: 'local_gas_station', color: '#64B5F6' },
    { id: 'transport-public', name: 'Public Transit', parentId: 'transport', icon: 'directions_bus', color: '#90CAF9' },
    { id: 'salary', name: 'Salary', parentId: null, icon: 'payments', color: '#66BB6A' },
    { id: 'freelance', name: 'Freelance', parentId: null, icon: 'laptop', color: '#26A69A' },
    { id: 'housing', name: 'Housing', parentId: null, icon: 'home', color: '#AB47BC' },
    { id: 'housing-rent', name: 'Rent', parentId: 'housing', icon: 'house', color: '#BA68C8' },
    { id: 'housing-utilities', name: 'Utilities', parentId: 'housing', icon: 'electrical_services', color: '#CE93D8' },
    { id: 'entertainment', name: 'Entertainment', parentId: null, icon: 'movie', color: '#FFA726' },
  ]);

  readonly categories$ = this.categories$$.asObservable();

  getAll(): Category[] {
    return this.categories$$.getValue();
  }

  getById(id: string): Category | undefined {
    return this.categories$$.getValue().find(c => c.id === id);
  }

  getRoots(): Category[] {
    return this.categories$$.getValue().filter(c => c.parentId === null);
  }

  getChildren(parentId: string): Category[] {
    return this.categories$$.getValue().filter(c => c.parentId === parentId);
  }

  add(category: Omit<Category, 'id'>): void {
    const current = this.categories$$.getValue();
    this.categories$$.next([
      ...current,
      { ...category, id: crypto.randomUUID() },
    ]);
  }

  update(id: string, changes: Partial<Omit<Category, 'id'>>): void {
    this.categories$$.next(
      this.categories$$.getValue().map(c => c.id === id ? { ...c, ...changes } : c)
    );
  }

  remove(id: string): void {
    const all = this.categories$$.getValue();
    const toRemove = new Set<string>();
    const collect = (targetId: string) => {
      toRemove.add(targetId);
      all.filter(c => c.parentId === targetId).forEach(c => collect(c.id));
    };
    collect(id);
    this.categories$$.next(all.filter(c => !toRemove.has(c.id)));
  }
}