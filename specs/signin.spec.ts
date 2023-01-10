import bcrypt from "bcryptjs";
import { YogaServerInstance } from "graphql-yoga";
import mysql, { ResultSetHeader } from "mysql2/promise";
import { api, db, initYoga } from "../jest.setup";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;
const user = {
  email: "test@toyasoft.com",
  password: "1234asdfqWer",
  point: 10000,
};
beforeAll(async () => {
  con = await mysql.createConnection(db);
  await con.execute(`
    DELETE FROM
      users
  `);
  yoga = initYoga(con);
  const hashPassword = bcrypt.hashSync(String(user.password), 3);

  await con.execute<ResultSetHeader>(
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
});
afterAll(async () => {
  con.end();
});

describe("signinMutationテスト", () => {
  const query = `
    mutation signinMutation($email: String! $password: String!){ 
      signin(input: {email: $email, password: $password}) {
        user {
          email
        }
        userToken
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
        variables: { email: user.email, password: user.password },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.signin.user.email).toBe(user.email);
    expect(result.data.signin.userToken).not.toBe(null);
  });
  it("ユーザーが存在しない場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { email: "nothing@toyasoft.com", password: user.password },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data).toBe(null);
    expect(result.errors[0].message).toBe("ログインできません");
  });
  it("パスワードが間違えている場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { email: user.email, password: "wrongpass" },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data).toBe(null);
    expect(result.errors[0].message).toBe("ログインできません");
  });
  it("メールアドレスが空の場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { email: null, password: user.password },
      }),
    });
    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.errors[0].message).toBe(
      'Variable "$email" of non-null type "String!" must not be null.'
    );
  });
  it("パスワードが空の場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { email: user.email, password: null },
      }),
    });
    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.errors[0].message).toBe(
      'Variable "$password" of non-null type "String!" must not be null.'
    );
  });
});
