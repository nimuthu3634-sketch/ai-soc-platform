import path from 'node:path';

import EmbeddedPostgres from 'embedded-postgres';

const databaseDir = path.resolve(import.meta.dirname, '../.postgres-data');
const databaseName = 'aegis_core';

const pg = new EmbeddedPostgres({
  authMethod: 'password',
  databaseDir,
  password: 'postgres',
  persistent: true,
  port: 5432,
  user: 'postgres',
});

async function ensureDatabase() {
  const client = pg.getPgClient();
  await client.connect();

  try {
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      databaseName,
    ]);

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${databaseName}`);
    }
  } finally {
    await client.end();
  }
}

async function main() {
  await pg.initialise();
  await pg.start();
  await ensureDatabase();

  console.log('Embedded PostgreSQL is running.');
  console.log(`Data directory: ${databaseDir}`);
  console.log(`Database: ${databaseName}`);
  console.log('Connection URL: postgresql://postgres:postgres@localhost:5432/aegis_core?schema=public');
}

void main().catch((error) => {
  console.error('Failed to start embedded PostgreSQL.', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await pg.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pg.stop();
  process.exit(0);
});
