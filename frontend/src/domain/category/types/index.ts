export interface Category {
  idCategory: number;
  name: string;
  color: string;
  description: string;
  idCategoryParent: number | null;
  status: number;
  order: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  subcategories?: Category[];
}

export interface CreateCategoryDto {
  name: string;
  color?: string;
  description?: string;
  idCategoryParent?: number | null;
}

export interface UpdateCategoryDto {
  name: string;
  color: string;
  description?: string;
  idCategoryParent?: number | null;
  order: number;
}

export interface CategoryListParams {
  status?: number;
  includeArchived?: boolean;
}

export interface CategoryListResponse {
  data: Category[];
}

export interface CategoryDetailResponse {
  data: {
    category: Category;
    subcategories: Category[];
  };
}

export interface DeleteCategoryDto {
  idCategoryTarget?: number | null;
  deleteTasks?: boolean;
}

export interface ArchiveCategoryDto {
  archive: boolean;
}

export const STATUS_LABELS: Record<number, string> = {
  0: 'Ativo',
  1: 'Arquivado',
};

export const DEFAULT_CATEGORY_COLOR = '#3498db';
