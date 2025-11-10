import sql from 'mssql';
import { getPool } from '@/instances/database';

/**
 * @enum ExpectedReturn
 * @description Expected return type from stored procedure
 */
export enum ExpectedReturn {
  None = 'None',
  Single = 'Single',
  Multi = 'Multi',
}

/**
 * @interface IRecordSet
 * @description Generic record set interface
 */
export interface IRecordSet<T = any> {
  [key: string]: any;
}

/**
 * @summary
 * Executes a stored procedure and returns the result
 *
 * @function dbRequest
 * @module database
 *
 * @param {string} routine - Stored procedure name with schema
 * @param {object} parameters - Procedure parameters
 * @param {ExpectedReturn} expectedReturn - Expected return type
 * @param {sql.Transaction} transaction - Optional transaction
 * @param {string[]} resultSetNames - Optional result set names for Multi return
 *
 * @returns {Promise<any>} Procedure execution result
 *
 * @throws {Error} When database operation fails
 */
export async function dbRequest(
  routine: string,
  parameters: { [key: string]: any },
  expectedReturn: ExpectedReturn,
  transaction?: sql.Transaction,
  resultSetNames?: string[]
): Promise<any> {
  try {
    const pool = await getPool();
    const request = transaction ? new sql.Request(transaction) : pool.request();

    // Add parameters to request
    Object.keys(parameters).forEach((key) => {
      request.input(key, parameters[key]);
    });

    // Execute stored procedure
    const result = await request.execute(routine);

    // Return based on expected type
    switch (expectedReturn) {
      case ExpectedReturn.None:
        return null;

      case ExpectedReturn.Single:
        return result.recordset && result.recordset.length > 0 ? result.recordset[0] : null;

      case ExpectedReturn.Multi:
        if (resultSetNames && resultSetNames.length > 0) {
          const namedResults: { [key: string]: IRecordSet } = {};
          resultSetNames.forEach((name, index) => {
            namedResults[name] = result.recordsets[index] || [];
          });
          return namedResults;
        }
        return result.recordsets || [];

      default:
        return result.recordset;
    }
  } catch (error: any) {
    console.error('Database request error:', {
      routine,
      parameters,
      error: error.message,
    });
    throw error;
  }
}
