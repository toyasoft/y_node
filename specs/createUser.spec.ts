import { YogaServerInstance } from "graphql-yoga";
import mysql, { ResultSetHeader } from "mysql2/promise";
import bcrypt from "bcryptjs";

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
});
afterAll(async () => {
  con.end();
});
beforeEach(async () => {});

afterEach(async () => {
  // con.end();
});

describe("createUserMutationテスト", () => {
  const query = `
    mutation createUserMutation($email: String! $password: String!){ 
      createUser(input: {email: $email, password: $password}) {
        user {
          email
        }
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
        variables: { email: user.email, password: user.password },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.createUser.user.email).toBe(user.email);
  });
  it("パスワードが有効でない場合", async () => {
    const response = await yoga.fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { email: user.email, password: "123456789" },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.errors[0].message).toBe(
      "パスワードは8文字以上20文字以内で少なくとも英語大文字と英語小文字と数字を一文字以上入力してください"
    );
  });
  it("メールアドレスが重複している場合", async () => {
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
    expect(result.errors[0].message).toBe("メールアドレスは登録済みです");
  });
});
