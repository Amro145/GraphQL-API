import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
});
export const game = sqliteTable('game', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    price: integer('price').notNull(),
    platform: text('platform', { mode: 'json' }).$type<string[]>().notNull(),

});
export const review = sqliteTable('review', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment').notNull(),
    gameId: integer('game_id').notNull().references(() => game.id),
    userId: integer('user_id').notNull().references(() => users.id),

});
