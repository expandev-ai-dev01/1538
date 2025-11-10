import type { CreateTaskDto } from '../../types';

export interface TaskFormProps {
  onSubmit: (data: CreateTaskDto) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<CreateTaskDto>;
}
