import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    driver: 'd1-http',
    dbCredentials: {
        accountId: 'TODO_ACCOUNT_ID',
        databaseId: '27ac6ddd-217d-425c-8c2b-293eb3679c07',
        token: 'TODO_TOKEN',
    },
});
