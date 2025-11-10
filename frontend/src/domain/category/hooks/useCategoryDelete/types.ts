import type { DeleteCategoryDto } from '../../types';

export interface UseCategoryDeleteOptions {
  onSuccess?: (data: { success: boolean }) => void;
  onError?: (error: Error) => void;
}

export interface UseCategoryDeleteReturn {
  deleteCategory: (id: number, data: DeleteCategoryDto) => Promise<{ success: boolean }>;
  isDeleting: boolean;
  error: Error | null;
}
