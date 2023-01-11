import { YogaServerInstance } from "graphql-yoga";
import mysql from "mysql2/promise";
import { api, db, initYoga } from "../jest.setup";
import {
  clearItemDatabase,
  clearOrderDatabase,
  clearUserDatabase,
  decodedId,
  encodedId,
  initializeItemDatabase,
  initializeUserDatabase,
} from "../src/schema";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;
let userToken = "";
let currentUserId = "";
let itemId = "";
let delItemId = "";
let currentUserItemId = "";
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
  yoga = initYoga(con);
  const currentUserData = await initializeUserDatabase(con, users[0]);
  const anotherUserData = await initializeUserDatabase(con, users[1]);
  userToken = currentUserData.userToken;
  currentUserId = encodedId(currentUserData.userId, "User");
  const itemData = await initializeItemDatabase(con, {
    name: item.name,
    point: item.point,
    userId: anotherUserData.userId,
    del: 0,
  });
  itemId = encodedId(itemData.itemId, "Item");
  const currentUserItemData = await initializeItemDatabase(con, {
    name: item.name,
    point: item.point,
    userId: currentUserData.userId,
    del: 0,
  });
  currentUserItemId = encodedId(currentUserItemData.itemId, "Item");
  const delItemData = await initializeItemDatabase(con, {
    name: item.name,
    point: item.point,
    userId: anotherUserData.userId,
    del: 1,
  });
  delItemId = encodedId(delItemData.itemId, "Item");
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
    // 購入者のポイントが商品代分減っている事
    expect(result.data.createOrder.buyer.point).toBe(
      users[0].point - result.data.createOrder.order.point
    );
    // 販売者のポイントが商品代分増えている事
    expect(result.data.createOrder.seller.point).toBe(
      users[0].point + result.data.createOrder.order.point
    );
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
        variables: { itemId: encodedId(9999, "Item") },
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
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${userToken}`,
      },
      body: JSON.stringify({
        query: query,
        variables: { itemId: currentUserItemId },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("商品が存在しません");
  });
  it("購入者のポイントが不足している場合", async () => {
    await con.execute(
      `
        UPDATE
          users
        SET
          point = ?
        WHERE
          id = ?
      `,
      [0, decodedId(currentUserId)]
    );
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

    expect(result.errors[0].message).toBe("ポイントが不足しています");
  });
  afterEach(async () => {
    await clearOrderDatabase(con);
  });
});

afterAll(async () => {
  await clearUserDatabase(con);
  await clearItemDatabase(con);
  await con.end();
});
