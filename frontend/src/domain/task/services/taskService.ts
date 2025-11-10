import { authenticatedClient } from '@/core/lib/api';
import type {
  Task,
  CreateTaskDto,
  TaskListParams,
  TaskListResponse,
  TaskDetailResponse,
} from '../types';

export const taskService = {
  async list(params?: TaskListParams): Promise<Task[]> {
    const response = await authenticatedClient.get<TaskListResponse>('/task', { params });
    return response.data.data;
  },

  async getById(id: number): Promise<TaskDetailResponse['data']> {
    const response = await authenticatedClient.get<TaskDetailResponse>(`/task/${id}`);
    return response.data.data;
  },

  async create(data: CreateTaskDto): Promise<{ idTask: number }> {
    const response = await authenticatedClient.post<{ data: { idTask: number } }>('/task', data);
    return response.data.data;
  },
};
