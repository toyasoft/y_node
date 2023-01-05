import { createYoga, YogaServerInstance } from "graphql-yoga";
import { encodedId, IUser, schema } from "../src/schema";
import mysql, { ResultSetHeader } from "mysql2/promise";
import bcrypt from "bcryptjs";
import { api, db, initYoga } from "../jest.setup";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;
let userId = "";
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
  userId = encodedId(insertUserRowData.insertId, "User");

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
});
afterAll(async () => {
  con.end();
});
beforeEach(async () => {});

afterEach(async () => {
  // con.end();
});

describe("currentUser query test", () => {
  const query = `
    query userQuery($id: ID!) { 
      user(id: $id) {
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
      },
      body: JSON.stringify({
        query: query,
        variables: {
          id: userId,
        },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.user.email).toBe(user.email);
    expect(result.data.user.items[0].name).toBe(items[0].name);
    expect(result.data.user.items[0].point).toBe(items[0].point);
    expect(result.data.user.items[1].name).toBe(items[1].name);
    expect(result.data.user.items[1].point).toBe(items[1].point);
    expect(result.data.user.items[2].name).toBe(items[2].name);
    expect(result.data.user.items[2].point).toBe(items[2].point);
  });
  it("IDが空の場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: {
          id: null,
        },
      }),
    });
    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.errors[0].message).toBe(
      'Variable "$id" of non-null type "ID!" must not be null.'
    );
  });
});
