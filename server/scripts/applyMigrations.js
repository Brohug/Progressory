const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const migrationsDir = path.resolve(__dirname, '..', '..', 'database', 'migrations');

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

const ensureMigrationsTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const getAppliedMigrationSet = async (connection) => {
  const [rows] = await connection.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((row) => row.filename));
};

const getMigrationFiles = () => {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found at ${migrationsDir}`);
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((filename) => filename.endsWith('.sql'))
    .filter((filename) => !filename.toLowerCase().includes('draft'))
    .sort();
};

const requestedMigration = process.argv[2] || '';

const applyMigrations = async () => {
  const connection = await mysql.createConnection(getConnectionConfig());

  try {
    await ensureMigrationsTable(connection);

    const appliedMigrations = await getAppliedMigrationSet(connection);
    const allMigrationFiles = getMigrationFiles();
    const migrationFiles = requestedMigration
      ? allMigrationFiles.filter((filename) => filename === requestedMigration)
      : allMigrationFiles;

    if (requestedMigration && migrationFiles.length === 0) {
      throw new Error(`Migration not found or skipped as draft: ${requestedMigration}`);
    }

    if (migrationFiles.length === 0) {
      console.log('No migration files found to apply.');
      return;
    }

    let appliedCount = 0;

    for (const filename of migrationFiles) {
      if (appliedMigrations.has(filename)) {
        console.log(`Skipping already applied migration: ${filename}`);
        continue;
      }

      const filePath = path.join(migrationsDir, filename);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Applying migration: ${filename}`);
      await connection.beginTransaction();

      try {
        await connection.query(sql);
        await connection.query(
          'INSERT INTO schema_migrations (filename) VALUES (?)',
          [filename]
        );
        await connection.commit();
        appliedCount += 1;
      } catch (error) {
        await connection.rollback();
        throw Object.assign(error, { migrationFilename: filename });
      }
    }

    if (appliedCount === 0) {
      console.log('No pending migrations to apply.');
      return;
    }

    console.log(`Applied ${appliedCount} migration${appliedCount === 1 ? '' : 's'} successfully.`);
  } finally {
    await connection.end();
  }
};

applyMigrations().catch((error) => {
  console.error('Failed to apply migrations:', {
    message: error.message,
    migration: error.migrationFilename,
    code: error.code,
    errno: error.errno,
    sqlState: error.sqlState
  });
  process.exit(1);
});
