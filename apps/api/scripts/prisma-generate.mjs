import { spawn } from 'node:child_process';
import path from 'node:path';

const workingDirectory = path.resolve(import.meta.dirname, '..');
const prismaCli = path.resolve(
  import.meta.dirname,
  '../../../node_modules/prisma/build/index.js',
);

const child = spawn(process.execPath, [prismaCli, 'generate'], {
  cwd: workingDirectory,
  env: {
    ...process.env,
    PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary',
    PRISMA_CLIENT_ENGINE_TYPE: 'library',
  },
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error('Failed to run Prisma generate.', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
