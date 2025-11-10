import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import type { UseCategoryUpdateOptions, UseCategoryUpdateReturn } from './types';

export const useCategoryUpdate = (
  options: UseCategoryUpdateOptions = {}
): UseCategoryUpdateReturn => {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => categoryService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      onError?.(err);
    },
  });

  return {
    update: (id, data) => mutateAsync({ id, data }),
    isUpdating: isPending,
    error: error as Error | null,
  };
};
