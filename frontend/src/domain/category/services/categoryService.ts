import { authenticatedClient } from '@/core/lib/api';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryListParams,
  CategoryListResponse,
  CategoryDetailResponse,
  DeleteCategoryDto,
  ArchiveCategoryDto,
} from '../types';

export const categoryService = {
  async list(params?: CategoryListParams): Promise<Category[]> {
    const response = await authenticatedClient.get<CategoryListResponse>('/category', { params });
    return response.data.data;
  },

  async getById(id: number): Promise<CategoryDetailResponse['data']> {
    const response = await authenticatedClient.get<CategoryDetailResponse>(`/category/${id}`);
    return response.data.data;
  },

  async create(data: CreateCategoryDto): Promise<{ idCategory: number }> {
    const response = await authenticatedClient.post<{ data: { idCategory: number } }>(
      '/category',
      data
    );
    return response.data.data;
  },

  async update(id: number, data: UpdateCategoryDto): Promise<{ success: boolean }> {
    const response = await authenticatedClient.put<{ data: { success: boolean } }>(
      `/category/${id}`,
      data
    );
    return response.data.data;
  },

  async delete(id: number, data: DeleteCategoryDto): Promise<{ success: boolean }> {
    const response = await authenticatedClient.delete<{ data: { success: boolean } }>(
      `/category/${id}`,
      { data }
    );
    return response.data.data;
  },

  async archive(id: number, data: ArchiveCategoryDto): Promise<{ success: boolean }> {
    const response = await authenticatedClient.patch<{ data: { success: boolean } }>(
      `/category/${id}/archive`,
      data
    );
    return response.data.data;
  },
};
