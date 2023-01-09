import bcrypt from "bcryptjs";
import { YogaServerInstance } from "graphql-yoga";
import jwt from "jsonwebtoken";
import mysql, { ResultSetHeader } from "mysql2/promise";
import { api, db, initYoga } from "../jest.setup";
import { encodedId } from "../src/schema";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;
let userToken = "";
let itemId = "";
let delItemId = "";
const users = [
  {
    email: "test@toyasoft.com",
    password: "1234asdfqWer",
    point: 10000,
  },
  {
    email: "seller@toyasoft.com",
    password: "1234asdfqWer",
    point: 10000,
  },
];
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
  await con.execute(`
    DELETE FROM
      orders
  `);
  yoga = initYoga(con);
  const hashPassword0 = bcrypt.hashSync(String(users[0].password), 3);

  const [insertUserRowData0] = await con.execute<ResultSetHeader>(
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
    [users[0].email, hashPassword0, users[0].point]
  );
  const hashPassword1 = bcrypt.hashSync(String(users[1].password), 3);
  const [insertUserRowData1] = await con.execute<ResultSetHeader>(
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
    [users[1].email, hashPassword1, users[1].point]
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
    [item.name, item.point, insertUserRowData1.insertId]
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
    [item.name, item.point, insertUserRowData1.insertId]
  );

  delItemId = encodedId(insertDelItemRowData.insertId, "Item");

  userToken = jwt.sign(
    {
      id: encodedId(insertUserRowData0.insertId, "User"),
      email: users[0].email,
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

describe("createOrderMutationテスト", () => {
  const query = `
    mutation createOrderMutation($itemId: ID!){ 
      createOrder(input: {itemId: $itemId}) {
        order {
          id
          name
          point
          buyer
          seller
          createdAt
        }
        buyer {
          id
          email
          point
        }
        seller {
          id
          email
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
        variables: { itemId: itemId },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.createOrder.order.name).toBe(item.name);
    expect(result.data.createOrder.order.point).toBe(item.point);
    expect(result.data.createOrder.order.buyer).toBe(users[0].email);
    expect(result.data.createOrder.order.seller).toBe(users[1].email);
    expect(result.data.createOrder.buyer.point).toBe(
      users[0].point - result.data.createOrder.order.point
    );
    expect(result.data.createOrder.seller.point).toBe(
      users[0].point + result.data.createOrder.order.point
    );
    // 購入者のポイントが商品代分減っている事
    // 販売者のポイントが商品代分増えている事
  });
  it("未ログインの場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { itemId: itemId },
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
        variables: { itemId: null },
      }),
    });
    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.errors[0].message).toBe(
      'Variable "$itemId" of non-null type "ID!" must not be null.'
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
        variables: { itemId: "example" },
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
        Authorization: `${userToken}`,
      },
      body: JSON.stringify({
        query: query,
        variables: { itemId: 9999 },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("商品が存在しません");
  });
  it("商品が削除済み場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${userToken}`,
      },
      body: JSON.stringify({
        query: query,
        variables: { itemId: delItemId },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("商品が存在しません");
  });
  it("購入者と出品者が同じ場合", async () => {

  });
  it("購入者のポイントが不足している場合", async () => {

  });
});
