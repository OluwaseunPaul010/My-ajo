import path from "path";
import { defineConfig } from "prisma/config";
import { PrismaNeon } from "@prisma/adapter-neon";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    async adapter() {
      const connectionString = process.env.DATABASE_URL!;
      const adapter = new PrismaNeon({ connectionString });
      return adapter;
    },
  },
});