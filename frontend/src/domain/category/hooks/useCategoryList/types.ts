import type { Category, CategoryListParams } from '../../types';

export interface UseCategoryListOptions {
  filters?: CategoryListParams;
  enabled?: boolean;
}

export interface UseCategoryListReturn {
  categories: Category[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
