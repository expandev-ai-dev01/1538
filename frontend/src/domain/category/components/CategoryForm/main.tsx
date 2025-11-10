import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CategoryFormProps } from './types';
import type { CreateCategoryDto } from '../../types';
import { DEFAULT_CATEGORY_COLOR } from '../../types';

const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'O nome contém caracteres não permitidos'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'O código de cor fornecido não é válido')
    .optional(),
  description: z.string().max(200, 'A descrição deve ter no máximo 200 caracteres').optional(),
  idCategoryParent: z.number().int().positive().nullable().optional(),
  order: z.number().int().positive().optional(),
});

export const CategoryForm = (props: CategoryFormProps) => {
  const {
    onSubmit,
    onCancel,
    isSubmitting = false,
    initialData,
    mode = 'create',
    categories = [],
  } = props;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCategoryDto & { order?: number }>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || DEFAULT_CATEGORY_COLOR,
      description: initialData?.description || '',
      idCategoryParent: initialData?.idCategoryParent || null,
      order: initialData?.order || 1,
    },
  });

  const onFormSubmit = (data: CreateCategoryDto & { order?: number }) => {
    const submitData: any = {
      name: data.name,
      color: data.color || DEFAULT_CATEGORY_COLOR,
      description: data.description || undefined,
      idCategoryParent: data.idCategoryParent || null,
    };

    if (mode === 'edit' && data.order) {
      submitData.order = data.order;
    }

    onSubmit(submitData);
  };

  const availableParentCategories = categories.filter(
    (cat) => !initialData || cat.idCategory !== initialData.idCategory
  );

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Digite o nome da categoria"
          disabled={isSubmitting}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
          Cor <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            id="color"
            type="color"
            {...register('color')}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
            disabled={isSubmitting}
          />
          <input
            type="text"
            {...register('color')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="#3498db"
            disabled={isSubmitting}
          />
        </div>
        {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Descreva a categoria (opcional)"
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="idCategoryParent" className="block text-sm font-medium text-gray-700 mb-2">
          Categoria Pai (opcional)
        </label>
        <select
          id="idCategoryParent"
          {...register('idCategoryParent', { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        >
          <option value="">Nenhuma (categoria raiz)</option>
          {availableParentCategories.map((cat) => (
            <option key={cat.idCategory} value={cat.idCategory}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {mode === 'edit' && (
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
            Ordem de Exibição
          </label>
          <input
            id="order"
            type="number"
            min="1"
            {...register('order', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>
      )}

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
          {isSubmitting
            ? mode === 'create'
              ? 'Criando...'
              : 'Salvando...'
            : mode === 'create'
            ? 'Criar Categoria'
            : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
};
