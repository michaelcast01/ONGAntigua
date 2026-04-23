const { Pool } = require('pg');

function convertPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function normalizeResult(result) {
  if (result.command === 'SELECT') {
    return [result.rows];
  }

  if (result.command === 'INSERT') {
    const firstRow = result.rows[0] || {};
    const firstValue = Object.values(firstRow)[0] || null;
    return [{ insertId: firstValue, affectedRows: result.rowCount }];
  }

  return [{ affectedRows: result.rowCount }];
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ONG',
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

module.exports = {
  async query(sql, params = []) {
    const normalizedSql = convertPlaceholders(sql);
    const shouldReturnInsertId = /^\s*insert\s+/i.test(sql) && !/\breturning\b/i.test(sql);
    const finalSql = shouldReturnInsertId ? `${normalizedSql.trim()} RETURNING *` : normalizedSql;
    const result = await pool.query(finalSql, params);
    return normalizeResult(result);
  },
  async end() {
    await pool.end();
  },
};
