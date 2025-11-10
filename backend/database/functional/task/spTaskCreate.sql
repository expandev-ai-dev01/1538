/**
 * @summary
 * Creates a new task with all specified parameters including optional fields
 * for due date, priority, attachments, recurrence, and reminders.
 *
 * @procedure spTaskCreate
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/task
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 *
 * @param {INT} idUser
 *   - Required: Yes
 *   - Description: User identifier who creates the task
 *
 * @param {NVARCHAR(100)} title
 *   - Required: Yes
 *   - Description: Task title (3-100 characters)
 *
 * @param {NVARCHAR(500)} description
 *   - Required: No
 *   - Description: Task description (max 500 characters)
 *
 * @param {DATE} dueDate
 *   - Required: No
 *   - Description: Task due date (must be future date)
 *
 * @param {INT} priority
 *   - Required: No
 *   - Description: Priority level (0=low, 1=medium, 2=high)
 *
 * @param {NVARCHAR(MAX)} recurrenceJson
 *   - Required: No
 *   - Description: JSON configuration for recurring tasks
 *
 * @param {DATETIME2} reminderDateTime
 *   - Required: No
 *   - Description: Reminder date and time
 *
 * @returns {INT} idTask - Created task identifier
 *
 * @testScenarios
 * - Valid creation with only required fields (title)
 * - Valid creation with all optional fields
 * - Validation failure for title length
 * - Validation failure for past due date
 * - Validation failure for invalid priority
 * - Validation failure for reminder after due date
 * - Transaction rollback on error
 */
CREATE OR ALTER PROCEDURE [functional].[spTaskCreate]
  @idAccount INTEGER,
  @idUser INTEGER,
  @title NVARCHAR(100),
  @description NVARCHAR(500) = '',
  @dueDate DATE = NULL,
  @priority INTEGER = 1,
  @recurrenceJson NVARCHAR(MAX) = NULL,
  @reminderDateTime DATETIME2 = NULL
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {titleRequired}
   */
  IF @title IS NULL OR LEN(LTRIM(RTRIM(@title))) = 0
  BEGIN
    ;THROW 51000, 'titleRequired', 1;
  END;

  /**
   * @validation Title length validation
   * @throw {titleTooShort}
   * @throw {titleTooLong}
   */
  IF LEN(LTRIM(RTRIM(@title))) < 3
  BEGIN
    ;THROW 51000, 'titleTooShort', 1;
  END;

  IF LEN(@title) > 100
  BEGIN
    ;THROW 51000, 'titleTooLong', 1;
  END;

  /**
   * @validation Description length validation
   * @throw {descriptionTooLong}
   */
  IF @description IS NOT NULL AND LEN(@description) > 500
  BEGIN
    ;THROW 51000, 'descriptionTooLong', 1;
  END;

  /**
   * @validation Due date validation
   * @throw {dueDateInPast}
   */
  IF @dueDate IS NOT NULL AND @dueDate < CAST(GETUTCDATE() AS DATE)
  BEGIN
    ;THROW 51000, 'dueDateInPast', 1;
  END;

  /**
   * @validation Priority validation
   * @throw {invalidPriority}
   */
  IF @priority NOT BETWEEN 0 AND 2
  BEGIN
    ;THROW 51000, 'invalidPriority', 1;
  END;

  /**
   * @validation Reminder validation
   * @throw {reminderAfterDueDate}
   */
  IF @reminderDateTime IS NOT NULL AND @dueDate IS NOT NULL
  BEGIN
    IF @reminderDateTime > CAST(@dueDate AS DATETIME2)
    BEGIN
      ;THROW 51000, 'reminderAfterDueDate', 1;
    END;
  END;

  DECLARE @idTask INTEGER;
  DECLARE @recurrenceType INTEGER;
  DECLARE @recurrenceInterval INTEGER;
  DECLARE @weekDays VARCHAR(20);
  DECLARE @monthDay INTEGER;
  DECLARE @startDate DATE;
  DECLARE @endDate DATE;
  DECLARE @occurrenceCount INTEGER;

  BEGIN TRY
    BEGIN TRAN;

    /**
     * @rule {db-multi-tenancy,fn-task-creation} Create task with account isolation
     */
    INSERT INTO [functional].[task] (
      [idAccount],
      [idUser],
      [title],
      [description],
      [dueDate],
      [priority],
      [status],
      [dateCreated],
      [dateModified],
      [deleted]
    )
    VALUES (
      @idAccount,
      @idUser,
      @title,
      ISNULL(@description, ''),
      @dueDate,
      @priority,
      0,
      GETUTCDATE(),
      GETUTCDATE(),
      0
    );

    SET @idTask = SCOPE_IDENTITY();

    /**
     * @rule {fn-task-recurrence} Process recurrence configuration if provided
     */
    IF @recurrenceJson IS NOT NULL
    BEGIN
      SELECT
        @recurrenceType = JSON_VALUE(@recurrenceJson, '$.type'),
        @recurrenceInterval = ISNULL(JSON_VALUE(@recurrenceJson, '$.interval'), 1),
        @weekDays = JSON_VALUE(@recurrenceJson, '$.weekDays'),
        @monthDay = JSON_VALUE(@recurrenceJson, '$.monthDay'),
        @startDate = JSON_VALUE(@recurrenceJson, '$.startDate'),
        @endDate = JSON_VALUE(@recurrenceJson, '$.endDate'),
        @occurrenceCount = JSON_VALUE(@recurrenceJson, '$.occurrenceCount');

      INSERT INTO [functional].[taskRecurrence] (
        [idAccount],
        [idTask],
        [recurrenceType],
        [recurrenceInterval],
        [weekDays],
        [monthDay],
        [startDate],
        [endDate],
        [occurrenceCount],
        [dateCreated]
      )
      VALUES (
        @idAccount,
        @idTask,
        @recurrenceType,
        @recurrenceInterval,
        @weekDays,
        @monthDay,
        @startDate,
        @endDate,
        @occurrenceCount,
        GETUTCDATE()
      );
    END;

    /**
     * @rule {fn-task-reminder} Create reminder if specified
     */
    IF @reminderDateTime IS NOT NULL
    BEGIN
      INSERT INTO [functional].[taskReminder] (
        [idAccount],
        [idTask],
        [reminderDateTime],
        [sent],
        [dateCreated]
      )
      VALUES (
        @idAccount,
        @idTask,
        @reminderDateTime,
        0,
        GETUTCDATE()
      );
    END;

    /**
     * @output {TaskCreated, 1, 1}
     * @column {INT} idTask - Created task identifier
     */
    SELECT @idTask AS [idTask];

    COMMIT TRAN;
  END TRY
  BEGIN CATCH
    ROLLBACK TRAN;
    THROW;
  END CATCH;
END;
GO