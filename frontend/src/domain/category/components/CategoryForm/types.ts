import type { CreateCategoryDto, UpdateCategoryDto, Category } from '../../types';

export interface CategoryFormProps {
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<Category>;
  mode?: 'create' | 'edit';
  categories?: Category[];
}
