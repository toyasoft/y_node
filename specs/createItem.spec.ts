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
  userToken = jwt.sign(
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
});
afterAll(async () => {
  con.end();
});

describe("createItemMutationテスト", () => {
  const query = `
    mutation createItemMutation($name: String! $point: Int!){ 
      createItem(input: {name: $name, point: $point}) {
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
        variables: { name: item.name, point: item.point },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.createItem.item.name).toBe(item.name);
    expect(result.data.createItem.item.point).toBe(item.point);
  });
  it("未ログインの場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { name: item.name, point: item.point },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data).toBe(null);
    expect(result.errors[0].message).toBe("認証エラーです");
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
        variables: { name: null, point: item.point },
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
        variables: { name: "あ".repeat(256), point: item.point },
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
        variables: { name: item.name, point: null },
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
        variables: { name: item.name, point: "文字列" },
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
        variables: { name: item.name, point: 10000000000 },
      }),
    });
    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.errors[0].message).toBe(
      'Variable "$point" got invalid value 10000000000; Int cannot represent non 32-bit signed integer value: 10000000000'
    );
  });
});
