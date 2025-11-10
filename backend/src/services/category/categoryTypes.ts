/**
 * @interface CategoryCreateRequest
 * @description Request parameters for creating a new category
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idUser - User identifier
 * @property {string} name - Category name
 * @property {string} color - Category color (hexadecimal)
 * @property {string} description - Category description
 * @property {number | null} idCategoryParent - Parent category identifier
 */
export interface CategoryCreateRequest {
  idAccount: number;
  idUser: number;
  name: string;
  color: string;
  description: string;
  idCategoryParent: number | null;
}

/**
 * @interface CategoryListRequest
 * @description Request parameters for listing categories
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idUser - User identifier
 * @property {number | null} status - Filter by status
 * @property {boolean} includeArchived - Include archived categories
 */
export interface CategoryListRequest {
  idAccount: number;
  idUser: number;
  status: number | null;
  includeArchived: boolean;
}

/**
 * @interface CategoryGetRequest
 * @description Request parameters for getting category details
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idCategory - Category identifier
 */
export interface CategoryGetRequest {
  idAccount: number;
  idCategory: number;
}

/**
 * @interface CategoryUpdateRequest
 * @description Request parameters for updating a category
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idCategory - Category identifier
 * @property {string} name - Category name
 * @property {string} color - Category color (hexadecimal)
 * @property {string} description - Category description
 * @property {number | null} idCategoryParent - Parent category identifier
 * @property {number} order - Display order
 */
export interface CategoryUpdateRequest {
  idAccount: number;
  idCategory: number;
  name: string;
  color: string;
  description: string;
  idCategoryParent: number | null;
  order: number;
}

/**
 * @interface CategoryDeleteRequest
 * @description Request parameters for deleting a category
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idCategory - Category identifier
 * @property {number | null} idCategoryTarget - Target category for tasks
 * @property {boolean} deleteTasks - Delete tasks flag
 */
export interface CategoryDeleteRequest {
  idAccount: number;
  idCategory: number;
  idCategoryTarget: number | null;
  deleteTasks: boolean;
}

/**
 * @interface CategoryArchiveRequest
 * @description Request parameters for archiving a category
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idCategory - Category identifier
 * @property {boolean} archive - Archive flag
 */
export interface CategoryArchiveRequest {
  idAccount: number;
  idCategory: number;
  archive: boolean;
}

/**
 * @interface CategoryReorderRequest
 * @description Request parameters for reordering categories
 *
 * @property {number} idAccount - Account identifier
 * @property {Array<{idCategory: number, order: number}>} orderData - Order data array
 */
export interface CategoryReorderRequest {
  idAccount: number;
  orderData: Array<{ idCategory: number; order: number }>;
}

/**
 * @enum CategoryStatus
 * @description Category status enumeration
 */
export enum CategoryStatus {
  Active = 0,
  Archived = 1,
}
