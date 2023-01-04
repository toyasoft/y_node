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
let item: IItem;
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
  yoga = initYoga(con)
  const hashPassword = bcrypt.hashSync(String("1234asdfqwer"), 3);

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
    ["test@toyasoft.com", hashPassword, 10000]
  );

  const [insertItemRowData] = await con.execute<ResultSetHeader>(
    `
      INSERT INTO
        items (
          name,
          point,
          user_id
        )
      VALUES
        (?, ?, ?)
    `,
    ["商品1", 1000, insertUserRowData.insertId]
  );

  const [itemRowData] = await con.execute<IItem[]>(
    `
      SELECT
        id,
        name,
        point
      FROM
        items
      WHERE
        id = ?
    `,
    [insertItemRowData.insertId]
  );

  item = itemRowData[0];
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
        query: query
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data?.items[0].name).toBe("商品1");
    expect(result.data?.items[0].point).toBe(1000);
    expect(result.data?.items[0].id).toBe(encodedId(item.id, "Item"));

  });

});
