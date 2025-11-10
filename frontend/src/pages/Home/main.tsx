import { useNavigate } from 'react-router-dom';
import { TaskList } from '@/domain/task/components/TaskList';
import { useTaskList } from '@/domain/task/hooks/useTaskList';
import { LoadingSpinner } from '@/core/components/LoadingSpinner';
import { ErrorMessage } from '@/core/components/ErrorMessage';
import type { HomePageProps } from './types';

export const HomePage = (props: HomePageProps) => {
  const navigate = useNavigate();
  const { tasks, isLoading, error, refetch } = useTaskList();

  if (error) {
    return (
      <ErrorMessage title="Erro ao carregar tarefas" message={error.message} onRetry={refetch} />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Minhas Tarefas</h1>
          <p className="text-lg text-gray-600">Gerencie suas tarefas de forma eficiente</p>
        </div>
        <button
          onClick={() => navigate('/tasks/create')}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          + Nova Tarefa
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <TaskList
          tasks={tasks || []}
          isLoading={isLoading}
          onTaskClick={(task) => navigate(`/tasks/${task.idTask}`)}
        />
      )}
    </div>
  );
};

export default HomePage;
