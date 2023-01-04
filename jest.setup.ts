import { createYoga, YogaServerInstance } from "graphql-yoga";
import { decodedId, encodedId, IItem, IUser, schema } from "./src/schema";
import jwt from "jsonwebtoken";
import mysql, { ResultSetHeader } from "mysql2/promise";
import { server, User } from "./src/main";

export const api = "http://localhost:4000/graphql"

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
        },
      });
}