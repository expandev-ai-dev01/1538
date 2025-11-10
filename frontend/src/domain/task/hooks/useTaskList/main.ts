import { useQuery } from '@tanstack/react-query';
import { taskService } from '../../services/taskService';
import type { UseTaskListOptions, UseTaskListReturn } from './types';

export const useTaskList = (options: UseTaskListOptions = {}): UseTaskListReturn => {
  const { filters, enabled = true } = options;

  const queryKey = ['tasks', filters];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => taskService.list(filters),
    enabled,
  });

  return {
    tasks: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
