import { YogaServerInstance } from "graphql-yoga";
import mysql from "mysql2/promise";
import { api, db, initYoga } from "../jest.setup";
import {
  clearItemDatabase,
  clearOrderDatabase,
  clearUserDatabase,
  initializeItemDatabase,
  initializeOrderDatabase,
  initializeUserDatabase,
} from "../src/schema";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;

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
  await initializeUserDatabase(con, users[1]);
  const itemData = await initializeItemDatabase(con, {
    name: item.name,
    point: item.point,
    userId: currentUserData.userId,
    del: 0,
  });
  await initializeOrderDatabase(con, {
    userId: currentUserData.userId,
    itemId: itemData.itemId,
    point: item.point,
    buyer: users[0].email,
    seller: users[1].email,
    name: item.name,
  });
});

describe("ordersQueryテスト", () => {
  const query = `
    query ordersQuery { 
      orders {
        id
        name
        point
        buyer
        seller
        createdAt
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
    expect(result.data?.orders[0].name).toBe(item.name);
    expect(result.data?.orders[0].point).toBe(item.point);
    expect(result.data?.orders[0].buyer).toBe(users[0].email);
    expect(result.data?.orders[0].seller).toBe(users[1].email);
  });
});

afterAll(async () => {
  await clearUserDatabase(con);
  await clearItemDatabase(con);
  await clearOrderDatabase(con);
  await con.end();
});
