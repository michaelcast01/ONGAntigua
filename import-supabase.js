require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const filePath = path.join(__dirname, 'database', 'supabase_import.sql');
  const sql = await fs.readFile(filePath, 'utf8');

  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    await client.query(sql);
    console.log('Importacion completada');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
