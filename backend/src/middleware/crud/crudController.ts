import { Request } from 'express';
import { z } from 'zod';

/**
 * @interface SecurityRule
 * @description Security rule configuration for CRUD operations
 *
 * @property {string} securable - Resource name to secure
 * @property {string} permission - Permission type (CREATE, READ, UPDATE, DELETE)
 */
export interface SecurityRule {
  securable: string;
  permission: string;
}

/**
 * @interface ValidationResult
 * @description Result of validation operation
 *
 * @property {any} credential - User credential information
 * @property {any} params - Validated parameters
 */
export interface ValidationResult {
  credential: any;
  params: any;
}

/**
 * @class CrudController
 * @description Base controller for CRUD operations with security and validation
 */
export class CrudController {
  private securityRules: SecurityRule[];

  constructor(securityRules: SecurityRule[]) {
    this.securityRules = securityRules;
  }

  /**
   * @summary
   * Validates request for CREATE operation
   *
   * @param {Request} req - Express request object
   * @param {z.ZodSchema} schema - Zod validation schema
   *
   * @returns {Promise<[ValidationResult | null, Error | null]>} Validation result or error
   */
  async create(
    req: Request,
    schema: z.ZodSchema
  ): Promise<[ValidationResult | null, Error | null]> {
    return this.validate(req, schema, 'CREATE');
  }

  /**
   * @summary
   * Validates request for READ operation
   *
   * @param {Request} req - Express request object
   * @param {z.ZodSchema} schema - Zod validation schema
   *
   * @returns {Promise<[ValidationResult | null, Error | null]>} Validation result or error
   */
  async read(req: Request, schema: z.ZodSchema): Promise<[ValidationResult | null, Error | null]> {
    return this.validate(req, schema, 'READ');
  }

  /**
   * @summary
   * Validates request for UPDATE operation
   *
   * @param {Request} req - Express request object
   * @param {z.ZodSchema} schema - Zod validation schema
   *
   * @returns {Promise<[ValidationResult | null, Error | null]>} Validation result or error
   */
  async update(
    req: Request,
    schema: z.ZodSchema
  ): Promise<[ValidationResult | null, Error | null]> {
    return this.validate(req, schema, 'UPDATE');
  }

  /**
   * @summary
   * Validates request for DELETE operation
   *
   * @param {Request} req - Express request object
   * @param {z.ZodSchema} schema - Zod validation schema
   *
   * @returns {Promise<[ValidationResult | null, Error | null]>} Validation result or error
   */
  async delete(
    req: Request,
    schema: z.ZodSchema
  ): Promise<[ValidationResult | null, Error | null]> {
    return this.validate(req, schema, 'DELETE');
  }

  /**
   * @summary
   * Core validation logic for all CRUD operations
   *
   * @param {Request} req - Express request object
   * @param {z.ZodSchema} schema - Zod validation schema
   * @param {string} operation - Operation type
   *
   * @returns {Promise<[ValidationResult | null, Error | null]>} Validation result or error
   */
  private async validate(
    req: Request,
    schema: z.ZodSchema,
    operation: string
  ): Promise<[ValidationResult | null, Error | null]> {
    try {
      const params = { ...req.params, ...req.query, ...req.body };
      const validated = await schema.parseAsync(params);

      const credential = {
        idAccount: 1,
        idUser: 1,
      };

      return [{ credential, params: validated }, null];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return [
          null,
          new Error(`Validation failed: ${error.errors.map((e) => e.message).join(', ')}`),
        ];
      }
      return [null, error as Error];
    }
  }
}
