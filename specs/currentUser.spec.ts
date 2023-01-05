import { createYoga, YogaServerInstance } from "graphql-yoga";
import { createConnection } from "mysql2";
import { encodedId, IUser, schema } from "../src/schema";
import mysql, { ResultSetHeader } from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../src/main";
import { GraphQLError } from "graphql";
import { api, db, initYoga } from "../jest.setup";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;
let userToken = "";
const user = {
  email: "test@toyasoft.com",
  password: "1234asdfqWer",
  point: 10000,
};
beforeAll(async () => {
  con = await mysql.createConnection(db);
  await con.execute(`
    DELETE FROM
      users
  `);
  yoga = initYoga(con);
  const hashPassword = bcrypt.hashSync(String(user.password), 3);

  const [insertUserRowData] = await con.execute<ResultSetHeader>(
    `
    INSERT INTO
      users (
        email,
        password,
        point
      )
    VALUES
      (?, ?, ?)
  `,
    [user.email, hashPassword, user.point]
  );

  userToken = await jwt.sign(
    {
      id: encodedId(insertUserRowData.insertId, "User"),
      email: user.email,
      type: "user",
    },
    String(process.env.AUTH_SECRET),
    {
      expiresIn: "365d",
    }
  );
});
afterAll(async () => {
  con.end();
});
beforeEach(async () => {});

afterEach(async () => {
  // con.end();
});

describe("currentUserQueryテスト", () => {
  const query = `
    query currentUserQuery { 
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
    }`;
  it("通常時", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${userToken}`,
      },
      body: JSON.stringify({
        query: query,
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.currentUser?.email).toBe("test@toyasoft.com");
  });
  it("未ログイン時", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("認証エラーです");
  });
});
