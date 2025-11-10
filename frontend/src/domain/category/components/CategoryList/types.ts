import type { Category } from '../../types';

export interface CategoryListProps {
  categories: Category[];
  isLoading?: boolean;
  onCategoryClick?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onArchive?: (category: Category) => void;
  showActions?: boolean;
}
