import { createYoga, YogaServerInstance } from "graphql-yoga";
import { createConnection } from "mysql2";
import { encodedId, IUser, schema } from "../src/schema";
import mysql, { ResultSetHeader } from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../src/main";
import { GraphQLError } from "graphql";
import { db, initYoga } from "../jest.setup";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;
let userToken = "";
beforeAll(async () => {
  con = await mysql.createConnection(db);
  await con.execute(`
    DELETE FROM
      users
  `);
  yoga = initYoga(con)

});
afterAll(async () => {
  con.end();
});
beforeEach(async () => {});

afterEach(async () => {
  // con.end();
});

describe("createUserMutationテスト", () => {
  const query = JSON.stringify({
    query: `{ 
      currentUser {
        email
        id
        items {
          id
          name
          point
          userId
        }
      }
    }`,
  });
  it("normally", async () => {
    const response = await yoga.fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${userToken}`,
      },
      body: query,
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.currentUser.email).toBe("test@toyasoft.com");
  });
  it("if specify userToken", async () => {
    const response = await yoga.fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: query,
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    result.errors.map((error: GraphQLError) => {
      expect(error.message).toBe("認証エラーです");
    });
  });
});
