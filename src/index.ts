import { Hono } from 'hono';
import { createYoga, createSchema } from 'graphql-yoga';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { users, game, review } from './db/schema';

// --- Type Definitions ---

type Bindings = {
  my_db_graphql: D1Database;
};

type GraphQLContext = Bindings & {
  db: ReturnType<typeof drizzle>;
};

// --- Hono App Setup ---

const app = new Hono<{ Bindings: Bindings }>();

// --- GraphQL Schema ---

const typeDefs = /* GraphQL */ `
  type User {
    id: Int!
    name: String!
    email: String!
    reviews: [Review!]!
  }

  type Game {
    id: Int!
    name: String!
    description: String!
    price: Int!
    platform: [String!]!
    reviews: [Review!]!
  }

  type Review {
    id: Int!
    rating: Int!
    comment: String!
    user: User!
    game: Game!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    games: [Game!]!
    game(id: Int!): Game
    reviews: [Review!]!
    review(id: Int!): Review
  }

  input EditGameInput {
    name: String
    description: String
    price: Int
    platform: [String!]
  }

  type Mutation {
    addUser(name: String!, email: String!): User!
    addGame(name: String!, description: String!, price: Int!, platform: [String!]!): Game!
    addReview(rating: Int!, comment: String!, gameId: Int!, userId: Int!): Review!
    deleteUser(id: Int!): User!
    deleteGame(id: Int!): Game!
    deleteReview(id: Int!): Review!
    updateGame(id: Int!, input: EditGameInput!): Game!
  }
`;

const schema = createSchema<GraphQLContext>({
  typeDefs,
  resolvers: {
    Query: {
      users: async (_, __, { db }) => {
        return await db.select().from(users).all();
      },
      user: async (_, { id }, { db }) => {
        const result = await db.select().from(users).where(eq(users.id, id)).get();
        if (!result) {
          throw new GraphQLError(`User with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        return result;
      },
      games: async (_, __, { db }) => {
        return await db.select().from(game).all();
      },
      game: async (_, { id }, { db }) => {
        const result = await db.select().from(game).where(eq(game.id, id)).get();
        if (!result) {
          throw new GraphQLError(`Game with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        return result;
      },
      reviews: async (_, __, { db }) => {
        return await db.select().from(review).all();
      },
      review: async (_, { id }, { db }) => {
        const result = await db.select().from(review).where(eq(review.id, id)).get();
        if (!result) {
          throw new GraphQLError(`Review with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        return result;
      },
    },
    Game: {
      reviews: async (parent, _, { db }) => {
        return await db.select().from(review).where(eq(review.gameId, parent.id)).all();
      },
    },
    User: {
      reviews: async (parent, _, { db }) => {
        return await db.select().from(review).where(eq(review.userId, parent.id)).all();
      },
    },
    Review: {
      user: async (parent, _, { db }) => {
        const result = await db.select().from(users).where(eq(users.id, parent.userId)).get();
        if (!result) {
          throw new GraphQLError(`User not found for review ${parent.id}`, { extensions: { code: 'NOT_FOUND' } });
        }
        return result;
      },
      game: async (parent, _, { db }) => {
        const result = await db.select().from(game).where(eq(game.id, parent.gameId)).get();
        if (!result) {
          throw new GraphQLError(`Game not found for review ${parent.id}`, { extensions: { code: 'NOT_FOUND' } });
        }
        return result;
      },
    },
    Mutation: {
      addUser: async (_, { name, email }, { db }) => {
        const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
        if (existingUser) {
          throw new GraphQLError(`User with email ${email} already exists`, {
            extensions: { code: 'CONFLICT' },
          });
        }
        const result = await db.insert(users).values({ name, email }).returning().get();
        return result;
      },
      addGame: async (_, { name, description, price, platform }, { db }) => {
        const existingGame = await db.select().from(game).where(eq(game.name, name)).get();
        if (existingGame) {
          throw new GraphQLError(`Game with name ${name} already exists`, {
            extensions: { code: 'CONFLICT' },
          });
        }
        const result = await db.insert(game).values({ name, description, price, platform }).returning().get();
        return result;
      },
      addReview: async (_, { rating, comment, gameId, userId }, { db }) => {
        // Optional: specific check if user/game exists before inserting review, but FK constraints might handle it (if enforced by D1, usually not strict in SQLite without PRAGMA foreign_keys=ON)
        const result = await db.insert(review).values({ rating, comment, gameId, userId }).returning().get();
        return result;
      },
      deleteUser: async (_, { id }, { db }) => {
        // Check existence first to return the object and ensure valid ID
        const user = await db.select().from(users).where(eq(users.id, id)).get();
        if (!user) {
          throw new GraphQLError(`User with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        // Cascade delete reviews
        await db.delete(review).where(eq(review.userId, id));
        // Delete user
        await db.delete(users).where(eq(users.id, id));

        return user;
      },
      deleteGame: async (_, { id }, { db }) => {
        const gameToDelete = await db.select().from(game).where(eq(game.id, id)).get();
        if (!gameToDelete) {
          throw new GraphQLError(`Game with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        // Cascade delete reviews
        await db.delete(review).where(eq(review.gameId, id));
        // Delete game
        await db.delete(game).where(eq(game.id, id));

        return gameToDelete;
      },
      deleteReview: async (_, { id }, { db }) => {
        const reviewToDelete = await db.select().from(review).where(eq(review.id, id)).get();
        if (!reviewToDelete) {
          throw new GraphQLError(`Review with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        await db.delete(review).where(eq(review.id, id));
        return reviewToDelete;
      },
      updateGame: async (_, { id, input }, { db }) => {
        const result = await db.update(game).set(input).where(eq(game.id, id)).returning().get();
        if (!result) {
          throw new GraphQLError(`Game with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        return result;
      },
    },
  },
});

// --- Server Configuration ---

const yoga = createYoga({
  schema,
  context: (initialContext: Bindings) => ({
    db: drizzle(initialContext.my_db_graphql),
  }),
  graphqlEndpoint: '/graphql',
});

// --- Routes & Error Handling ---

app.all('/graphql', (c) => yoga.fetch(c.req.raw, c.env));

app.notFound((c) => {
  return c.json({ message: 'Not Found', status: 404 }, 404);
});

app.onError((err, c) => {
  console.error('Global Error:', err);
  return c.json({ message: 'Internal Server Error', status: 500 }, 500);
});

export default app;
