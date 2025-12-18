import { Hono } from 'hono';
import { createYoga, createSchema } from 'graphql-yoga';
import { drizzle } from 'drizzle-orm/d1';
import { users, game, review } from './db/schema';
import { eq } from 'drizzle-orm';
import { __Directive } from 'graphql';

// Define the bindings environment
type Bindings = {
  my_db_graphql: D1Database;
};

type GraphQLContext = Bindings & {
  db: ReturnType<typeof drizzle>;
};

// Create the Hono app
const app = new Hono<{ Bindings: Bindings }>();

// Define GraphQL Schema
const schema = createSchema<GraphQLContext>({
  typeDefs: /* GraphQL */ `
  
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


  `,
  resolvers: {
    Query: {
      users: async (_, __, context) => {
        const result = await context.db.select().from(users).all();
        return result;
      },
      user: async (_, { id }, context) => {
        const result = await context.db.select().from(users).where(eq(users.id, id)).all();
        return result[0];
      },
      games: async (_, __, context) => {
        const result = await context.db.select().from(game).all()
        return result;
      },
      game: async (_, { id }, context) => {
        const result = await context.db.select().from(game).where(eq(game.id, id)).all();
        return result[0];
      },
      reviews: async (_, __, context) => {
        const result = await context.db.select().from(review).all();
        return result;
      },
      review: async (_, { id }, context) => {
        const result = await context.db.select().from(review).where(eq(review.id, id)).all();
        return result[0];
      }
    },
    Game: {
      reviews: async (parent, _, context) => {
        const result = await context.db.select().from(review).where(eq(review.gameId, parent.id)).all();
        return result;
      }
    },
    User: {
      reviews: async (parent, _, context) => {
        const result = await context.db.select().from(review).where(eq(review.userId, parent.id)).all();
        return result;
      }
    },
    Review: {
      user: async (parent, _, context) => {
        const result = await context.db.select().from(users).where(eq(users.id, parent.userId)).get();
        return result;
      },
      game: async (parent, _, context) => {
        const result = await context.db.select().from(game).where(eq(game.id, parent.gameId)).get();
        return result;
      }
    },
    Mutation: {
      addUser: async (_, { name, email }, context) => {
        const result = await context.db.insert(users).values({ name, email }).returning();
        return result[0];
      },
      addGame: async (_, { name, description, price, platform }, context) => {
        const result = await context.db.insert(game).values({ name, description, price, platform }).returning();
        return result[0];
      },
      addReview: async (_, { rating, comment, gameId, userId }, context) => {
        const result = await context.db.insert(review).values({ rating, comment, gameId, userId }).returning();
        return result[0];
      },
      deleteUser: async (_, { id }, context) => {
        const deletedReviews = await context.db.delete(review).where(eq(review.userId, id)).returning();
        const deletedUser = await context.db.delete(users).where(eq(users.id, id)).returning();
        return deletedUser[0];
      },
      deleteReview: async (_, { id }, context) => {
        const deletedReview = await context.db.delete(review).where(eq(review.id, id)).returning();
        return deletedReview[0];
      },
      deleteGame: async (_, { id }, context) => {
        const deletedReviews = await context.db.delete(review).where(eq(review.gameId, id)).returning();
        const deletedGame = await context.db.delete(game).where(eq(game.id, id)).returning();
        return deletedGame[0];
      },
      updateGame: async (_, { id, input }, context) => {
        const result = await context.db.update(game).set(input).where(eq(game.id, id)).returning();
        return result[0];
      },


    },
  },
});

// Create Yoga instance
const yoga = createYoga({
  schema,
  context: (initialContext: Bindings) => {
    // The second argument passed to yoga.fetch (c.env) is merged into initialContext
    return {
      db: drizzle(initialContext.my_db_graphql),
    };
  },
  graphqlEndpoint: '/graphql',
});

// Handle GraphQL requests
app.all('/graphql', (c) => {
  return yoga.fetch(c.req.raw, c.env);
});

export default app;
