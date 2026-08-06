import { createPool } from './src/db/index.js';

async function run() {
  const pool = createPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created system_settings table');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
