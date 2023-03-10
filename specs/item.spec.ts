import { GraphQLError } from "graphql";
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
  yoga = initYoga(con);
  const userData = await initializeUserDatabase(con, user);
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
  afterEach(async () => {
    await clearItemDatabase(con);
  });
});

afterAll(async () => {
  await clearUserDatabase(con);

  await con.end();
});
