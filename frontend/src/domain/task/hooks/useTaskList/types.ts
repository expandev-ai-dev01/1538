import type { Task, TaskListParams } from '../../types';

export interface UseTaskListOptions {
  filters?: TaskListParams;
  enabled?: boolean;
}

export interface UseTaskListReturn {
  tasks: Task[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
