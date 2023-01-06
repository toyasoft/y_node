import bcrypt from "bcryptjs";
import { YogaServerInstance } from "graphql-yoga";
import mysql, { ResultSetHeader } from "mysql2/promise";
import { api, db, initYoga } from "../jest.setup";

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
  await con.execute<ResultSetHeader>(
    `
      INSERT INTO
        orders (
          user_id,
          item_id,
          point,
          buyer,
          seller,
          name
        )
      VALUES
        (?, ?, ?, ?, ?, ?)
    `,
    [
      insertUserRowData0.insertId,
      insertItemRowData.insertId,
      item.point,
      users[0].email,
      users[1].email,
      item.name,
    ]
  );
});
afterAll(async () => {
  con.end();
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
  it("正常時", async () => {
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
