export interface Task {
  idTask: number;
  title: string;
  description: string;
  dueDate: string | null;
  priority: number;
  status: number;
  createdAt: string;
  reminderDateTime: string | null;
  recurrence: TaskRecurrence | null;
}

export interface TaskRecurrence {
  type: number;
  interval?: number;
  weekDays?: string | null;
  monthDay?: number | null;
  startDate: string;
  endDate?: string | null;
  occurrenceCount?: number | null;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority?: number;
  recurrence?: TaskRecurrence | null;
  reminderDateTime?: string | null;
}

export interface TaskListParams {
  status?: number;
  priority?: number;
}

export interface TaskListResponse {
  data: Task[];
}

export interface TaskDetailResponse {
  data: {
    task: Task;
    attachments: any[];
    recurrence: TaskRecurrence | null;
    reminders: any[];
    subtasks: any[];
  };
}

export const PRIORITY_LABELS: Record<number, string> = {
  0: 'Baixa',
  1: 'Média',
  2: 'Alta',
};

export const STATUS_LABELS: Record<number, string> = {
  0: 'Pendente',
  1: 'Em Andamento',
  2: 'Concluída',
};

export const RECURRENCE_TYPE_LABELS: Record<number, string> = {
  0: 'Diária',
  1: 'Semanal',
  2: 'Mensal',
  3: 'Anual',
};
