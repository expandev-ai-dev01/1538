/**
 * @schema functional
 * Business logic schema for TODO list application
 */
CREATE SCHEMA [functional];
GO

/**
 * @table task Task management table
 * @multitenancy true
 * @softDelete true
 * @alias tsk
 */
CREATE TABLE [functional].[task] (
  [idTask] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [idUser] INTEGER NOT NULL,
  [title] NVARCHAR(100) NOT NULL,
  [description] NVARCHAR(500) NOT NULL DEFAULT (''),
  [dueDate] DATE NULL,
  [priority] INTEGER NOT NULL DEFAULT (1),
  [status] INTEGER NOT NULL DEFAULT (0),
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
  [dateModified] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
  [deleted] BIT NOT NULL DEFAULT (0)
);
GO

/**
 * @table taskAttachment Task attachment files table
 * @multitenancy true
 * @softDelete false
 * @alias tskAtt
 */
CREATE TABLE [functional].[taskAttachment] (
  [idTaskAttachment] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [idTask] INTEGER NOT NULL,
  [fileName] NVARCHAR(255) NOT NULL,
  [fileSize] INTEGER NOT NULL,
  [fileType] VARCHAR(50) NOT NULL,
  [filePath] NVARCHAR(500) NOT NULL,
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE())
);
GO

/**
 * @table taskRecurrence Task recurrence configuration table
 * @multitenancy true
 * @softDelete false
 * @alias tskRec
 */
CREATE TABLE [functional].[taskRecurrence] (
  [idTaskRecurrence] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [idTask] INTEGER NOT NULL,
  [recurrenceType] INTEGER NOT NULL,
  [recurrenceInterval] INTEGER NOT NULL DEFAULT (1),
  [weekDays] VARCHAR(20) NULL,
  [monthDay] INTEGER NULL,
  [startDate] DATE NOT NULL,
  [endDate] DATE NULL,
  [occurrenceCount] INTEGER NULL,
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE())
);
GO

/**
 * @table taskReminder Task reminder configuration table
 * @multitenancy true
 * @softDelete false
 * @alias tskRem
 */
CREATE TABLE [functional].[taskReminder] (
  [idTaskReminder] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [idTask] INTEGER NOT NULL,
  [reminderDateTime] DATETIME2 NOT NULL,
  [sent] BIT NOT NULL DEFAULT (0),
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE())
);
GO

/**
 * @table subtask Subtask management table
 * @multitenancy true
 * @softDelete true
 * @alias sub
 */
CREATE TABLE [functional].[subtask] (
  [idSubtask] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [idTask] INTEGER NOT NULL,
  [title] NVARCHAR(100) NOT NULL,
  [description] NVARCHAR(500) NOT NULL DEFAULT (''),
  [status] INTEGER NOT NULL DEFAULT (0),
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
  [dateModified] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
  [deleted] BIT NOT NULL DEFAULT (0)
);
GO

/**
 * @primaryKey pkTask
 * @keyType Object
 */
ALTER TABLE [functional].[task]
ADD CONSTRAINT [pkTask] PRIMARY KEY CLUSTERED ([idTask]);
GO

/**
 * @primaryKey pkTaskAttachment
 * @keyType Object
 */
ALTER TABLE [functional].[taskAttachment]
ADD CONSTRAINT [pkTaskAttachment] PRIMARY KEY CLUSTERED ([idTaskAttachment]);
GO

/**
 * @primaryKey pkTaskRecurrence
 * @keyType Object
 */
ALTER TABLE [functional].[taskRecurrence]
ADD CONSTRAINT [pkTaskRecurrence] PRIMARY KEY CLUSTERED ([idTaskRecurrence]);
GO

/**
 * @primaryKey pkTaskReminder
 * @keyType Object
 */
ALTER TABLE [functional].[taskReminder]
ADD CONSTRAINT [pkTaskReminder] PRIMARY KEY CLUSTERED ([idTaskReminder]);
GO

/**
 * @primaryKey pkSubtask
 * @keyType Object
 */
ALTER TABLE [functional].[subtask]
ADD CONSTRAINT [pkSubtask] PRIMARY KEY CLUSTERED ([idSubtask]);
GO

/**
 * @foreignKey fkTaskAttachment_Task
 * @target functional.task
 */
ALTER TABLE [functional].[taskAttachment]
ADD CONSTRAINT [fkTaskAttachment_Task] FOREIGN KEY ([idTask])
REFERENCES [functional].[task]([idTask]);
GO

/**
 * @foreignKey fkTaskRecurrence_Task
 * @target functional.task
 */
ALTER TABLE [functional].[taskRecurrence]
ADD CONSTRAINT [fkTaskRecurrence_Task] FOREIGN KEY ([idTask])
REFERENCES [functional].[task]([idTask]);
GO

/**
 * @foreignKey fkTaskReminder_Task
 * @target functional.task
 */
ALTER TABLE [functional].[taskReminder]
ADD CONSTRAINT [fkTaskReminder_Task] FOREIGN KEY ([idTask])
REFERENCES [functional].[task]([idTask]);
GO

/**
 * @foreignKey fkSubtask_Task
 * @target functional.task
 */
ALTER TABLE [functional].[subtask]
ADD CONSTRAINT [fkSubtask_Task] FOREIGN KEY ([idTask])
REFERENCES [functional].[task]([idTask]);
GO

/**
 * @check chkTask_Priority Priority enumeration
 * @enum {0} Low priority
 * @enum {1} Medium priority
 * @enum {2} High priority
 */
ALTER TABLE [functional].[task]
ADD CONSTRAINT [chkTask_Priority] CHECK ([priority] BETWEEN 0 AND 2);
GO

/**
 * @check chkTask_Status Status enumeration
 * @enum {0} Pending
 * @enum {1} In progress
 * @enum {2} Completed
 */
ALTER TABLE [functional].[task]
ADD CONSTRAINT [chkTask_Status] CHECK ([status] BETWEEN 0 AND 2);
GO

/**
 * @check chkSubtask_Status Status enumeration
 * @enum {0} Pending
 * @enum {1} In progress
 * @enum {2} Completed
 */
ALTER TABLE [functional].[subtask]
ADD CONSTRAINT [chkSubtask_Status] CHECK ([status] BETWEEN 0 AND 2);
GO

/**
 * @check chkTaskRecurrence_Type Recurrence type enumeration
 * @enum {0} Daily
 * @enum {1} Weekly
 * @enum {2} Monthly
 * @enum {3} Yearly
 */
ALTER TABLE [functional].[taskRecurrence]
ADD CONSTRAINT [chkTaskRecurrence_Type] CHECK ([recurrenceType] BETWEEN 0 AND 3);
GO

/**
 * @index ixTask_Account
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixTask_Account]
ON [functional].[task]([idAccount])
WHERE [deleted] = 0;
GO

/**
 * @index ixTask_Account_User
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixTask_Account_User]
ON [functional].[task]([idAccount], [idUser])
INCLUDE ([title], [dueDate], [priority], [status])
WHERE [deleted] = 0;
GO

/**
 * @index ixTask_Account_Status
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixTask_Account_Status]
ON [functional].[task]([idAccount], [status])
INCLUDE ([title], [dueDate], [priority])
WHERE [deleted] = 0;
GO

/**
 * @index ixTask_Account_DueDate
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixTask_Account_DueDate]
ON [functional].[task]([idAccount], [dueDate])
INCLUDE ([title], [priority], [status])
WHERE [deleted] = 0 AND [dueDate] IS NOT NULL;
GO

/**
 * @index ixTaskAttachment_Account_Task
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixTaskAttachment_Account_Task]
ON [functional].[taskAttachment]([idAccount], [idTask]);
GO

/**
 * @index ixTaskRecurrence_Account_Task
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixTaskRecurrence_Account_Task]
ON [functional].[taskRecurrence]([idAccount], [idTask]);
GO

/**
 * @index ixTaskReminder_Account_Task
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixTaskReminder_Account_Task]
ON [functional].[taskReminder]([idAccount], [idTask]);
GO

/**
 * @index ixSubtask_Account_Task
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixSubtask_Account_Task]
ON [functional].[subtask]([idAccount], [idTask])
WHERE [deleted] = 0;
GO