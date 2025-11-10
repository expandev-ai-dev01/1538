import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import type { UseCategoryCreateOptions, UseCategoryCreateReturn } from './types';

export const useCategoryCreate = (
  options: UseCategoryCreateOptions = {}
): UseCategoryCreateReturn => {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: categoryService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      onError?.(err);
    },
  });

  return {
    create: mutateAsync,
    isCreating: isPending,
    error: error as Error | null,
  };
};
