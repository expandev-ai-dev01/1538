/**
 * @interface TaskCreateRequest
 * @description Request parameters for creating a new task
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idUser - User identifier
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {Date | null} dueDate - Task due date
 * @property {number} priority - Priority level (0=low, 1=medium, 2=high)
 * @property {TaskRecurrence | null} recurrence - Recurrence configuration
 * @property {Date | null} reminderDateTime - Reminder date and time
 */
export interface TaskCreateRequest {
  idAccount: number;
  idUser: number;
  title: string;
  description: string;
  dueDate: Date | null;
  priority: number;
  recurrence: TaskRecurrence | null;
  reminderDateTime: Date | null;
}

/**
 * @interface TaskRecurrence
 * @description Recurrence configuration for recurring tasks
 *
 * @property {number} type - Recurrence type (0=daily, 1=weekly, 2=monthly, 3=yearly)
 * @property {number} interval - Interval between occurrences
 * @property {string | null} weekDays - Days of week for weekly recurrence
 * @property {number | null} monthDay - Day of month for monthly recurrence
 * @property {Date} startDate - Recurrence start date
 * @property {Date | null} endDate - Recurrence end date
 * @property {number | null} occurrenceCount - Number of occurrences
 */
export interface TaskRecurrence {
  type: number;
  interval?: number;
  weekDays?: string | null;
  monthDay?: number | null;
  startDate: Date;
  endDate?: Date | null;
  occurrenceCount?: number | null;
}

/**
 * @interface TaskListRequest
 * @description Request parameters for listing tasks
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idUser - User identifier
 * @property {number | null} status - Filter by status
 * @property {number | null} priority - Filter by priority
 */
export interface TaskListRequest {
  idAccount: number;
  idUser: number;
  status: number | null;
  priority: number | null;
}

/**
 * @interface TaskGetRequest
 * @description Request parameters for getting task details
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idTask - Task identifier
 */
export interface TaskGetRequest {
  idAccount: number;
  idTask: number;
}

/**
 * @enum TaskStatus
 * @description Task status enumeration
 */
export enum TaskStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
}

/**
 * @enum TaskPriority
 * @description Task priority enumeration
 */
export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
}

/**
 * @enum RecurrenceType
 * @description Recurrence type enumeration
 */
export enum RecurrenceType {
  Daily = 0,
  Weekly = 1,
  Monthly = 2,
  Yearly = 3,
}
