import { dbRequest, ExpectedReturn, IRecordSet } from '@/utils/database';
import { TaskCreateRequest, TaskListRequest, TaskGetRequest } from './taskTypes';

/**
 * @summary
 * Creates a new task with all specified parameters
 *
 * @function taskCreate
 * @module task
 *
 * @param {TaskCreateRequest} params - Task creation parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idUser - User identifier
 * @param {string} params.title - Task title
 * @param {string} params.description - Task description
 * @param {Date | null} params.dueDate - Task due date
 * @param {number} params.priority - Priority level
 * @param {object | null} params.recurrence - Recurrence configuration
 * @param {Date | null} params.reminderDateTime - Reminder date and time
 *
 * @returns {Promise<{ idTask: number }>} Created task identifier
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {DatabaseError} When database operation fails
 */
export async function taskCreate(params: TaskCreateRequest): Promise<{ idTask: number }> {
  const transformedParams = {
    idAccount: params.idAccount,
    idUser: params.idUser,
    title: params.title,
    description: params.description,
    dueDate: params.dueDate,
    priority: params.priority,
    recurrenceJson: params.recurrence ? JSON.stringify(params.recurrence) : null,
    reminderDateTime: params.reminderDateTime,
  };

  const result = await dbRequest(
    '[functional].[spTaskCreate]',
    transformedParams,
    ExpectedReturn.Single
  );

  return result;
}

/**
 * @summary
 * Lists all tasks for a specific user with optional filtering
 *
 * @function taskList
 * @module task
 *
 * @param {TaskListRequest} params - Task list parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idUser - User identifier
 * @param {number | null} params.status - Filter by status
 * @param {number | null} params.priority - Filter by priority
 *
 * @returns {Promise<any[]>} List of tasks
 *
 * @throws {DatabaseError} When database operation fails
 */
export async function taskList(params: TaskListRequest): Promise<any[]> {
  const result = await dbRequest('[functional].[spTaskList]', params, ExpectedReturn.Multi);

  return result;
}

/**
 * @summary
 * Retrieves detailed information for a specific task
 *
 * @function taskGet
 * @module task
 *
 * @param {TaskGetRequest} params - Task get parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idTask - Task identifier
 *
 * @returns {Promise<object>} Task details with related data
 *
 * @throws {ValidationError} When task doesn't exist
 * @throws {DatabaseError} When database operation fails
 */
export async function taskGet(params: TaskGetRequest): Promise<object> {
  const result = await dbRequest(
    '[functional].[spTaskGet]',
    params,
    ExpectedReturn.Multi,
    undefined,
    ['task', 'attachments', 'recurrence', 'reminders', 'subtasks']
  );

  return {
    task: result.task && result.task.length > 0 ? result.task[0] : null,
    attachments: result.attachments || [],
    recurrence: result.recurrence && result.recurrence.length > 0 ? result.recurrence[0] : null,
    reminders: result.reminders || [],
    subtasks: result.subtasks || [],
  };
}
