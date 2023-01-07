import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import { YogaServerInstance } from "graphql-yoga";
import mysql, { ResultSetHeader } from "mysql2/promise";
import { api, db, initYoga } from "../jest.setup";
import { encodedId } from "../src/schema";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;
let itemId = "";
let delItemId = "";
const user = {
  email: "test@toyasoft.com",
  password: "1234asdfqWer",
  point: 10000,
};
const item = {
  name: "商品1",
  point: 1000,
};
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
    [item.name, item.point, insertUserRowData.insertId]
  );

  itemId = encodedId(insertItemRowData.insertId, "Item");
  const [insertDelItemRowData] = await con.execute<ResultSetHeader>(
    `
      INSERT INTO
        items (
          name,
          point,
          user_id,
          del
        )
      VALUES
        (?, ?, ?, 1)
    `,
    [item.name, item.point, insertUserRowData.insertId]
  );

  delItemId = encodedId(insertDelItemRowData.insertId, "Item");
});
afterAll(async () => {
  con.end();
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
  it("通常時", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { id: itemId },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data?.item.name).toBe(item.name);
    expect(result.data?.item.point).toBe(item.point);
    expect(result.data?.item.id).toBe(itemId);
  });
  it("商品IDが空の場合", async () => {
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
  it("商品IDが無効の場合", async () => {
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
    expect(result.errors[0].message).toBe("商品IDが無効です");
  });
  it("商品が存在しない場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { id: encodedId(9999, "Item") },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("商品が存在しません");
  });
  it("商品が削除済みの場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { id: delItemId },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("商品が存在しません");
  });
});
