const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const schemaPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');

const getConnectionConfig = () => {
  const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;

  if (connectionUrl) {
    return {
      uri: connectionUrl,
      multipleStatements: true
    };
  }

  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  };
};

const applySchema = async () => {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }

  const rawSchema = fs.readFileSync(schemaPath, 'utf8');
  const safeSchema = rawSchema.replace(/^CREATE TABLE\s+/gim, 'CREATE TABLE IF NOT EXISTS ');
  const connection = await mysql.createConnection(getConnectionConfig());

  try {
    await connection.query(safeSchema);
    console.log('Schema applied successfully.');
  } finally {
    await connection.end();
  }
};

applySchema().catch((error) => {
  console.error('Failed to apply schema:', {
    message: error.message,
    code: error.code,
    errno: error.errno,
    sqlState: error.sqlState
  });
  process.exit(1);
});
