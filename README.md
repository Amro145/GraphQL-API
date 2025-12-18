    # 🚀 Modern GraphQL API with Hono, Drizzle & Cloudflare Workers

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-orange?logo=cloudflare)
![GraphQL Yoga](https://img.shields.io/badge/GraphQL_Yoga-pink?logo=graphql)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-lightgreen?logo=drizzle)

A high-performance, edge-ready GraphQL API built with **Hono**, **GraphQL Yoga**, and **Drizzle ORM**, deployed on **Cloudflare Workers** with **D1 Database**.

---

## ✨ Features

- **Edge Computing**: Deployed on Cloudflare Workers for global low-latency.
- **Type-Safe ORM**: Uses Drizzle ORM for robust SQLite (D1) interactions.
- **GraphQL Yoga**: Full-featured GraphQL server with GraphiQL IDE.
- **Efficient Querying**: Optimized resolvers with Drizzle's `.get()` and `.all()`.
- **Relationship Management**: Cascade deletes for Users, Games, and Reviews.
- **Error Handling**: Custom global error handling and typed GraphQL errors.

---

## 🛠️ Tech Stack

- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Framework**: [Hono](https://hono.dev/)
- **GraphQL**: [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.13.0 or higher)
- [npm](https://www.npmjs.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`npm install -g wrangler`)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Amro145/GraphQL-API.git
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup D1 Database (Local)**
    Generate migrations and apply them locally:
    ```bash
    npx drizzle-kit generate
    npx wrangler d1 execute my_db_graphql --local --file=drizzle/0000_typical_chronomancer.sql
    # Apply subsequent migrations as needed
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:8787/graphql`.

---

## 🗄️ Database Schema

The project uses three main tables:

- **Users**: `id`, `name`, `email`
- **Games**: `id`, `name`, `description`, `price`, `platform` (JSON)
- **Reviews**: `id`, `rating`, `comment`, `userId` (FK), `gameId` (FK)

---

## 📚 GraphQL API

Access the **GraphiQL Playground** at `/graphql` to explore the schema.

### Queries

- `users`: Fetch all users.
- `user(id: Int!)`: Fetch a single user by ID.
- `games`: Fetch all games.
- `game(id: Int!)`: Fetch a single game by ID.
- `reviews`: Fetch all reviews.
- `review(id: Int!)`: Fetch a review by ID.

### Mutations

- **Create**:
    - `addUser(name: String!, email: String!): User!`
    - `addGame(name: String!, description: String!, price: Int!, platform: [String!]!): Game!`
    - `addReview(rating: Int!, comment: String!, gameId: Int!, userId: Int!): Review!`
- **Update**:
    - `updateGame(id: Int!, input: EditGameInput!): Game!`
- **Delete**:
    - `deleteUser(id: Int!): User!` (Cascades to reviews)
    - `deleteGame(id: Int!): Game!` (Cascades to reviews)
    - `deleteReview(id: Int!): Review!`

---

## 📦 Deployment

1.  **Login to Cloudflare**
    ```bash
    npx wrangler login
    ```

2.  **Deploy to Cloudflare Workers**
    ```bash
    npm run deploy
    ```

3.  **Apply Migrations to Remote D1**
    ```bash
    npx wrangler d1 execute my_db_graphql --remote --file=drizzle/xxxx_migration.sql
    ```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
