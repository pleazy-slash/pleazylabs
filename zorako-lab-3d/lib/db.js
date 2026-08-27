import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.USER || 'u0_a368',
  host: '127.0.0.1',
  database: 'zorako_db',
  port: 5432,
});

export default pool;
