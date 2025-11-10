/**
 * @table category Category management table
 * @multitenancy true
 * @softDelete true
 * @alias cat
 */
CREATE TABLE [functional].[category] (
  [idCategory] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [idUser] INTEGER NOT NULL,
  [name] NVARCHAR(50) NOT NULL,
  [color] VARCHAR(7) NOT NULL DEFAULT ('#3498db'),
  [description] NVARCHAR(200) NOT NULL DEFAULT (''),
  [idCategoryParent] INTEGER NULL,
  [order] INTEGER NOT NULL,
  [status] INTEGER NOT NULL DEFAULT (0),
  [isDefault] BIT NOT NULL DEFAULT (0),
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
  [dateModified] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
  [deleted] BIT NOT NULL DEFAULT (0)
);
GO

/**
 * @table taskCategory Task-Category relationship table
 * @multitenancy true
 * @softDelete false
 * @alias tskCat
 */
CREATE TABLE [functional].[taskCategory] (
  [idTaskCategory] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [idTask] INTEGER NOT NULL,
  [idCategory] INTEGER NOT NULL,
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE())
);
GO

/**
 * @primaryKey pkCategory
 * @keyType Object
 */
ALTER TABLE [functional].[category]
ADD CONSTRAINT [pkCategory] PRIMARY KEY CLUSTERED ([idCategory]);
GO

/**
 * @primaryKey pkTaskCategory
 * @keyType Relationship
 */
ALTER TABLE [functional].[taskCategory]
ADD CONSTRAINT [pkTaskCategory] PRIMARY KEY CLUSTERED ([idTaskCategory]);
GO

/**
 * @foreignKey fkCategory_CategoryParent
 * @target functional.category
 */
ALTER TABLE [functional].[category]
ADD CONSTRAINT [fkCategory_CategoryParent] FOREIGN KEY ([idCategoryParent])
REFERENCES [functional].[category]([idCategory]);
GO

/**
 * @foreignKey fkTaskCategory_Task
 * @target functional.task
 */
ALTER TABLE [functional].[taskCategory]
ADD CONSTRAINT [fkTaskCategory_Task] FOREIGN KEY ([idTask])
REFERENCES [functional].[task]([idTask]);
GO

/**
 * @foreignKey fkTaskCategory_Category
 * @target functional.category
 */
ALTER TABLE [functional].[taskCategory]
ADD CONSTRAINT [fkTaskCategory_Category] FOREIGN KEY ([idCategory])
REFERENCES [functional].[category]([idCategory]);
GO

/**
 * @check chkCategory_Status Status enumeration
 * @enum {0} Active
 * @enum {1} Archived
 */
ALTER TABLE [functional].[category]
ADD CONSTRAINT [chkCategory_Status] CHECK ([status] BETWEEN 0 AND 1);
GO

/**
 * @check chkCategory_Color Color format validation
 */
ALTER TABLE [functional].[category]
ADD CONSTRAINT [chkCategory_Color] CHECK ([color] LIKE '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]');
GO

/**
 * @index ixCategory_Account
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixCategory_Account]
ON [functional].[category]([idAccount])
WHERE [deleted] = 0;
GO

/**
 * @index ixCategory_Account_User
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixCategory_Account_User]
ON [functional].[category]([idAccount], [idUser])
INCLUDE ([name], [color], [status], [order])
WHERE [deleted] = 0;
GO

/**
 * @index ixCategory_Account_Status
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixCategory_Account_Status]
ON [functional].[category]([idAccount], [status])
INCLUDE ([name], [color], [order])
WHERE [deleted] = 0;
GO

/**
 * @index uqCategory_Account_Name
 * @type Unique
 * @unique true
 * @filter Active categories only
 */
CREATE UNIQUE NONCLUSTERED INDEX [uqCategory_Account_Name]
ON [functional].[category]([idAccount], [name])
WHERE [deleted] = 0;
GO

/**
 * @index ixCategory_Account_Parent
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixCategory_Account_Parent]
ON [functional].[category]([idAccount], [idCategoryParent])
WHERE [deleted] = 0 AND [idCategoryParent] IS NOT NULL;
GO

/**
 * @index ixTaskCategory_Account_Task
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixTaskCategory_Account_Task]
ON [functional].[taskCategory]([idAccount], [idTask]);
GO

/**
 * @index ixTaskCategory_Account_Category
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixTaskCategory_Account_Category]
ON [functional].[taskCategory]([idAccount], [idCategory]);
GO

/**
 * @index uqTaskCategory_Account_Task_Category
 * @type Unique
 * @unique true
 */
CREATE UNIQUE NONCLUSTERED INDEX [uqTaskCategory_Account_Task_Category]
ON [functional].[taskCategory]([idAccount], [idTask], [idCategory]);
GO