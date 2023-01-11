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
const items = [
  {
    name: "商品1",
    point: 1000,
  },
  {
    name: "商品2",
    point: 500,
  },
];

let itemId = "";
let delItemId = "";
beforeAll(async () => {
  con = await mysql.createConnection(db);
  yoga = initYoga(con);
  const userData = await initializeUserDatabase(con, user);
  userToken = userData.userToken;
  const itemData = await initializeItemDatabase(con, {
    name: items[0].name,
    point: items[0].point,
    userId: userData.userId,
    del: 0,
  });
  itemId = encodedId(itemData.itemId, "Item");
  const delItemData = await initializeItemDatabase(con, {
    name: items[0].name,
    point: items[0].point,
    userId: userData.userId,
    del: 1,
  });
  delItemId = encodedId(delItemData.itemId, "Item");
});

describe("updateItemMutationテスト", () => {
  const query = `
    mutation updateItemMutation($id: ID! $name: String! $point: Int!){ 
      updateItem(input: {id: $id, name: $name, point: $point}) {
        item {
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
        Authorization: `${userToken}`,
      },
      body: JSON.stringify({
        query: query,
        variables: {
          id: itemId,
          name: items[1].name,
          point: items[1].point,
        },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.updateItem.item.id).toBe(itemId);
    expect(result.data.updateItem.item.name).toBe(items[1].name);
    expect(result.data.updateItem.item.point).toBe(items[1].point);
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
          name: items[1].name,
          point: items[1].point,
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
          name: items[1].name,
          point: items[1].point,
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
          name: items[1].name,
          point: items[1].point,
        },
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
        variables: {
          id: encodedId(9999, "Item"),
          name: items[1].name,
          point: items[1].point,
        },
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
        Authorization: `${userToken}`,
      },
      body: JSON.stringify({
        query: query,
        variables: {
          id: delItemId,
          name: items[1].name,
          point: items[1].point,
        },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("商品が存在しません");
  });
  it("商品名が空の場合", async () => {
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
          name: null,
          point: items[1].point,
        },
      }),
    });
    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.errors[0].message).toBe(
      'Variable "$name" of non-null type "String!" must not be null.'
    );
  });
  it("商品名が256文字以上の場合", async () => {
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
          name: "あ".repeat(256),
          point: items[1].point,
        },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("文字数オーバーです");
  });
  it("ポイントが空の場合", async () => {
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
          name: items[1].name,
          point: null,
        },
      }),
    });
    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.errors[0].message).toBe(
      'Variable "$point" of non-null type "Int!" must not be null.'
    );
  });
  it("ポイントが数値でない場合", async () => {
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
          name: items[1].name,
          point: "文字列",
        },
      }),
    });
    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.errors[0].message).toBe(
      'Variable "$point" got invalid value "文字列"; Int cannot represent non-integer value: "文字列"'
    );
  });
  it("ポイントが11桁以上の場合", async () => {
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
          name: items[1].name,
          point: 10000000000,
        },
      }),
    });
    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.errors[0].message).toBe(
      'Variable "$point" got invalid value 10000000000; Int cannot represent non 32-bit signed integer value: 10000000000'
    );
  });
  afterEach(async () => {
    await clearItemDatabase(con);
  });
});

afterAll(async () => {
  await clearUserDatabase(con);
  await con.end();
});
