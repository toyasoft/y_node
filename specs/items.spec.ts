import { createYoga, YogaServerInstance } from "graphql-yoga";
import { createConnection } from "mysql2";
import { encodedId, IItem, IUser, schema } from "../src/schema";
import mysql, { ResultSetHeader } from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../src/main";
import { GraphQLError } from "graphql";
import { api, db, initYoga } from "../jest.setup";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;

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
});
afterAll(async () => {
  con.end();
});
beforeEach(async () => {});

afterEach(async () => {
  // con.end();
});

describe("itemsQueryテスト", () => {
  const query = `
    query itemsQuery { 
      items {
        id
        name
        point
      }
    }`;
  it("正常時", async () => {
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
    expect(result.data?.items[0].name).toBe(items[0].name);
    expect(result.data?.items[0].point).toBe(items[0].point);
    expect(result.data?.items[1].name).toBe(items[1].name);
    expect(result.data?.items[1].point).toBe(items[1].point);
    expect(result.data?.items[2].name).toBe(items[2].name);
    expect(result.data?.items[2].point).toBe(items[2].point);
  });
});
