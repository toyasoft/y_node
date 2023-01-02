import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({
  schema,
  async context({ request }) {
    const con = await mysql.createConnection({
      host: "y_node-mysql-1",
      user: "root",
      password: "root",
      database: "demo",
      port: 3306,
    });

    const token = request.headers.get("authorization");
    let user;
    if (token) {
      jwt.verify(
        token,
        process.env.AUTH_SECRET || "",
        function (err: any, decoded: any) {
          user = decoded;
        }
      );
    }

    return {
      con: con,
      user: user,
    };
  },
});

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
