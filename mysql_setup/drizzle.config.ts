import { defineConfig } from 'drizzle-kit';

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
