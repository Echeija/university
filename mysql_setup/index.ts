import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.ts';

// For XAMPP, default user is usually 'root' with no password.
// Adjust the connection string as needed.
const poolConnection = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DB_NAME || 'school_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });
