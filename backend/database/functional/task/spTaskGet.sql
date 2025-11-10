/**
 * @summary
 * Retrieves detailed information for a specific task including all related data
 * such as attachments, recurrence configuration, reminders, and subtasks.
 *
 * @procedure spTaskGet
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/task/:id
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 *
 * @param {INT} idTask
 *   - Required: Yes
 *   - Description: Task identifier
 *
 * @returns Multiple result sets with task details
 *
 * @testScenarios
 * - Get existing task with all details
 * - Get task without optional data (no attachments, recurrence, etc.)
 * - Validation failure for non-existent task
 * - Security validation for wrong account
 */
CREATE OR ALTER PROCEDURE [functional].[spTaskGet]
  @idAccount INTEGER,
  @idTask INTEGER
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {idTaskRequired}
   */
  IF @idTask IS NULL
  BEGIN
    ;THROW 51000, 'idTaskRequired', 1;
  END;

  /**
   * @validation Data consistency validation
   * @throw {taskDoesntExist}
   */
  IF NOT EXISTS (
    SELECT 1
    FROM [functional].[task] [tsk]
    WHERE [tsk].[idTask] = @idTask
      AND [tsk].[idAccount] = @idAccount
      AND [tsk].[deleted] = 0
  )
  BEGIN
    ;THROW 51000, 'taskDoesntExist', 1;
  END;

  /**
   * @rule {db-multi-tenancy,fn-task-detail} Get task main details
   * @output {TaskDetail, 1, n}
   * @column {INT} idTask - Task identifier
   * @column {INT} idUser - User identifier
   * @column {NVARCHAR} title - Task title
   * @column {NVARCHAR} description - Task description
   * @column {DATE} dueDate - Task due date
   * @column {INT} priority - Priority level
   * @column {INT} status - Task status
   * @column {DATETIME2} dateCreated - Creation timestamp
   * @column {DATETIME2} dateModified - Last modification timestamp
   */
  SELECT
    [tsk].[idTask],
    [tsk].[idUser],
    [tsk].[title],
    [tsk].[description],
    [tsk].[dueDate],
    [tsk].[priority],
    [tsk].[status],
    [tsk].[dateCreated],
    [tsk].[dateModified]
  FROM [functional].[task] [tsk]
  WHERE [tsk].[idTask] = @idTask
    AND [tsk].[idAccount] = @idAccount
    AND [tsk].[deleted] = 0;

  /**
   * @output {TaskAttachments, n, n}
   * @column {INT} idTaskAttachment - Attachment identifier
   * @column {NVARCHAR} fileName - File name
   * @column {INT} fileSize - File size in bytes
   * @column {VARCHAR} fileType - File MIME type
   * @column {NVARCHAR} filePath - File storage path
   * @column {DATETIME2} dateCreated - Upload timestamp
   */
  SELECT
    [tskAtt].[idTaskAttachment],
    [tskAtt].[fileName],
    [tskAtt].[fileSize],
    [tskAtt].[fileType],
    [tskAtt].[filePath],
    [tskAtt].[dateCreated]
  FROM [functional].[taskAttachment] [tskAtt]
  WHERE [tskAtt].[idTask] = @idTask
    AND [tskAtt].[idAccount] = @idAccount
  ORDER BY [tskAtt].[dateCreated] DESC;

  /**
   * @output {TaskRecurrence, 1, n}
   * @column {INT} idTaskRecurrence - Recurrence identifier
   * @column {INT} recurrenceType - Recurrence type
   * @column {INT} recurrenceInterval - Interval between occurrences
   * @column {VARCHAR} weekDays - Days of week for weekly recurrence
   * @column {INT} monthDay - Day of month for monthly recurrence
   * @column {DATE} startDate - Recurrence start date
   * @column {DATE} endDate - Recurrence end date
   * @column {INT} occurrenceCount - Number of occurrences
   */
  SELECT
    [tskRec].[idTaskRecurrence],
    [tskRec].[recurrenceType],
    [tskRec].[recurrenceInterval],
    [tskRec].[weekDays],
    [tskRec].[monthDay],
    [tskRec].[startDate],
    [tskRec].[endDate],
    [tskRec].[occurrenceCount]
  FROM [functional].[taskRecurrence] [tskRec]
  WHERE [tskRec].[idTask] = @idTask
    AND [tskRec].[idAccount] = @idAccount;

  /**
   * @output {TaskReminders, n, n}
   * @column {INT} idTaskReminder - Reminder identifier
   * @column {DATETIME2} reminderDateTime - Reminder date and time
   * @column {BIT} sent - Indicates if reminder was sent
   */
  SELECT
    [tskRem].[idTaskReminder],
    [tskRem].[reminderDateTime],
    [tskRem].[sent]
  FROM [functional].[taskReminder] [tskRem]
  WHERE [tskRem].[idTask] = @idTask
    AND [tskRem].[idAccount] = @idAccount
  ORDER BY [tskRem].[reminderDateTime] ASC;

  /**
   * @output {Subtasks, n, n}
   * @column {INT} idSubtask - Subtask identifier
   * @column {NVARCHAR} title - Subtask title
   * @column {NVARCHAR} description - Subtask description
   * @column {INT} status - Subtask status
   * @column {DATETIME2} dateCreated - Creation timestamp
   */
  SELECT
    [sub].[idSubtask],
    [sub].[title],
    [sub].[description],
    [sub].[status],
    [sub].[dateCreated]
  FROM [functional].[subtask] [sub]
  WHERE [sub].[idTask] = @idTask
    AND [sub].[idAccount] = @idAccount
    AND [sub].[deleted] = 0
  ORDER BY [sub].[dateCreated] ASC;
END;
GO