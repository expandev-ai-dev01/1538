import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TaskFormProps } from './types';
import type { CreateTaskDto } from '../../types';

const taskFormSchema = z.object({
  title: z
    .string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  description: z.string().max(500, 'A descrição deve ter no máximo 500 caracteres').optional(),
  dueDate: z.string().nullable().optional(),
  priority: z.number().int().min(0).max(2).optional(),
  reminderDateTime: z.string().nullable().optional(),
});

export const TaskForm = (props: TaskFormProps) => {
  const { onSubmit, onCancel, isSubmitting = false, initialData } = props;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskDto>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 1,
      dueDate: initialData?.dueDate || null,
      reminderDateTime: initialData?.reminderDateTime || null,
    },
  });

  const onFormSubmit = (data: CreateTaskDto) => {
    const submitData: CreateTaskDto = {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority || 1,
      dueDate: data.dueDate || null,
      reminderDateTime: data.reminderDateTime || null,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Digite o título da tarefa"
          disabled={isSubmitting}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Descreva os detalhes da tarefa"
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
          Prioridade
        </label>
        <select
          id="priority"
          {...register('priority', { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        >
          <option value={0}>Baixa</option>
          <option value={1}>Média</option>
          <option value={2}>Alta</option>
        </select>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
          Data de Vencimento
        </label>
        <input
          id="dueDate"
          type="date"
          {...register('dueDate')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="reminderDateTime" className="block text-sm font-medium text-gray-700 mb-2">
          Lembrete
        </label>
        <input
          id="reminderDateTime"
          type="datetime-local"
          {...register('reminderDateTime')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Criando...' : 'Criar Tarefa'}
        </button>
      </div>
    </form>
  );
};
