/**
 * @summary
 * Lists all categories for a specific user with optional filtering by status.
 * Returns category details including hierarchy information and task count.
 *
 * @procedure spCategoryList
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/category
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 *
 * @param {INT} idUser
 *   - Required: Yes
 *   - Description: User identifier to filter categories
 *
 * @param {INT} status
 *   - Required: No
 *   - Description: Filter by status (0=active, 1=archived)
 *
 * @param {BIT} includeArchived
 *   - Required: No
 *   - Description: Include archived categories (default: false)
 *
 * @returns Category list with details
 *
 * @testScenarios
 * - List all active categories for user
 * - Filter by status
 * - Include archived categories
 * - Empty result for user with no categories
 */
CREATE OR ALTER PROCEDURE [functional].[spCategoryList]
  @idAccount INTEGER,
  @idUser INTEGER,
  @status INTEGER = NULL,
  @includeArchived BIT = 0
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
   * @rule {db-multi-tenancy,fn-category-list} List categories with account and user isolation
   * @output {CategoryList, n, n}
   * @column {INT} idCategory - Category identifier
   * @column {NVARCHAR} name - Category name
   * @column {VARCHAR} color - Category color
   * @column {NVARCHAR} description - Category description
   * @column {INT} idCategoryParent - Parent category identifier
   * @column {NVARCHAR} parentName - Parent category name
   * @column {INT} order - Display order
   * @column {INT} status - Category status
   * @column {BIT} isDefault - Indicates if default category
   * @column {INT} taskCount - Number of associated tasks
   * @column {INT} level - Hierarchy level
   * @column {DATETIME2} dateCreated - Creation timestamp
   * @column {DATETIME2} dateModified - Last modification timestamp
   */
  WITH [CategoryHierarchy] AS (
    SELECT
      [cat].[idCategory],
      [cat].[idAccount],
      [cat].[name],
      [cat].[color],
      [cat].[description],
      [cat].[idCategoryParent],
      [cat].[order],
      [cat].[status],
      [cat].[isDefault],
      [cat].[dateCreated],
      [cat].[dateModified],
      0 AS [level],
      CAST([cat].[name] AS NVARCHAR(MAX)) AS [fullPath]
    FROM [functional].[category] [cat]
    WHERE [cat].[idAccount] = @idAccount
      AND [cat].[idUser] = @idUser
      AND [cat].[deleted] = 0
      AND [cat].[idCategoryParent] IS NULL
      AND ((@includeArchived = 1) OR ([cat].[status] = 0))
      AND (@status IS NULL OR [cat].[status] = @status)

    UNION ALL

    SELECT
      [cat].[idCategory],
      [cat].[idAccount],
      [cat].[name],
      [cat].[color],
      [cat].[description],
      [cat].[idCategoryParent],
      [cat].[order],
      [cat].[status],
      [cat].[isDefault],
      [cat].[dateCreated],
      [cat].[dateModified],
      [catHie].[level] + 1,
      CAST([catHie].[fullPath] + ' > ' + [cat].[name] AS NVARCHAR(MAX))
    FROM [functional].[category] [cat]
      JOIN [CategoryHierarchy] [catHie] ON ([catHie].[idCategory] = [cat].[idCategoryParent])
    WHERE [cat].[idAccount] = @idAccount
      AND [cat].[idUser] = @idUser
      AND [cat].[deleted] = 0
      AND ((@includeArchived = 1) OR ([cat].[status] = 0))
      AND (@status IS NULL OR [cat].[status] = @status)
  )
  SELECT
    [catHie].[idCategory],
    [catHie].[name],
    [catHie].[color],
    [catHie].[description],
    [catHie].[idCategoryParent],
    [catPar].[name] AS [parentName],
    [catHie].[order],
    [catHie].[status],
    [catHie].[isDefault],
    COUNT(DISTINCT [tskCat].[idTask]) AS [taskCount],
    [catHie].[level],
    [catHie].[dateCreated],
    [catHie].[dateModified]
  FROM [CategoryHierarchy] [catHie]
    LEFT JOIN [functional].[category] [catPar] ON ([catPar].[idAccount] = [catHie].[idAccount] AND [catPar].[idCategory] = [catHie].[idCategoryParent] AND [catPar].[deleted] = 0)
    LEFT JOIN [functional].[taskCategory] [tskCat] ON ([tskCat].[idAccount] = [catHie].[idAccount] AND [tskCat].[idCategory] = [catHie].[idCategory])
    LEFT JOIN [functional].[task] [tsk] ON ([tsk].[idAccount] = [tskCat].[idAccount] AND [tsk].[idTask] = [tskCat].[idTask] AND [tsk].[deleted] = 0)
  GROUP BY
    [catHie].[idCategory],
    [catHie].[idAccount],
    [catHie].[name],
    [catHie].[color],
    [catHie].[description],
    [catHie].[idCategoryParent],
    [catPar].[name],
    [catHie].[order],
    [catHie].[status],
    [catHie].[isDefault],
    [catHie].[level],
    [catHie].[dateCreated],
    [catHie].[dateModified]
  ORDER BY
    [catHie].[order] ASC,
    [catHie].[name] ASC;
END;
GO