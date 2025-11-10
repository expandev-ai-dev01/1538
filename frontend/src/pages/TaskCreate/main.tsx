import { useNavigate } from 'react-router-dom';
import { TaskForm } from '@/domain/task/components/TaskForm';
import { useTaskCreate } from '@/domain/task/hooks/useTaskCreate';
import type { CreateTaskDto } from '@/domain/task/types';
import type { TaskCreatePageProps } from './types';

export const TaskCreatePage = (props: TaskCreatePageProps) => {
  const navigate = useNavigate();

  const { create, isCreating } = useTaskCreate({
    onSuccess: (data) => {
      navigate('/');
    },
    onError: (error: Error) => {
      alert(`Erro ao criar tarefa: ${error.message}`);
    },
  });

  const handleSubmit = async (data: CreateTaskDto) => {
    try {
      await create(data);
    } catch (error: unknown) {
      console.error('Error creating task:', error);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Nova Tarefa</h1>
        <p className="text-gray-600">Preencha os campos abaixo para criar uma nova tarefa</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <TaskForm onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isCreating} />
      </div>
    </div>
  );
};

export default TaskCreatePage;
