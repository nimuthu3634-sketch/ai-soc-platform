import EmbeddedPostgres from 'embedded-postgres';
import fs from 'node:fs/promises';
import path from 'node:path';

const databaseDir = path.resolve(import.meta.dirname, '../.postgres-data');
const databaseName = 'aegis_core';
const databaseUser = 'postgres';
const databasePassword = 'postgres';
const databasePort = 5433;
const databaseEncoding = 'UTF8';
const databaseVersionFile = path.resolve(databaseDir, 'PG_VERSION');
const databasePidFile = path.resolve(databaseDir, 'postmaster.pid');

type EmbeddedPostgresQueryResult<T> = {
  rowCount: number | null;
  rows: T[];
};

type EmbeddedPostgresClient = {
  connect(): Promise<void>;
  query<T>(text: string, values?: unknown[]): Promise<EmbeddedPostgresQueryResult<T>>;
  end(): Promise<void>;
};

const pg = new EmbeddedPostgres({
  authMethod: 'password',
  databaseDir,
  initdbFlags: [`--encoding=${databaseEncoding}`],
  password: databasePassword,
  persistent: true,
  port: databasePort,
  user: databaseUser,
});

function createPgClient(database = 'postgres') {
  return pg.getPgClient(database) as unknown as EmbeddedPostgresClient;
}

async function ensureDatabase() {
  const client = createPgClient();
  await client.connect();

  try {
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`Created database "${databaseName}".`);
    } else {
      console.log(`Database "${databaseName}" already exists.`);
    }
  } finally {
    await client.end();
  }
}

async function getDatabaseEncoding(database: string) {
  const client = createPgClient();
  await client.connect();

  try {
    const result = await client.query<{ encoding: string }>(
      'SELECT pg_encoding_to_char(encoding) AS encoding FROM pg_database WHERE datname = $1',
      [database]
    );

    return result.rows[0]?.encoding ?? null;
  } finally {
    await client.end();
  }
}

async function warnIfDatabaseEncodingIsUnexpected() {
  const encoding = await getDatabaseEncoding(databaseName);

  if (encoding === null || encoding === databaseEncoding) {
    return;
  }

  console.warn(
    `Warning: database "${databaseName}" is using ${encoding} instead of ${databaseEncoding}.`
  );
  console.warn(
    `If Prisma SQL workflows fail on Windows, stop PostgreSQL, remove "${databaseDir}", and run "npm run db:start" again to recreate the cluster with ${databaseEncoding}.`
  );
}

async function isDatabaseClusterInitialized() {
  try {
    await fs.access(databaseVersionFile);
    return true;
  } catch {
    return false;
  }
}

async function hasPartialDatabaseDirectory() {
  try {
    const entries = await fs.readdir(databaseDir);
    return entries.length > 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

async function isDatabaseClusterRunning() {
  const client = createPgClient();

  try {
    await client.connect();
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function removeStalePidFile() {
  let pidFileContents: string;

  try {
    pidFileContents = await fs.readFile(databasePidFile, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return;
    }

    throw error;
  }

  const [pidLine] = pidFileContents.split(/\r?\n/, 1);
  const pid = Number(pidLine);

  if (!Number.isInteger(pid) || pid <= 0) {
    return;
  }

  try {
    process.kill(pid, 0);
  } catch {
    await fs.rm(databasePidFile, { force: true });
    console.log('Removed stale embedded PostgreSQL lock file.');
  }
}

function logConnectionDetails(statusMessage: string) {
  console.log(statusMessage);
  console.log(`Data directory: ${databaseDir}`);
  console.log(`Database: ${databaseName}`);
  console.log(
    `Connection URL: postgresql://${databaseUser}:${databasePassword}@localhost:${databasePort}/${databaseName}?schema=public`
  );
}

async function shutdown() {
  try {
    await pg.stop();
    console.log('Embedded PostgreSQL stopped.');
  } catch (error) {
    console.error('Error while stopping embedded PostgreSQL:', error);
  } finally {
    process.exit(0);
  }
}

async function main() {
  const clusterInitialized = await isDatabaseClusterInitialized();

  if (clusterInitialized && (await isDatabaseClusterRunning())) {
    await ensureDatabase();
    await warnIfDatabaseEncodingIsUnexpected();
    logConnectionDetails('Embedded PostgreSQL is already running.');
    return;
  }

  if (clusterInitialized) {
    await removeStalePidFile();
    console.log('Using existing embedded PostgreSQL data directory.');
  } else {
    if (await hasPartialDatabaseDirectory()) {
      throw new Error(
        `The data directory at "${databaseDir}" exists but is not a valid PostgreSQL cluster. Remove it and run "npm run db:start" again.`
      );
    }

    await pg.initialise();
    console.log('Initialized embedded PostgreSQL data directory.');
  }

  await pg.start();
  await ensureDatabase();
  await warnIfDatabaseEncodingIsUnexpected();
  logConnectionDetails('Embedded PostgreSQL is running.');
}

void main().catch((error) => {
  console.error('Failed to start embedded PostgreSQL.');
  console.error(error);
  process.exit(1);
});

process.on('SIGINT', () => {
  void shutdown();
});

process.on('SIGTERM', () => {
  void shutdown();
});
