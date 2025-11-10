import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../../services/taskService';
import type { UseTaskCreateOptions, UseTaskCreateReturn } from './types';

export const useTaskCreate = (options: UseTaskCreateOptions = {}): UseTaskCreateReturn => {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: taskService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
