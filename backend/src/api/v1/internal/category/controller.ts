import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import { categoryCreate, categoryList } from '@/services/category';
import { zName, zNullableDescription, zNullableFK } from '@/utils/zodValidation';

const securable = 'CATEGORY';

/**
 * @api {post} /api/v1/internal/category Create Category
 * @apiName CreateCategory
 * @apiGroup Category
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new category with specified parameters
 *
 * @apiParam {String} name Category name (2-50 characters)
 * @apiParam {String} [color] Hexadecimal color code (default: #3498db)
 * @apiParam {String} [description] Category description (max 200 characters)
 * @apiParam {Number} [idCategoryParent] Parent category identifier
 *
 * @apiSuccess {Number} idCategory Created category identifier
 *
 * @apiError {String} nameRequired Name is required
 * @apiError {String} nameTooShort Name must be at least 2 characters
 * @apiError {String} nameTooLong Name must be at most 50 characters
 * @apiError {String} categoryNameAlreadyExists Category name already exists
 * @apiError {String} categoryLimitReached Maximum 50 categories reached
 */
export async function postHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'CREATE' }]);

  const bodySchema = z.object({
    name: z.string().min(2).max(50),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
    description: zNullableDescription,
    idCategoryParent: zNullableFK,
  });

  const [validated, error] = await operation.create(req, bodySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const { credential, params } = validated;

    const result = await categoryCreate({
      idAccount: credential.idAccount,
      idUser: credential.idUser,
      name: params.name,
      color: params.color || '#3498db',
      description: params.description || '',
      idCategoryParent: params.idCategoryParent || null,
    });

    res.json(successResponse(result));
  } catch (error: any) {
    if (error.number === 51000) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(StatusGeneralError);
    }
  }
}

/**
 * @api {get} /api/v1/internal/category List Categories
 * @apiName ListCategories
 * @apiGroup Category
 * @apiVersion 1.0.0
 *
 * @apiDescription Lists all categories for the authenticated user with optional filtering
 *
 * @apiParam {Number} [status] Filter by status (0=active, 1=archived)
 * @apiParam {Boolean} [includeArchived] Include archived categories (default: false)
 *
 * @apiSuccess {Array} categories List of categories with details
 *
 * @apiError {String} UnauthorizedError User lacks permission
 */
export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const querySchema = z.object({
    status: z.coerce.number().int().min(0).max(1).optional(),
    includeArchived: z.coerce.boolean().optional(),
  });

  const [validated, error] = await operation.read(req, querySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const { credential, params } = validated;

    const result = await categoryList({
      idAccount: credential.idAccount,
      idUser: credential.idUser,
      status: params.status || null,
      includeArchived: params.includeArchived || false,
    });

    res.json(successResponse(result));
  } catch (error: any) {
    if (error.number === 51000) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(StatusGeneralError);
    }
  }
}
