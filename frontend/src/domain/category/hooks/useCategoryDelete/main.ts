import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import type { UseCategoryDeleteOptions, UseCategoryDeleteReturn } from './types';

export const useCategoryDelete = (
  options: UseCategoryDeleteOptions = {}
): UseCategoryDeleteReturn => {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => categoryService.delete(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      onError?.(err);
    },
  });

  return {
    deleteCategory: (id, data) => mutateAsync({ id, data }),
    isDeleting: isPending,
    error: error as Error | null,
  };
};
