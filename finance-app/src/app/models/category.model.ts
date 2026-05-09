export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  icon: string;
  color: string;
}