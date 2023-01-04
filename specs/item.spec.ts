import { createYoga, YogaServerInstance } from "graphql-yoga";
import { decodedId, encodedId, IItem, IUser, schema } from "../src/schema";
import mysql, { ResultSetHeader } from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { server, User } from "../src/main";
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
server.close()
});

describe("itemQueryのテスト", () => {
  const query = `
    query itemQuery(
      $id: ID!
    ){ 
      item(id: $id) {
        id
        name
        point
      }
    }`;
  it("正常", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { id: encodedId(item.id, "Item") },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data?.item.name).toBe("商品1");
    expect(result.data?.item.point).toBe(1000);
    expect(result.data?.item.id).toBe(encodedId(item.id, "Item"));
  });
  it("idがnullの場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { id: null },
      }),
    });
    expect(response.status).toBe(400);
    const result = await response.json();
    result.errors.map((error: GraphQLError) => {
      expect(error.message).toBe(
        'Variable "$id" of non-null type "ID!" must not be null.'
      );
    });
  });
  it("idが存在しない場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { id: "example" },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    result.errors.map((error: GraphQLError) => {
      expect(error.message).toBe(
        'IDが存在しません'
      );
    });
  });
  it("商品が存在しない場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { id: encodedId(1000, "Item") },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    result.errors.map((error: GraphQLError) => {
      expect(error.message).toBe(
        '商品が存在しません'
      );
    });
  });
});
