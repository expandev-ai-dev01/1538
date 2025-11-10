import type { Task } from '../../types';

export interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onTaskClick?: (task: Task) => void;
}
