import { YogaServerInstance } from "graphql-yoga";
import mysql from "mysql2/promise";
import { api, db, initYoga } from "../jest.setup";
import {
  clearItemDatabase,
  clearUserDatabase,
  encodedId,
  initializeItemDatabase,
  initializeUserDatabase,
} from "../src/schema";

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
  yoga = initYoga(con);
  const userData = await initializeUserDatabase(con, user);
  userToken = userData.userToken;
  const itemData = await initializeItemDatabase(con, {
    name: item.name,
    point: item.point,
    userId: userData.userId,
    del: 0,
  });
  itemId = encodedId(itemData.itemId, "Item");
  const delItemData = await initializeItemDatabase(con, {
    name: "商品1",
    point: 1000,
    userId: userData.userId,
    del: 1,
  });
  delItemId = encodedId(delItemData.itemId, "Item");
});

describe("deleteItemMutationテスト", () => {
  const query = `
    mutation updateItemMutation($id: ID!){ 
      deleteItem(input: {id: $id}) {
        deletedItemId
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
    expect(result.errors[0].message).toBe("商品は存在しません");
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
        variables: {
          id: encodedId(9999, "Item"),
        },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("商品は存在しません");
  });
  afterEach(async () => {
    await clearItemDatabase(con);
  });
});

afterAll(async () => {
  await clearUserDatabase(con);
  con.end();
});
