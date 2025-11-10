import { format } from 'date-fns';
import { PRIORITY_LABELS, STATUS_LABELS } from '../../types';
import type { TaskListProps } from './types';

export const TaskList = (props: TaskListProps) => {
  const { tasks, isLoading = false, onTaskClick } = props;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhuma tarefa encontrada</p>
        <p className="text-gray-400 text-sm mt-2">Crie sua primeira tarefa para começar</p>
      </div>
    );
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 2:
        return 'bg-red-100 text-red-800';
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 0:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 2:
        return 'bg-green-100 text-green-800';
      case 1:
        return 'bg-blue-100 text-blue-800';
      case 0:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.idTask}
          onClick={() => onTaskClick?.(task)}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
              {task.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {PRIORITY_LABELS[task.priority]}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    task.status
                  )}`}
                >
                  {STATUS_LABELS[task.status]}
                </span>
                {task.dueDate && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Vence: {format(new Date(task.dueDate), 'dd/MM/yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
