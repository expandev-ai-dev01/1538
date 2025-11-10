/**
 * @summary
 * Creates a new category with specified parameters including optional parent category
 * for hierarchical organization.
 *
 * @procedure spCategoryCreate
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/category
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 *
 * @param {INT} idUser
 *   - Required: Yes
 *   - Description: User identifier who creates the category
 *
 * @param {NVARCHAR(50)} name
 *   - Required: Yes
 *   - Description: Category name (2-50 characters)
 *
 * @param {VARCHAR(7)} color
 *   - Required: No
 *   - Description: Hexadecimal color code (default: #3498db)
 *
 * @param {NVARCHAR(200)} description
 *   - Required: No
 *   - Description: Category description (max 200 characters)
 *
 * @param {INT} idCategoryParent
 *   - Required: No
 *   - Description: Parent category identifier for subcategories
 *
 * @returns {INT} idCategory - Created category identifier
 *
 * @testScenarios
 * - Valid creation with only required fields
 * - Valid creation with all optional fields
 * - Valid creation as subcategory
 * - Validation failure for name length
 * - Validation failure for duplicate name
 * - Validation failure for invalid color format
 * - Validation failure for category limit (50)
 * - Validation failure for hierarchy depth (5 levels)
 * - Validation failure for circular reference
 * - Transaction rollback on error
 */
CREATE OR ALTER PROCEDURE [functional].[spCategoryCreate]
  @idAccount INTEGER,
  @idUser INTEGER,
  @name NVARCHAR(50),
  @color VARCHAR(7) = '#3498db',
  @description NVARCHAR(200) = '',
  @idCategoryParent INTEGER = NULL
AS
BEGIN
  SET NOCOUNT ON;

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
      AND [cat].[deleted] = 0
  )
  BEGIN
    ;THROW 51000, 'categoryNameAlreadyExists', 1;
  END;

  /**
   * @validation Category limit validation
   * @throw {categoryLimitReached}
   */
  IF (SELECT COUNT(*) FROM [functional].[category] [cat] WHERE [cat].[idAccount] = @idAccount AND [cat].[deleted] = 0 AND [cat].[isDefault] = 0) >= 50
  BEGIN
    ;THROW 51000, 'categoryLimitReached', 1;
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
     * @validation Hierarchy depth validation
     * @throw {maximumHierarchyDepthReached}
     */
    DECLARE @currentLevel INTEGER = 0;
    DECLARE @currentParent INTEGER = @idCategoryParent;

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

  DECLARE @idCategory INTEGER;
  DECLARE @nextOrder INTEGER;

  BEGIN TRY
    BEGIN TRAN;

    /**
     * @rule {fn-category-order} Calculate next order position
     */
    SELECT @nextOrder = ISNULL(MAX([order]), 0) + 1
    FROM [functional].[category]
    WHERE [idAccount] = @idAccount
      AND [deleted] = 0;

    /**
     * @rule {db-multi-tenancy,fn-category-creation} Create category with account isolation
     */
    INSERT INTO [functional].[category] (
      [idAccount],
      [idUser],
      [name],
      [color],
      [description],
      [idCategoryParent],
      [order],
      [status],
      [isDefault],
      [dateCreated],
      [dateModified],
      [deleted]
    )
    VALUES (
      @idAccount,
      @idUser,
      @name,
      @color,
      ISNULL(@description, ''),
      @idCategoryParent,
      @nextOrder,
      0,
      0,
      GETUTCDATE(),
      GETUTCDATE(),
      0
    );

    SET @idCategory = SCOPE_IDENTITY();

    /**
     * @output {CategoryCreated, 1, 1}
     * @column {INT} idCategory - Created category identifier
     */
    SELECT @idCategory AS [idCategory];

    COMMIT TRAN;
  END TRY
  BEGIN CATCH
    ROLLBACK TRAN;
    THROW;
  END CATCH;
END;
GO