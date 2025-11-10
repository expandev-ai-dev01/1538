/**
 * @summary
 * Reorders categories by updating their order values based on provided array.
 *
 * @procedure spCategoryReorder
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - PATCH /api/v1/internal/category/reorder
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 *
 * @param {NVARCHAR(MAX)} orderJson
 *   - Required: Yes
 *   - Description: JSON array with category IDs and their new order values
 *
 * @returns Success indicator
 *
 * @testScenarios
 * - Valid reorder operation
 * - Validation failure for invalid JSON
 * - Validation failure for non-existent categories
 * - Transaction rollback on error
 */
CREATE OR ALTER PROCEDURE [functional].[spCategoryReorder]
  @idAccount INTEGER,
  @orderJson NVARCHAR(MAX)
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {orderJsonRequired}
   */
  IF @orderJson IS NULL OR LEN(LTRIM(RTRIM(@orderJson))) = 0
  BEGIN
    ;THROW 51000, 'orderJsonRequired', 1;
  END;

  /**
   * @validation JSON format validation
   * @throw {invalidJsonFormat}
   */
  IF ISJSON(@orderJson) = 0
  BEGIN
    ;THROW 51000, 'invalidJsonFormat', 1;
  END;

  DECLARE @orderTable TABLE (
    [idCategory] INTEGER NOT NULL,
    [order] INTEGER NOT NULL
  );

  INSERT INTO @orderTable ([idCategory], [order])
  SELECT
    JSON_VALUE([value], '$.idCategory'),
    JSON_VALUE([value], '$.order')
  FROM OPENJSON(@orderJson);

  /**
   * @validation Category existence validation
   * @throw {invalidCategoryInOrderList}
   */
  IF EXISTS (
    SELECT 1
    FROM @orderTable [ordTbl]
    WHERE NOT EXISTS (
      SELECT 1
      FROM [functional].[category] [cat]
      WHERE [cat].[idCategory] = [ordTbl].[idCategory]
        AND [cat].[idAccount] = @idAccount
        AND [cat].[deleted] = 0
    )
  )
  BEGIN
    ;THROW 51000, 'invalidCategoryInOrderList', 1;
  END;

  BEGIN TRY
    BEGIN TRAN;

    /**
     * @rule {db-multi-tenancy,fn-category-reorder} Update category order with account isolation
     */
    UPDATE [cat]
    SET
      [cat].[order] = [ordTbl].[order],
      [cat].[dateModified] = GETUTCDATE()
    FROM [functional].[category] [cat]
      JOIN @orderTable [ordTbl] ON ([ordTbl].[idCategory] = [cat].[idCategory])
    WHERE [cat].[idAccount] = @idAccount
      AND [cat].[deleted] = 0;

    /**
     * @output {CategoryReordered, 1, 1}
     * @column {BIT} success - Reorder success indicator
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