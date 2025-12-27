import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'praktika2',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
