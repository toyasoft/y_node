import { createYoga } from "graphql-yoga";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { createServer } from "node:http";
import { schema } from "./schema";

export type User = {
  id: string;
  email: string;
};

export type GraphQLContext = {
  con: mysql.Connection;
  user: User | undefined;
};

const yoga = createYoga({
  schema,
  async context({ request }) {
    try {
      const con = await mysql.createConnection({
        host: "y_node-mysql-1",
        user: "root",
        password: "root",
        database: "demo",
        port: 3306,
      });
      const token = request.headers.get("authorization");
      let user: User | undefined;
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
    } catch (e) {
      return e;
    }
  },
});

export const server = createServer(yoga);

server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
