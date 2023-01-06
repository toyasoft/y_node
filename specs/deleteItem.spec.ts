import bcrypt from "bcryptjs";
import { YogaServerInstance } from "graphql-yoga";
import jwt from "jsonwebtoken";
import mysql, { ResultSetHeader } from "mysql2/promise";
import { api, db, initYoga } from "../jest.setup";
import { encodedId } from "../src/schema";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;
let userToken = "";
const user = {
  email: "test@toyasoft.com",
  password: "1234asdfqWer",
  point: 10000,
};
const item = {
  name: "商品1",
  point: 1000,
};

let itemId = "";
let delItemId = "";
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

describe("deleteItemMutationテスト", () => {
  const query = `
    mutation updateItemMutation($id: ID!){ 
      deleteItem(input: {id: $id}) {
        deletedItemId
      }
    }`;
  it("正常時", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${userToken}`,
      },
      body: JSON.stringify({
        query: query,
        variables: {
          id: itemId,
        },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.deleteItem.deletedItemId).toBe(itemId);
  });
  it("未ログインの場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: {
          id: itemId,
        },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data).toBe(null);
    expect(result.errors[0].message).toBe("認証エラーです");
  });
  it("商品IDが空の場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${userToken}`,
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
  it("商品IDが無効の場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${userToken}`,
      },
      body: JSON.stringify({
        query: query,
        variables: {
          id: "example",
        },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("商品IDが無効です");
  });
  it("商品が削除済みの場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${userToken}`,
      },
      body: JSON.stringify({
        query: query,
        variables: {
          id: delItemId,
        },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("商品は削除済みです");
  });
});
