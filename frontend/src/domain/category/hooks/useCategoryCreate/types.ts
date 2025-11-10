import type { CreateCategoryDto } from '../../types';

export interface UseCategoryCreateOptions {
  onSuccess?: (data: { idCategory: number }) => void;
  onError?: (error: Error) => void;
}

export interface UseCategoryCreateReturn {
  create: (data: CreateCategoryDto) => Promise<{ idCategory: number }>;
  isCreating: boolean;
  error: Error | null;
}
