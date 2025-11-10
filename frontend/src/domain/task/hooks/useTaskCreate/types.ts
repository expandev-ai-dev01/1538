import type { CreateTaskDto } from '../../types';

export interface UseTaskCreateOptions {
  onSuccess?: (data: { idTask: number }) => void;
  onError?: (error: Error) => void;
}

export interface UseTaskCreateReturn {
  create: (data: CreateTaskDto) => Promise<{ idTask: number }>;
  isCreating: boolean;
  error: Error | null;
}
