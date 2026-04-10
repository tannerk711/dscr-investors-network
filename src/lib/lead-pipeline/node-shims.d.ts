/**
 * Minimal ambient declarations for the Node.js globals and modules used
 * by the lead pipeline. We don't want to pull in the full `@types/node`
 * dependency just for this (per the W1-D constraint "NO new npm deps"),
 * so we declare only what we actually touch:
 *
 * - `process.env` for reading env vars in the serverless runtime
 * - `node:crypto` for the SHA-256 hashing used by Meta CAPI
 *
 * At runtime, Vercel's Node.js function runtime provides both. The real
 * types live in @types/node and can replace these shims whenever that
 * dependency is introduced later.
 */

declare const process: {
  env: Record<string, string | undefined>;
};

declare module 'node:crypto' {
  interface Hash {
    update(data: string): Hash;
    digest(encoding: 'hex'): string;
  }
  export function createHash(algorithm: 'sha256'): Hash;
}
