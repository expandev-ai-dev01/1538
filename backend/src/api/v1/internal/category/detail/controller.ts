import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import { categoryGet, categoryUpdate, categoryDelete, categoryArchive } from '@/services/category';
import { zNullableDescription, zNullableFK } from '@/utils/zodValidation';

const securable = 'CATEGORY';

/**
 * @api {get} /api/v1/internal/category/:id Get Category Details
 * @apiName GetCategory
 * @apiGroup Category
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves detailed information for a specific category
 *
 * @apiParam {Number} id Category identifier
 *
 * @apiSuccess {Object} category Category details
 * @apiSuccess {Array} subcategories Category subcategories
 *
 * @apiError {String} categoryDoesntExist Category not found
 * @apiError {String} UnauthorizedError User lacks permission
 */
export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
  });

  const [validated, error] = await operation.read(req, paramsSchema);

  if (!validated) {
    return next(error);
  }

  try {
    const { credential, params } = validated;

    const result = await categoryGet({
      idAccount: credential.idAccount,
      idCategory: params.id,
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
 * @api {put} /api/v1/internal/category/:id Update Category
 * @apiName UpdateCategory
 * @apiGroup Category
 * @apiVersion 1.0.0
 *
 * @apiDescription Updates an existing category
 *
 * @apiParam {Number} id Category identifier
 * @apiParam {String} name Category name (2-50 characters)
 * @apiParam {String} color Hexadecimal color code
 * @apiParam {String} [description] Category description (max 200 characters)
 * @apiParam {Number} [idCategoryParent] Parent category identifier
 * @apiParam {Number} order Display order
 *
 * @apiSuccess {Boolean} success Update success indicator
 *
 * @apiError {String} categoryDoesntExist Category not found
 * @apiError {String} cannotModifyDefaultCategory Cannot modify default category
 */
export async function putHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'UPDATE' }]);

  const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
  });

  const bodySchema = z.object({
    name: z.string().min(2).max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    description: zNullableDescription,
    idCategoryParent: zNullableFK,
    order: z.number().int().positive(),
  });

  const [validated, error] = await operation.update(req, paramsSchema.merge(bodySchema));

  if (!validated) {
    return next(error);
  }

  try {
    const { credential, params } = validated;

    const result = await categoryUpdate({
      idAccount: credential.idAccount,
      idCategory: params.id,
      name: params.name,
      color: params.color,
      description: params.description || '',
      idCategoryParent: params.idCategoryParent || null,
      order: params.order,
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
 * @api {delete} /api/v1/internal/category/:id Delete Category
 * @apiName DeleteCategory
 * @apiGroup Category
 * @apiVersion 1.0.0
 *
 * @apiDescription Deletes a category and handles associated tasks
 *
 * @apiParam {Number} id Category identifier
 * @apiParam {Number} [idCategoryTarget] Target category to move tasks to
 * @apiParam {Boolean} [deleteTasks] If true, delete tasks; if false, move to target
 *
 * @apiSuccess {Boolean} success Delete success indicator
 *
 * @apiError {String} categoryDoesntExist Category not found
 * @apiError {String} cannotDeleteDefaultCategory Cannot delete default category
 */
export async function deleteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'DELETE' }]);

  const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
  });

  const bodySchema = z.object({
    idCategoryTarget: zNullableFK,
    deleteTasks: z.boolean().optional(),
  });

  const [validated, error] = await operation.delete(req, paramsSchema.merge(bodySchema));

  if (!validated) {
    return next(error);
  }

  try {
    const { credential, params } = validated;

    const result = await categoryDelete({
      idAccount: credential.idAccount,
      idCategory: params.id,
      idCategoryTarget: params.idCategoryTarget || null,
      deleteTasks: params.deleteTasks || false,
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
 * @api {patch} /api/v1/internal/category/:id/archive Archive Category
 * @apiName ArchiveCategory
 * @apiGroup Category
 * @apiVersion 1.0.0
 *
 * @apiDescription Archives or unarchives a category
 *
 * @apiParam {Number} id Category identifier
 * @apiParam {Boolean} archive If true, archive; if false, unarchive
 *
 * @apiSuccess {Boolean} success Archive success indicator
 *
 * @apiError {String} categoryDoesntExist Category not found
 * @apiError {String} cannotArchiveDefaultCategory Cannot archive default category
 */
export async function patchHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'UPDATE' }]);

  const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
  });

  const bodySchema = z.object({
    archive: z.boolean(),
  });

  const [validated, error] = await operation.update(req, paramsSchema.merge(bodySchema));

  if (!validated) {
    return next(error);
  }

  try {
    const { credential, params } = validated;

    const result = await categoryArchive({
      idAccount: credential.idAccount,
      idCategory: params.id,
      archive: params.archive,
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
