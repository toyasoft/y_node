import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { GraphQLBoolean, GraphQLError } from "graphql";

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
      // throw new GraphQLError("認証エラーです");
      const con = await mysql.createConnection({
        host: "y_node-mysql-1",
        user: "root",
        password: "root",
        database: "demo",
        port: 3306,
      });
      // console.log(request.headers);
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
      console.log(e);
    }
  },
});

// Pass it into a server to hook into request handlers.
export const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
