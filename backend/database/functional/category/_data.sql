/**
 * @load category
 */
INSERT INTO [functional].[category]
([idAccount], [idUser], [name], [color], [description], [idCategoryParent], [order], [status], [isDefault], [dateCreated], [dateModified], [deleted])
VALUES
(1, 1, 'Trabalho', '#3498db', 'Tarefas relacionadas ao trabalho', NULL, 1, 0, 1, GETUTCDATE(), GETUTCDATE(), 0),
(1, 1, 'Pessoal', '#2ecc71', 'Tarefas pessoais', NULL, 2, 0, 1, GETUTCDATE(), GETUTCDATE(), 0),
(1, 1, 'Estudo', '#9b59b6', 'Tarefas de estudo e aprendizado', NULL, 3, 0, 1, GETUTCDATE(), GETUTCDATE(), 0),
(1, 1, 'Casa', '#e74c3c', 'Tarefas domésticas', NULL, 4, 0, 1, GETUTCDATE(), GETUTCDATE(), 0),
(1, 1, 'Saúde', '#1abc9c', 'Tarefas relacionadas à saúde', NULL, 5, 0, 1, GETUTCDATE(), GETUTCDATE(), 0);
GO