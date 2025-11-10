/**
 * @summary
 * Updates an existing category with new values for name, color, description,
 * parent category, and order.
 *
 * @procedure spCategoryUpdate
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - PUT /api/v1/internal/category/:id
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 *
 * @param {INT} idCategory
 *   - Required: Yes
 *   - Description: Category identifier to update
 *
 * @param {NVARCHAR(50)} name
 *   - Required: Yes
 *   - Description: Category name (2-50 characters)
 *
 * @param {VARCHAR(7)} color
 *   - Required: Yes
 *   - Description: Hexadecimal color code
 *
 * @param {NVARCHAR(200)} description
 *   - Required: No
 *   - Description: Category description (max 200 characters)
 *
 * @param {INT} idCategoryParent
 *   - Required: No
 *   - Description: Parent category identifier
 *
 * @param {INT} order
 *   - Required: Yes
 *   - Description: Display order
 *
 * @returns Success indicator
 *
 * @testScenarios
 * - Valid update of all fields
 * - Valid update of name only
 * - Valid update of parent category
 * - Validation failure for duplicate name
 * - Validation failure for circular reference
 * - Validation failure for default category
 * - Validation failure for non-existent category
 * - Transaction rollback on error
 */
CREATE OR ALTER PROCEDURE [functional].[spCategoryUpdate]
  @idAccount INTEGER,
  @idCategory INTEGER,
  @name NVARCHAR(50),
  @color VARCHAR(7),
  @description NVARCHAR(200) = '',
  @idCategoryParent INTEGER = NULL,
  @order INTEGER
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
   * @throw {cannotModifyDefaultCategory}
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
    ;THROW 51000, 'cannotModifyDefaultCategory', 1;
  END;

  /**
   * @validation Required parameter validation
   * @throw {nameRequired}
   */
  IF @name IS NULL OR LEN(LTRIM(RTRIM(@name))) = 0
  BEGIN
    ;THROW 51000, 'nameRequired', 1;
  END;

  /**
   * @validation Name length validation
   * @throw {nameTooShort}
   * @throw {nameTooLong}
   */
  IF LEN(LTRIM(RTRIM(@name))) < 2
  BEGIN
    ;THROW 51000, 'nameTooShort', 1;
  END;

  IF LEN(@name) > 50
  BEGIN
    ;THROW 51000, 'nameTooLong', 1;
  END;

  /**
   * @validation Name character validation
   * @throw {nameContainsInvalidCharacters}
   */
  IF @name LIKE '%[^a-zA-Z0-9 _-]%'
  BEGIN
    ;THROW 51000, 'nameContainsInvalidCharacters', 1;
  END;

  /**
   * @validation Description length validation
   * @throw {descriptionTooLong}
   */
  IF @description IS NOT NULL AND LEN(@description) > 200
  BEGIN
    ;THROW 51000, 'descriptionTooLong', 1;
  END;

  /**
   * @validation Color format validation
   * @throw {invalidColorFormat}
   */
  IF @color NOT LIKE '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'
  BEGIN
    ;THROW 51000, 'invalidColorFormat', 1;
  END;

  /**
   * @validation Duplicate name validation
   * @throw {categoryNameAlreadyExists}
   */
  IF EXISTS (
    SELECT 1
    FROM [functional].[category] [cat]
    WHERE [cat].[idAccount] = @idAccount
      AND [cat].[name] = @name
      AND [cat].[idCategory] <> @idCategory
      AND [cat].[deleted] = 0
  )
  BEGIN
    ;THROW 51000, 'categoryNameAlreadyExists', 1;
  END;

  /**
   * @validation Self-reference validation
   * @throw {cannotSetCategoryAsOwnParent}
   */
  IF @idCategoryParent = @idCategory
  BEGIN
    ;THROW 51000, 'cannotSetCategoryAsOwnParent', 1;
  END;

  /**
   * @validation Parent category validation
   * @throw {parentCategoryDoesntExist}
   */
  IF @idCategoryParent IS NOT NULL
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM [functional].[category] [cat]
      WHERE [cat].[idCategory] = @idCategoryParent
        AND [cat].[idAccount] = @idAccount
        AND [cat].[deleted] = 0
    )
    BEGIN
      ;THROW 51000, 'parentCategoryDoesntExist', 1;
    END;

    /**
     * @validation Circular reference validation
     * @throw {circularReferenceDetected}
     */
    DECLARE @currentParent INTEGER = @idCategoryParent;
    DECLARE @loopCounter INTEGER = 0;

    WHILE @currentParent IS NOT NULL AND @loopCounter < 10
    BEGIN
      IF @currentParent = @idCategory
      BEGIN
        ;THROW 51000, 'circularReferenceDetected', 1;
      END;

      SELECT @currentParent = [idCategoryParent]
      FROM [functional].[category]
      WHERE [idCategory] = @currentParent
        AND [idAccount] = @idAccount
        AND [deleted] = 0;

      SET @loopCounter = @loopCounter + 1;
    END;

    /**
     * @validation Hierarchy depth validation
     * @throw {maximumHierarchyDepthReached}
     */
    DECLARE @currentLevel INTEGER = 0;
    SET @currentParent = @idCategoryParent;

    WHILE @currentParent IS NOT NULL AND @currentLevel < 5
    BEGIN
      SET @currentLevel = @currentLevel + 1;
      
      SELECT @currentParent = [idCategoryParent]
      FROM [functional].[category]
      WHERE [idCategory] = @currentParent
        AND [idAccount] = @idAccount
        AND [deleted] = 0;
    END;

    IF @currentLevel >= 5
    BEGIN
      ;THROW 51000, 'maximumHierarchyDepthReached', 1;
    END;
  END;

  BEGIN TRY
    BEGIN TRAN;

    /**
     * @rule {db-multi-tenancy,fn-category-update} Update category with account isolation
     */
    UPDATE [functional].[category]
    SET
      [name] = @name,
      [color] = @color,
      [description] = ISNULL(@description, ''),
      [idCategoryParent] = @idCategoryParent,
      [order] = @order,
      [dateModified] = GETUTCDATE()
    WHERE [idCategory] = @idCategory
      AND [idAccount] = @idAccount
      AND [deleted] = 0;

    /**
     * @output {CategoryUpdated, 1, 1}
     * @column {BIT} success - Update success indicator
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