import { STATUS_LABELS } from '../../types';
import type { CategoryListProps } from './types';

export const CategoryList = (props: CategoryListProps) => {
  const {
    categories,
    isLoading = false,
    onCategoryClick,
    onEdit,
    onDelete,
    onArchive,
    showActions = true,
  } = props;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhuma categoria encontrada</p>
        <p className="text-gray-400 text-sm mt-2">Crie sua primeira categoria para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div
          key={category.idCategory}
          onClick={() => onCategoryClick?.(category)}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                {category.description && (
                  <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {STATUS_LABELS[category.status]}
                  </span>
                  {category.taskCount !== undefined && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category.taskCount} {category.taskCount === 1 ? 'tarefa' : 'tarefas'}
                    </span>
                  )}
                  {category.isDefault && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Padrão
                    </span>
                  )}
                </div>
              </div>
            </div>
            {showActions && (
              <div className="flex gap-2">
                {onEdit && !category.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(category);
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Editar
                  </button>
                )}
                {onArchive && !category.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(category);
                    }}
                    className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                  >
                    {category.status === 0 ? 'Arquivar' : 'Desarquivar'}
                  </button>
                )}
                {onDelete && !category.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(category);
                    }}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Excluir
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
