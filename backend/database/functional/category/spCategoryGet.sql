/**
 * @summary
 * Retrieves detailed information for a specific category including hierarchy
 * information and associated task count.
 *
 * @procedure spCategoryGet
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/category/:id
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 *
 * @param {INT} idCategory
 *   - Required: Yes
 *   - Description: Category identifier
 *
 * @returns Category details
 *
 * @testScenarios
 * - Get existing category with all details
 * - Get category with parent
 * - Get category with subcategories
 * - Validation failure for non-existent category
 * - Security validation for wrong account
 */
CREATE OR ALTER PROCEDURE [functional].[spCategoryGet]
  @idAccount INTEGER,
  @idCategory INTEGER
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {idCategoryRequired}
   */
  IF @idCategory IS NULL
  BEGIN
    ;THROW 51000, 'idCategoryRequired', 1;
  END;

  /**
   * @validation Data consistency validation
   * @throw {categoryDoesntExist}
   */
  IF NOT EXISTS (
    SELECT 1
    FROM [functional].[category] [cat]
    WHERE [cat].[idCategory] = @idCategory
      AND [cat].[idAccount] = @idAccount
      AND [cat].[deleted] = 0
  )
  BEGIN
    ;THROW 51000, 'categoryDoesntExist', 1;
  END;

  /**
   * @rule {db-multi-tenancy,fn-category-detail} Get category main details
   * @output {CategoryDetail, 1, n}
   * @column {INT} idCategory - Category identifier
   * @column {INT} idUser - User identifier
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
  WITH [CategoryLevel] AS (
    SELECT
      [cat].[idCategory],
      [cat].[idCategoryParent],
      0 AS [level]
    FROM [functional].[category] [cat]
    WHERE [cat].[idCategory] = @idCategory
      AND [cat].[idAccount] = @idAccount
      AND [cat].[deleted] = 0

    UNION ALL

    SELECT
      [cat].[idCategory],
      [cat].[idCategoryParent],
      [catLvl].[level] + 1
    FROM [functional].[category] [cat]
      JOIN [CategoryLevel] [catLvl] ON ([catLvl].[idCategoryParent] = [cat].[idCategory])
    WHERE [cat].[idAccount] = @idAccount
      AND [cat].[deleted] = 0
  )
  SELECT
    [cat].[idCategory],
    [cat].[idUser],
    [cat].[name],
    [cat].[color],
    [cat].[description],
    [cat].[idCategoryParent],
    [catPar].[name] AS [parentName],
    [cat].[order],
    [cat].[status],
    [cat].[isDefault],
    COUNT(DISTINCT [tskCat].[idTask]) AS [taskCount],
    (SELECT MAX([level]) FROM [CategoryLevel]) AS [level],
    [cat].[dateCreated],
    [cat].[dateModified]
  FROM [functional].[category] [cat]
    LEFT JOIN [functional].[category] [catPar] ON ([catPar].[idAccount] = [cat].[idAccount] AND [catPar].[idCategory] = [cat].[idCategoryParent] AND [catPar].[deleted] = 0)
    LEFT JOIN [functional].[taskCategory] [tskCat] ON ([tskCat].[idAccount] = [cat].[idAccount] AND [tskCat].[idCategory] = [cat].[idCategory])
    LEFT JOIN [functional].[task] [tsk] ON ([tsk].[idAccount] = [tskCat].[idAccount] AND [tsk].[idTask] = [tskCat].[idTask] AND [tsk].[deleted] = 0)
  WHERE [cat].[idCategory] = @idCategory
    AND [cat].[idAccount] = @idAccount
    AND [cat].[deleted] = 0
  GROUP BY
    [cat].[idCategory],
    [cat].[idAccount],
    [cat].[idUser],
    [cat].[name],
    [cat].[color],
    [cat].[description],
    [cat].[idCategoryParent],
    [catPar].[name],
    [cat].[order],
    [cat].[status],
    [cat].[isDefault],
    [cat].[dateCreated],
    [cat].[dateModified];

  /**
   * @output {Subcategories, n, n}
   * @column {INT} idCategory - Subcategory identifier
   * @column {NVARCHAR} name - Subcategory name
   * @column {VARCHAR} color - Subcategory color
   * @column {INT} taskCount - Number of associated tasks
   * @column {INT} order - Display order
   */
  SELECT
    [cat].[idCategory],
    [cat].[name],
    [cat].[color],
    COUNT(DISTINCT [tskCat].[idTask]) AS [taskCount],
    [cat].[order]
  FROM [functional].[category] [cat]
    LEFT JOIN [functional].[taskCategory] [tskCat] ON ([tskCat].[idAccount] = [cat].[idAccount] AND [tskCat].[idCategory] = [cat].[idCategory])
    LEFT JOIN [functional].[task] [tsk] ON ([tsk].[idAccount] = [tskCat].[idAccount] AND [tsk].[idTask] = [tskCat].[idTask] AND [tsk].[deleted] = 0)
  WHERE [cat].[idCategoryParent] = @idCategory
    AND [cat].[idAccount] = @idAccount
    AND [cat].[deleted] = 0
  GROUP BY
    [cat].[idCategory],
    [cat].[name],
    [cat].[color],
    [cat].[order]
  ORDER BY
    [cat].[order] ASC;
END;
GO