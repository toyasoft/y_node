import { YogaServerInstance } from "graphql-yoga";
import mysql from "mysql2/promise";
import { api, db, initYoga } from "../jest.setup";
import {
  clearItemDatabase,
  clearUserDatabase,
  initializeItemDatabase,
  initializeUserDatabase,
} from "../src/schema";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;

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

describe("itemsQueryテスト", () => {
  const query = `
    query itemsQuery { 
      items {
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
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data?.items[0].name).toBe(items[0].name);
    expect(result.data?.items[0].point).toBe(items[0].point);
    expect(result.data?.items[1].name).toBe(items[1].name);
    expect(result.data?.items[1].point).toBe(items[1].point);
    expect(result.data?.items[2].name).toBe(items[2].name);
    expect(result.data?.items[2].point).toBe(items[2].point);
  });
});

afterAll(async () => {
  await clearUserDatabase(con);
  await clearItemDatabase(con);
  await con.end();
});
