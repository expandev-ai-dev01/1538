import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import type { UseCategoryArchiveOptions, UseCategoryArchiveReturn } from './types';

export const useCategoryArchive = (
  options: UseCategoryArchiveOptions = {}
): UseCategoryArchiveReturn => {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => categoryService.archive(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      onError?.(err);
    },
  });

  return {
    archive: (id, data) => mutateAsync({ id, data }),
    isArchiving: isPending,
    error: error as Error | null,
  };
};
