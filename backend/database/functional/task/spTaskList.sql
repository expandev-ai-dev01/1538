/**
 * @summary
 * Lists all tasks for a specific user with filtering and sorting options.
 * Returns task details including status, priority, due date, and subtask count.
 *
 * @procedure spTaskList
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/task
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 *
 * @param {INT} idUser
 *   - Required: Yes
 *   - Description: User identifier to filter tasks
 *
 * @param {INT} status
 *   - Required: No
 *   - Description: Filter by status (0=pending, 1=in progress, 2=completed)
 *
 * @param {INT} priority
 *   - Required: No
 *   - Description: Filter by priority (0=low, 1=medium, 2=high)
 *
 * @returns Task list with details
 *
 * @testScenarios
 * - List all tasks for user
 * - Filter by status
 * - Filter by priority
 * - Filter by both status and priority
 * - Empty result for user with no tasks
 */
CREATE OR ALTER PROCEDURE [functional].[spTaskList]
  @idAccount INTEGER,
  @idUser INTEGER,
  @status INTEGER = NULL,
  @priority INTEGER = NULL
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {idAccountRequired}
   */
  IF @idAccount IS NULL
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  /**
   * @validation Required parameter validation
   * @throw {idUserRequired}
   */
  IF @idUser IS NULL
  BEGIN
    ;THROW 51000, 'idUserRequired', 1;
  END;

  /**
   * @rule {db-multi-tenancy,fn-task-list} List tasks with account and user isolation
   * @output {TaskList, n, n}
   * @column {INT} idTask - Task identifier
   * @column {NVARCHAR} title - Task title
   * @column {NVARCHAR} description - Task description
   * @column {DATE} dueDate - Task due date
   * @column {INT} priority - Priority level
   * @column {INT} status - Task status
   * @column {INT} subtaskCount - Number of subtasks
   * @column {INT} completedSubtaskCount - Number of completed subtasks
   * @column {BIT} hasRecurrence - Indicates if task is recurring
   * @column {BIT} hasReminder - Indicates if task has reminder
   * @column {DATETIME2} dateCreated - Creation timestamp
   * @column {DATETIME2} dateModified - Last modification timestamp
   */
  SELECT
    [tsk].[idTask],
    [tsk].[title],
    [tsk].[description],
    [tsk].[dueDate],
    [tsk].[priority],
    [tsk].[status],
    COUNT([sub].[idSubtask]) AS [subtaskCount],
    SUM(CASE WHEN [sub].[status] = 2 THEN 1 ELSE 0 END) AS [completedSubtaskCount],
    CAST(CASE WHEN EXISTS(
      SELECT 1
      FROM [functional].[taskRecurrence] [tskRec]
      WHERE [tskRec].[idAccount] = [tsk].[idAccount]
        AND [tskRec].[idTask] = [tsk].[idTask]
    ) THEN 1 ELSE 0 END AS BIT) AS [hasRecurrence],
    CAST(CASE WHEN EXISTS(
      SELECT 1
      FROM [functional].[taskReminder] [tskRem]
      WHERE [tskRem].[idAccount] = [tsk].[idAccount]
        AND [tskRem].[idTask] = [tsk].[idTask]
    ) THEN 1 ELSE 0 END AS BIT) AS [hasReminder],
    [tsk].[dateCreated],
    [tsk].[dateModified]
  FROM [functional].[task] [tsk]
    LEFT JOIN [functional].[subtask] [sub] ON ([sub].[idAccount] = [tsk].[idAccount] AND [sub].[idTask] = [tsk].[idTask] AND [sub].[deleted] = 0)
  WHERE [tsk].[idAccount] = @idAccount
    AND [tsk].[idUser] = @idUser
    AND [tsk].[deleted] = 0
    AND (@status IS NULL OR [tsk].[status] = @status)
    AND (@priority IS NULL OR [tsk].[priority] = @priority)
  GROUP BY
    [tsk].[idTask],
    [tsk].[idAccount],
    [tsk].[title],
    [tsk].[description],
    [tsk].[dueDate],
    [tsk].[priority],
    [tsk].[status],
    [tsk].[dateCreated],
    [tsk].[dateModified]
  ORDER BY
    [tsk].[dueDate] ASC,
    [tsk].[priority] DESC,
    [tsk].[dateCreated] DESC;
END;
GO