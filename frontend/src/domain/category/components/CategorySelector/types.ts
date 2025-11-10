import type { Category } from '../../types';

export interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: number | null;
  onSelect: (categoryId: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  allowNull?: boolean;
}
