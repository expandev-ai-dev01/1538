import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import { taskCreate, taskList, taskGet } from '@/services/task';
import { zName, zNullableDescription, zNullableDate } from '@/utils/zodValidation';

const securable = 'TASK';

/**
 * @api {post} /api/v1/internal/task Create Task
 * @apiName CreateTask
 * @apiGroup Task
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new task with specified parameters
 *
 * @apiParam {String} title Task title (3-100 characters)
 * @apiParam {String} [description] Task description (max 500 characters)
 * @apiParam {Date} [dueDate] Task due date (must be future date)
 * @apiParam {Number} [priority] Priority level (0=low, 1=medium, 2=high)
 * @apiParam {Object} [recurrence] Recurrence configuration
 * @apiParam {DateTime} [reminderDateTime] Reminder date and time
 *
 * @apiSuccess {Number} idTask Created task identifier
 *
 * @apiError {String} titleRequired Title is required
 * @apiError {String} titleTooShort Title must be at least 3 characters
 * @apiError {String} titleTooLong Title must be at most 100 characters
 * @apiError {String} dueDateInPast Due date cannot be in the past
 */
export async function postHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'CREATE' }]);

  const bodySchema = z.object({
    title: zName,
    description: zNullableDescription,
    dueDate: zNullableDate,
    priority: z.number().int().min(0).max(2).optional(),
    recurrence: z
      .object({
        type: z.number().int().min(0).max(3),
        interval: z.number().int().min(1).optional(),
        weekDays: z.string().max(20).nullable().optional(),
        monthDay: z.number().int().min(1).max(31).nullable().optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().nullable().optional(),
        occurrenceCount: z.number().int().min(1).max(100).nullable().optional(),
      })
      .nullable()
      .optional(),
    reminderDateTime: z.coerce.date().nullable().optional(),
  });

  const [validated, error] = await operation.create(req, bodySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const { credential, params } = validated;

    const result = await taskCreate({
      idAccount: credential.idAccount,
      idUser: credential.idUser,
      title: params.title,
      description: params.description || '',
      dueDate: params.dueDate || null,
      priority: params.priority || 1,
      recurrence: params.recurrence || null,
      reminderDateTime: params.reminderDateTime || null,
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
 * @api {get} /api/v1/internal/task List Tasks
 * @apiName ListTasks
 * @apiGroup Task
 * @apiVersion 1.0.0
 *
 * @apiDescription Lists all tasks for the authenticated user with optional filtering
 *
 * @apiParam {Number} [status] Filter by status (0=pending, 1=in progress, 2=completed)
 * @apiParam {Number} [priority] Filter by priority (0=low, 1=medium, 2=high)
 *
 * @apiSuccess {Array} tasks List of tasks with details
 *
 * @apiError {String} UnauthorizedError User lacks permission
 */
export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const querySchema = z.object({
    status: z.coerce.number().int().min(0).max(2).optional(),
    priority: z.coerce.number().int().min(0).max(2).optional(),
  });

  const [validated, error] = await operation.read(req, querySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const { credential, params } = validated;

    const result = await taskList({
      idAccount: credential.idAccount,
      idUser: credential.idUser,
      status: params.status || null,
      priority: params.priority || null,
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
