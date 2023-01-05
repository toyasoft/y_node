import { YogaServerInstance } from "graphql-yoga";
import { encodedId } from "../src/schema";
import mysql, { ResultSetHeader } from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { api, db, initYoga } from "../jest.setup";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;
let userToken = "";
const user = {
  email: "test@toyasoft.com",
  password: "1234asdfqWer",
  point: 10000,
};
const items = [
  {
    name: "商品1",
    point: 1000,
  },
  {
    name: "商品2",
    point: 500,
  },
  {
    name: "商品3",
    point: 800,
  },
];
beforeAll(async () => {
  con = await mysql.createConnection(db);
  await con.execute(`
    DELETE FROM
      users
  `);
  await con.execute(`
    DELETE FROM
      items
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

  await con.execute(
    `
      INSERT INTO
        items (
          name,
          point,
          user_id
        )
      VALUES
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?)
    `,
    [
      items[0].name,
      items[0].point,
      insertUserRowData.insertId,
      items[1].name,
      items[1].point,
      insertUserRowData.insertId,
      items[2].name,
      items[2].point,
      insertUserRowData.insertId,
    ]
  );

  userToken = jwt.sign(
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
        variables: {},
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.currentUser.email).toBe(user.email);
    expect(result.data.currentUser.items[0].name).toBe(items[0].name);
    expect(result.data.currentUser.items[0].point).toBe(items[0].point);
    expect(result.data.currentUser.items[1].name).toBe(items[1].name);
    expect(result.data.currentUser.items[1].point).toBe(items[1].point);
    expect(result.data.currentUser.items[2].name).toBe(items[2].name);
    expect(result.data.currentUser.items[2].point).toBe(items[2].point);
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
