// Prisma 7 config — datasource URLs live here, not in schema.prisma.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DATABASE_URL: pooled connection used by the running app.
    // DIRECT_URL:   direct connection used by `prisma migrate` /
    //               `prisma db push`. On Supabase, this is the non-pooled URL
    //               on port 5432. Falls back to DATABASE_URL when only one
    //               URL is configured (local dev).
    url:
      process.env["DIRECT_URL"] ||
      process.env["DATABASE_URL"],
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
