/**
 * @summary
 * Deletes a category (soft delete) and handles associated tasks based on
 * the specified action (move to another category or delete tasks).
 *
 * @procedure spCategoryDelete
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - DELETE /api/v1/internal/category/:id
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 *
 * @param {INT} idCategory
 *   - Required: Yes
 *   - Description: Category identifier to delete
 *
 * @param {INT} idCategoryTarget
 *   - Required: No
 *   - Description: Target category to move tasks to (if not deleting tasks)
 *
 * @param {BIT} deleteTasks
 *   - Required: No
 *   - Description: If true, delete associated tasks; if false, move to target category
 *
 * @returns Success indicator
 *
 * @testScenarios
 * - Valid deletion with task move to target category
 * - Valid deletion with task deletion
 * - Validation failure for default category
 * - Validation failure for non-existent category
 * - Validation failure for non-existent target category
 * - Validation failure for category with subcategories
 * - Transaction rollback on error
 */
CREATE OR ALTER PROCEDURE [functional].[spCategoryDelete]
  @idAccount INTEGER,
  @idCategory INTEGER,
  @idCategoryTarget INTEGER = NULL,
  @deleteTasks BIT = 0
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
   * @validation Default category protection
   * @throw {cannotDeleteDefaultCategory}
   */
  IF EXISTS (
    SELECT 1
    FROM [functional].[category] [cat]
    WHERE [cat].[idCategory] = @idCategory
      AND [cat].[idAccount] = @idAccount
      AND [cat].[isDefault] = 1
      AND [cat].[deleted] = 0
  )
  BEGIN
    ;THROW 51000, 'cannotDeleteDefaultCategory', 1;
  END;

  /**
   * @validation Subcategory validation
   * @throw {cannotDeleteCategoryWithSubcategories}
   */
  IF EXISTS (
    SELECT 1
    FROM [functional].[category] [cat]
    WHERE [cat].[idCategoryParent] = @idCategory
      AND [cat].[idAccount] = @idAccount
      AND [cat].[deleted] = 0
  )
  BEGIN
    ;THROW 51000, 'cannotDeleteCategoryWithSubcategories', 1;
  END;

  /**
   * @validation Target category validation
   * @throw {targetCategoryRequired}
   * @throw {targetCategoryDoesntExist}
   */
  IF @deleteTasks = 0
  BEGIN
    IF @idCategoryTarget IS NULL
    BEGIN
      ;THROW 51000, 'targetCategoryRequired', 1;
    END;

    IF NOT EXISTS (
      SELECT 1
      FROM [functional].[category] [cat]
      WHERE [cat].[idCategory] = @idCategoryTarget
        AND [cat].[idAccount] = @idAccount
        AND [cat].[deleted] = 0
    )
    BEGIN
      ;THROW 51000, 'targetCategoryDoesntExist', 1;
    END;
  END;

  BEGIN TRY
    BEGIN TRAN;

    /**
     * @rule {fn-category-task-handling} Handle associated tasks based on action
     */
    IF @deleteTasks = 1
    BEGIN
      /**
       * @rule {fn-category-delete-tasks} Soft delete all tasks associated with category
       */
      UPDATE [tsk]
      SET
        [tsk].[deleted] = 1,
        [tsk].[dateModified] = GETUTCDATE()
      FROM [functional].[task] [tsk]
        JOIN [functional].[taskCategory] [tskCat] ON ([tskCat].[idAccount] = [tsk].[idAccount] AND [tskCat].[idTask] = [tsk].[idTask])
      WHERE [tskCat].[idCategory] = @idCategory
        AND [tsk].[idAccount] = @idAccount
        AND [tsk].[deleted] = 0;
    END
    ELSE
    BEGIN
      /**
       * @rule {fn-category-move-tasks} Move tasks to target category
       */
      UPDATE [tskCat]
      SET [tskCat].[idCategory] = @idCategoryTarget
      FROM [functional].[taskCategory] [tskCat]
      WHERE [tskCat].[idCategory] = @idCategory
        AND [tskCat].[idAccount] = @idAccount;
    END;

    /**
     * @rule {db-multi-tenancy,fn-category-delete} Soft delete category with account isolation
     */
    UPDATE [functional].[category]
    SET
      [deleted] = 1,
      [dateModified] = GETUTCDATE()
    WHERE [idCategory] = @idCategory
      AND [idAccount] = @idAccount
      AND [deleted] = 0;

    /**
     * @output {CategoryDeleted, 1, 1}
     * @column {BIT} success - Delete success indicator
     */
    SELECT CAST(1 AS BIT) AS [success];

    COMMIT TRAN;
  END TRY
  BEGIN CATCH
    ROLLBACK TRAN;
    THROW;
  END CATCH;
END;
GO