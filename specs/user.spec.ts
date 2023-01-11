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
let userId = "";
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
  yoga = initYoga(con);
  const userData = await initializeUserDatabase(con, user);
  userId = encodedId(userData.userId, "User");
  await initializeItemDatabase(con, {
    name: items[0].name,
    point: items[0].point,
    userId: userData.userId,
    del: 0,
  });
  await initializeItemDatabase(con, {
    name: items[1].name,
    point: items[1].point,
    userId: userData.userId,
    del: 0,
  });
  await initializeItemDatabase(con, {
    name: items[2].name,
    point: items[2].point,
    userId: userData.userId,
    del: 0,
  });
});

describe("userQueryテスト", () => {
  const query = `
    query userQuery($id: ID!) { 
      user(id: $id) {
        email
        id
        items {
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
      },
      body: JSON.stringify({
        query: query,
        variables: {
          id: userId,
        },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();

    expect(result.data.user.email).toBe(user.email);
    expect(result.data.user.items[0].name).toBe(items[0].name);
    expect(result.data.user.items[0].point).toBe(items[0].point);
    expect(result.data.user.items[1].name).toBe(items[1].name);
    expect(result.data.user.items[1].point).toBe(items[1].point);
    expect(result.data.user.items[2].name).toBe(items[2].name);
    expect(result.data.user.items[2].point).toBe(items[2].point);
    // ユーザートークンを返す
    expect(result.data.userToken).not.toBe(null);
  });
  it("ユーザーIDが空の場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  it("ユーザーIDが無効の場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    expect(result.errors[0].message).toBe("ユーザーIDが無効です");
  });
  it("ユーザーが存在しない場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: {
          id: encodedId(9999, "User"),
        },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe("ユーザーが存在しません");
  });
});

afterAll(async () => {
  await clearUserDatabase(con);
  await clearItemDatabase(con);
  await con.end();
});
