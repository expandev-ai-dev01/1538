import type { UpdateCategoryDto } from '../../types';

export interface UseCategoryUpdateOptions {
  onSuccess?: (data: { success: boolean }) => void;
  onError?: (error: Error) => void;
}

export interface UseCategoryUpdateReturn {
  update: (id: number, data: UpdateCategoryDto) => Promise<{ success: boolean }>;
  isUpdating: boolean;
  error: Error | null;
}
