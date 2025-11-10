import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import type { UseCategoryListOptions, UseCategoryListReturn } from './types';

export const useCategoryList = (options: UseCategoryListOptions = {}): UseCategoryListReturn => {
  const { filters, enabled = true } = options;

  const queryKey = ['categories', filters];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => categoryService.list(filters),
    enabled,
  });

  return {
    categories: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
