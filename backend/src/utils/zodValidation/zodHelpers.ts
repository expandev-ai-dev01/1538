import { z } from 'zod';

/**
 * @summary
 * Reusable Zod validation schemas and helpers
 *
 * @module zodHelpers
 */

// String validators
export const zString = z.string().min(1);
export const zNullableString = (maxLength?: number) => {
  let schema = z.string();
  if (maxLength) {
    schema = schema.max(maxLength);
  }
  return schema.nullable();
};

export const zName = z.string().min(1).max(200);
export const zNullableDescription = z.string().max(500).nullable();

// Number validators
export const zFK = z.number().int().positive();
export const zNullableFK = z.number().int().positive().nullable();
export const zBit = z.number().int().min(0).max(1);

// Date validators
export const zDate = z.coerce.date();
export const zNullableDate = z.coerce.date().nullable();
export const zDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// Numeric validators
export const zNumeric = z.number();
export const zNullableNumeric = z.number().nullable();
export const zPrice = z.number().min(0);
export const zNullablePrice = z.number().min(0).nullable();
