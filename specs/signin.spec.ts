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

describe("signinMutationテスト", () => {
  type SigninInput = {
    email: string
    password: string
  }
  const query = `mutation signinMutation($input: {$email: string}){ 
      signin(input: $input) {
        user {
          email
        }
        userToken
      }
    }`;
  it("normally", async () => {
    const response = await yoga.fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${userToken}`,
      },
      body: JSON.stringify({
        query: query,
        variables: { email: "info@toyasoft.com", password: "qwerty" },
      }),
    });
    // expect(response.status).toBe(200);
    const result = await response.json();
    console.log(result)
    // expect(result.data.currentUser.email).toBe("test@toyasoft.com");
  });

});
