import { useState } from 'react';
import { CategoryList } from '@/domain/category/components/CategoryList';
import { CategoryForm } from '@/domain/category/components/CategoryForm';
import { useCategoryList } from '@/domain/category/hooks/useCategoryList';
import { useCategoryCreate } from '@/domain/category/hooks/useCategoryCreate';
import { useCategoryUpdate } from '@/domain/category/hooks/useCategoryUpdate';
import { useCategoryDelete } from '@/domain/category/hooks/useCategoryDelete';
import { useCategoryArchive } from '@/domain/category/hooks/useCategoryArchive';
import { LoadingSpinner } from '@/core/components/LoadingSpinner';
import { ErrorMessage } from '@/core/components/ErrorMessage';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  DeleteCategoryDto,
} from '@/domain/category/types';
import type { CategoryManagementPageProps } from './types';

export const CategoryManagementPage = (props: CategoryManagementPageProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const { categories, isLoading, error, refetch } = useCategoryList({
    filters: { includeArchived: showArchived },
  });

  const { create, isCreating } = useCategoryCreate({
    onSuccess: () => {
      setShowForm(false);
      refetch();
    },
    onError: (error: Error) => {
      alert(`Erro ao criar categoria: ${error.message}`);
    },
  });

  const { update, isUpdating } = useCategoryUpdate({
    onSuccess: () => {
      setEditingCategory(null);
      setShowForm(false);
      refetch();
    },
    onError: (error: Error) => {
      alert(`Erro ao atualizar categoria: ${error.message}`);
    },
  });

  const { deleteCategory, isDeleting } = useCategoryDelete({
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      alert(`Erro ao excluir categoria: ${error.message}`);
    },
  });

  const { archive, isArchiving } = useCategoryArchive({
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      alert(`Erro ao arquivar categoria: ${error.message}`);
    },
  });

  const handleCreateClick = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    try {
      if (editingCategory) {
        await update(editingCategory.idCategory, data as UpdateCategoryDto);
      } else {
        await create(data as CreateCategoryDto);
      }
    } catch (error: unknown) {
      console.error('Error submitting category form:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleDeleteClick = async (category: Category) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a categoria "${category.name}"?\n\nEscolha uma opção:\n- OK: Mover tarefas para categoria padrão\n- Cancelar: Não excluir`
    );

    if (!confirmDelete) return;

    const deleteData: DeleteCategoryDto = {
      deleteTasks: false,
      idCategoryTarget: null,
    };

    try {
      await deleteCategory(category.idCategory, deleteData);
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
    }
  };

  const handleArchiveClick = async (category: Category) => {
    const action = category.status === 0 ? 'arquivar' : 'desarquivar';
    const confirmArchive = window.confirm(
      `Tem certeza que deseja ${action} a categoria "${category.name}"?`
    );

    if (!confirmArchive) return;

    try {
      await archive(category.idCategory, { archive: category.status === 0 });
    } catch (error: unknown) {
      console.error('Error archiving category:', error);
    }
  };

  if (error) {
    return (
      <ErrorMessage title="Erro ao carregar categorias" message={error.message} onRetry={refetch} />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gerenciar Categorias</h1>
          <p className="text-lg text-gray-600">
            Organize suas tarefas em categorias personalizadas
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            {showArchived ? 'Ocultar Arquivadas' : 'Mostrar Arquivadas'}
          </button>
          <button
            onClick={handleCreateClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            + Nova Categoria
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {editingCategory ? 'Editar Categoria' : 'Criar Nova Categoria'}
          </h2>
          <CategoryForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={isCreating || isUpdating}
            initialData={editingCategory || undefined}
            mode={editingCategory ? 'edit' : 'create'}
            categories={categories || []}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <CategoryList
          categories={categories || []}
          isLoading={isLoading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onArchive={handleArchiveClick}
          showActions={true}
        />
      )}
    </div>
  );
};

export default CategoryManagementPage;
