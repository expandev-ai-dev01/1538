import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import { taskGet } from '@/services/task';

const securable = 'TASK';

/**
 * @api {get} /api/v1/internal/task/:id Get Task Details
 * @apiName GetTask
 * @apiGroup Task
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves detailed information for a specific task
 *
 * @apiParam {Number} id Task identifier
 *
 * @apiSuccess {Object} task Task details
 * @apiSuccess {Array} attachments Task attachments
 * @apiSuccess {Object} recurrence Recurrence configuration
 * @apiSuccess {Array} reminders Task reminders
 * @apiSuccess {Array} subtasks Task subtasks
 *
 * @apiError {String} taskDoesntExist Task not found
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

    const result = await taskGet({
      idAccount: credential.idAccount,
      idTask: params.id,
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
