export * from './components/CategoryForm';
export * from './components/CategoryList';
export * from './components/CategorySelector';
export * from './hooks/useCategoryList';
export * from './hooks/useCategoryCreate';
export * from './hooks/useCategoryUpdate';
export * from './hooks/useCategoryDelete';
export * from './hooks/useCategoryArchive';
export * from './services/categoryService';
export * from './types';

export const moduleMetadata = {
  name: 'category',
  domain: 'functional',
  version: '1.0.0',
  publicComponents: ['CategoryForm', 'CategoryList', 'CategorySelector'],
  publicHooks: [
    'useCategoryList',
    'useCategoryCreate',
    'useCategoryUpdate',
    'useCategoryDelete',
    'useCategoryArchive',
  ],
  publicServices: ['categoryService'],
  dependencies: {
    internal: ['@/core/lib/api', '@/core/lib/queryClient'],
    external: ['react', 'react-hook-form', 'zod', '@tanstack/react-query'],
    domains: [],
  },
  exports: {
    components: ['CategoryForm', 'CategoryList', 'CategorySelector'],
    hooks: [
      'useCategoryList',
      'useCategoryCreate',
      'useCategoryUpdate',
      'useCategoryDelete',
      'useCategoryArchive',
    ],
    services: ['categoryService'],
    types: ['Category', 'CreateCategoryDto', 'UpdateCategoryDto', 'CategoryListParams'],
  },
} as const;
