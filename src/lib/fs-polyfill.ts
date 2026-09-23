/**
 * Promises FS polyfill para Vercel serverless.
 * En Vercel, /tmp es el único directorio escribible.
 * Para desarrollo local, usa el cwd.
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const IS_VERCEL = !!process.env.VERCEL;
const TMP_DIR = IS_VERCEL ? '/tmp' : process.cwd();

export { fs, path, TMP_DIR };
export default { fs, path, TMP_DIR };
