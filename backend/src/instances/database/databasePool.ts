import sql from 'mssql';
import { config } from '@/config';

/**
 * @summary
 * Database connection pool management
 *
 * @module databasePool
 */

let pool: sql.ConnectionPool | null = null;

/**
 * @summary
 * Gets or creates database connection pool
 *
 * @function getPool
 *
 * @returns {Promise<sql.ConnectionPool>} Database connection pool
 *
 * @throws {Error} When connection fails
 */
export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    const dbConfig: sql.config = {
      server: config.database.server,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      options: {
        encrypt: config.database.options.encrypt,
        trustServerCertificate: config.database.options.trustServerCertificate,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };

    pool = new sql.ConnectionPool(dbConfig);

    pool.on('error', (err) => {
      console.error('Database pool error:', err);
      pool = null;
    });

    await pool.connect();
    console.log('Database connection pool established');
  }

  return pool;
}

/**
 * @summary
 * Closes database connection pool
 *
 * @function closePool
 *
 * @returns {Promise<void>}
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Database connection pool closed');
  }
}
