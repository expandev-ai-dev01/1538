/**
 * @summary
 * Archives or unarchives a category by changing its status.
 *
 * @procedure spCategoryArchive
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - PATCH /api/v1/internal/category/:id/archive
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 *
 * @param {INT} idCategory
 *   - Required: Yes
 *   - Description: Category identifier to archive/unarchive
 *
 * @param {BIT} archive
 *   - Required: Yes
 *   - Description: If true, archive category; if false, unarchive
 *
 * @returns Success indicator
 *
 * @testScenarios
 * - Valid archive operation
 * - Valid unarchive operation
 * - Validation failure for default category
 * - Validation failure for non-existent category
 * - Transaction rollback on error
 */
CREATE OR ALTER PROCEDURE [functional].[spCategoryArchive]
  @idAccount INTEGER,
  @idCategory INTEGER,
  @archive BIT
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
   * @throw {cannotArchiveDefaultCategory}
   */
  IF @archive = 1 AND EXISTS (
    SELECT 1
    FROM [functional].[category] [cat]
    WHERE [cat].[idCategory] = @idCategory
      AND [cat].[idAccount] = @idAccount
      AND [cat].[isDefault] = 1
      AND [cat].[deleted] = 0
  )
  BEGIN
    ;THROW 51000, 'cannotArchiveDefaultCategory', 1;
  END;

  BEGIN TRY
    BEGIN TRAN;

    /**
     * @rule {db-multi-tenancy,fn-category-archive} Update category status with account isolation
     */
    UPDATE [functional].[category]
    SET
      [status] = CASE WHEN @archive = 1 THEN 1 ELSE 0 END,
      [dateModified] = GETUTCDATE()
    WHERE [idCategory] = @idCategory
      AND [idAccount] = @idAccount
      AND [deleted] = 0;

    /**
     * @output {CategoryArchived, 1, 1}
     * @column {BIT} success - Archive success indicator
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