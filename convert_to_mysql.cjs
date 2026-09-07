const fs = require('fs');
const path = require('path');

const schemaPath = 'src/db/schema.ts';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace imports
schema = schema.replace(
  /import \{ (.*?) \} from 'drizzle-orm\/pg-core';/,
  "import { mysqlTable, int, varchar, text, timestamp, boolean, json, double, mysqlEnum } from 'drizzle-orm/mysql-core';"
);

// Replace pgTable with mysqlTable
schema = schema.replace(/pgTable/g, 'mysqlTable');

// Replace serial('id') with int('id').autoincrement()
schema = schema.replace(/serial\('([^']+)'\)/g, "int('$1').autoincrement()");

// Replace integer with int
schema = schema.replace(/integer\(/g, 'int(');

// Replace jsonb with json
schema = schema.replace(/jsonb\(/g, 'json(');

// Replace doublePrecision with double
schema = schema.replace(/doublePrecision\(/g, 'double(');

// Convert text('name') to varchar('name', { length: 255 }) for those with default or unique, 
// but it's simpler to just replace all text( with varchar( and add length: 255 if it doesn't have an options object.
// Wait, regex replacing text is tricky because of the second argument.
// Let's just keep text() since MySQL supports TEXT, but MySQL TEXT cannot have DEFAULT values in some versions/strict modes.
// Let's replace text('field').default('val') with varchar('field', { length: 255 }).default('val').

// Actually, Drizzle allows text in MySQL, but defaults on TEXT throw errors in MySQL.
// Let's replace ALL `text('something')` with `varchar('something', { length: 255 })`
schema = schema.replace(/text\('([^']+)'\)/g, "varchar('$1', { length: 255 })");
// For the ones that had an options object: `text('role', { enum: [...] })`
schema = schema.replace(/text\('([^']+)',\s*\{/g, "varchar('$1', { length: 255,");

// MySQL boolean is tinyint(1). Drizzle boolean() works.
// MySQL timestamp: .notNull() without .default() is fine.

fs.mkdirSync('mysql_setup', { recursive: true });
fs.writeFileSync('mysql_setup/schema.ts', schema);

const indexTs = `import { drizzle } from 'drizzle-orm/mysql2';
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
`;
fs.writeFileSync('mysql_setup/index.ts', indexTs);

const drizzleConfig = `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './mysql_setup/schema.ts',
  out: './mysql_setup/drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_db',
  }
});
`;
fs.writeFileSync('mysql_setup/drizzle.config.ts', drizzleConfig);

const instructions = `================================================
XAMPP / MySQL DEPLOYMENT INSTRUCTIONS
================================================

To deploy this application on your local XAMPP server with MySQL, follow these steps:

1. UPDATE DEPENDENCIES
   In your terminal, remove the PostgreSQL packages and install the MySQL ones:
   npm uninstall pg drizzle-orm/node-postgres @types/pg
   npm install mysql2 drizzle-orm

2. REPLACE DATABASE CONNECTION & SCHEMA
   Replace your existing PostgreSQL database files with the ones provided in this folder:
   - Copy \`mysql_setup/schema.ts\` to \`src/db/schema.ts\` (overwrite the existing file).
   - Copy \`mysql_setup/index.ts\` to \`src/db/index.ts\` (overwrite the existing file).
   - Copy \`mysql_setup/drizzle.config.ts\` to the root of your project \`drizzle.config.ts\` (overwrite).

3. START YOUR XAMPP SERVER
   - Open the XAMPP Control Panel.
   - Start the "Apache" and "MySQL" modules.
   - Open phpMyAdmin (http://localhost/phpmyadmin) and create a new database called \`school_db\` (or whatever name you prefer).

4. SET ENVIRONMENT VARIABLES
   Create a \`.env\` file in the root of your project (or update your existing one) with the MySQL credentials:
   MYSQL_HOST="localhost"
   MYSQL_USER="root"
   MYSQL_PASSWORD="" 
   MYSQL_DB_NAME="school_db"

5. GENERATE & PUSH DATABASE TABLES
   Run Drizzle Kit to generate and push the tables to your MySQL database:
   npx drizzle-kit generate
   npx drizzle-kit push

6. RUN THE APPLICATION
   Start the Node.js server and React frontend:
   npm run dev

You can now use the application locally connected to your XAMPP MySQL database!
`;
fs.writeFileSync('mysql_setup/README_MYSQL.txt', instructions);

console.log("MySQL files generated in mysql_setup folder.");
