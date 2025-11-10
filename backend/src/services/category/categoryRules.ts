import { dbRequest, ExpectedReturn } from '@/utils/database';
import {
  CategoryCreateRequest,
  CategoryListRequest,
  CategoryGetRequest,
  CategoryUpdateRequest,
  CategoryDeleteRequest,
  CategoryArchiveRequest,
  CategoryReorderRequest,
} from './categoryTypes';

/**
 * @summary
 * Creates a new category with all specified parameters
 *
 * @function categoryCreate
 * @module category
 *
 * @param {CategoryCreateRequest} params - Category creation parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idUser - User identifier
 * @param {string} params.name - Category name
 * @param {string} params.color - Category color
 * @param {string} params.description - Category description
 * @param {number | null} params.idCategoryParent - Parent category identifier
 *
 * @returns {Promise<{ idCategory: number }>} Created category identifier
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {DatabaseError} When database operation fails
 */
export async function categoryCreate(
  params: CategoryCreateRequest
): Promise<{ idCategory: number }> {
  const result = await dbRequest('[functional].[spCategoryCreate]', params, ExpectedReturn.Single);

  return result;
}

/**
 * @summary
 * Lists all categories for a specific user with optional filtering
 *
 * @function categoryList
 * @module category
 *
 * @param {CategoryListRequest} params - Category list parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idUser - User identifier
 * @param {number | null} params.status - Filter by status
 * @param {boolean} params.includeArchived - Include archived categories
 *
 * @returns {Promise<any[]>} List of categories
 *
 * @throws {DatabaseError} When database operation fails
 */
export async function categoryList(params: CategoryListRequest): Promise<any[]> {
  const result = await dbRequest('[functional].[spCategoryList]', params, ExpectedReturn.Multi);

  return result;
}

/**
 * @summary
 * Retrieves detailed information for a specific category
 *
 * @function categoryGet
 * @module category
 *
 * @param {CategoryGetRequest} params - Category get parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idCategory - Category identifier
 *
 * @returns {Promise<object>} Category details with related data
 *
 * @throws {ValidationError} When category doesn't exist
 * @throws {DatabaseError} When database operation fails
 */
export async function categoryGet(params: CategoryGetRequest): Promise<object> {
  const result = await dbRequest(
    '[functional].[spCategoryGet]',
    params,
    ExpectedReturn.Multi,
    undefined,
    ['category', 'subcategories']
  );

  return {
    category: result.category && result.category.length > 0 ? result.category[0] : null,
    subcategories: result.subcategories || [],
  };
}

/**
 * @summary
 * Updates an existing category
 *
 * @function categoryUpdate
 * @module category
 *
 * @param {CategoryUpdateRequest} params - Category update parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idCategory - Category identifier
 * @param {string} params.name - Category name
 * @param {string} params.color - Category color
 * @param {string} params.description - Category description
 * @param {number | null} params.idCategoryParent - Parent category identifier
 * @param {number} params.order - Display order
 *
 * @returns {Promise<{ success: boolean }>} Update success indicator
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {DatabaseError} When database operation fails
 */
export async function categoryUpdate(params: CategoryUpdateRequest): Promise<{ success: boolean }> {
  const result = await dbRequest('[functional].[spCategoryUpdate]', params, ExpectedReturn.Single);

  return result;
}

/**
 * @summary
 * Deletes a category and handles associated tasks
 *
 * @function categoryDelete
 * @module category
 *
 * @param {CategoryDeleteRequest} params - Category delete parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idCategory - Category identifier
 * @param {number | null} params.idCategoryTarget - Target category for tasks
 * @param {boolean} params.deleteTasks - Delete tasks flag
 *
 * @returns {Promise<{ success: boolean }>} Delete success indicator
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {DatabaseError} When database operation fails
 */
export async function categoryDelete(params: CategoryDeleteRequest): Promise<{ success: boolean }> {
  const result = await dbRequest('[functional].[spCategoryDelete]', params, ExpectedReturn.Single);

  return result;
}

/**
 * @summary
 * Archives or unarchives a category
 *
 * @function categoryArchive
 * @module category
 *
 * @param {CategoryArchiveRequest} params - Category archive parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idCategory - Category identifier
 * @param {boolean} params.archive - Archive flag
 *
 * @returns {Promise<{ success: boolean }>} Archive success indicator
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {DatabaseError} When database operation fails
 */
export async function categoryArchive(
  params: CategoryArchiveRequest
): Promise<{ success: boolean }> {
  const result = await dbRequest('[functional].[spCategoryArchive]', params, ExpectedReturn.Single);

  return result;
}

/**
 * @summary
 * Reorders categories based on provided order array
 *
 * @function categoryReorder
 * @module category
 *
 * @param {CategoryReorderRequest} params - Category reorder parameters
 * @param {number} params.idAccount - Account identifier
 * @param {Array} params.orderData - Array of category IDs and order values
 *
 * @returns {Promise<{ success: boolean }>} Reorder success indicator
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {DatabaseError} When database operation fails
 */
export async function categoryReorder(
  params: CategoryReorderRequest
): Promise<{ success: boolean }> {
  const transformedParams = {
    idAccount: params.idAccount,
    orderJson: JSON.stringify(params.orderData),
  };

  const result = await dbRequest(
    '[functional].[spCategoryReorder]',
    transformedParams,
    ExpectedReturn.Single
  );

  return result;
}
