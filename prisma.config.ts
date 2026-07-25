import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 Configuration File
 *
 * Connection URLs are now configured here instead of schema.prisma.
 * - DATABASE_URL: Connection pooling (Transaction mode, port 6543) — used at runtime
 * - DIRECT_URL: Direct connection (port 5432) — used for Prisma Migrate
 *
 * See: https://pris.ly/d/config-datasource
 */
export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
