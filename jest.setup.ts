import { createYoga } from "graphql-yoga";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { User } from "./src/main";
import { schema } from "./src/schema";

export const api = "http://localhost:4000/graphql";

export const db = {
  host: "y_node-mysql-test-1",
  user: "root",
  password: "root",
  database: "test",
  port: 3306,
};

export const initYoga = (con: mysql.Connection) => {
  return createYoga({
    schema,
    async context({ request }) {
      try {
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
};
