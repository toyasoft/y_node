import { createYoga, YogaServerInstance } from "graphql-yoga";
import { createConnection } from "mysql2";
import { encodedId, IUser, schema } from "../src/schema";
import mysql, { ResultSetHeader } from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../src/main";
import { GraphQLError } from "graphql";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;
let userToken = "";
beforeAll(async () => {
  con = await mysql.createConnection({
    host: "y_node-mysql-test-1",
    user: "root",
    password: "root",
    database: "test",
    port: 3306,
  });
  await con.execute(`
    DELETE FROM
      users
  `);
  yoga = await createYoga({
    schema,
    async context({ request }) {
      const token = request.headers.get("authorization");
      let user: User | undefined;
      if (token) {
        jwt.verify(
          token,
          process.env.AUTH_SECRET || "",
          function (err: any, decoded: any) {
            user = decoded;
          }
        );
      }
      return {
        con: con,
        user: user,
      };
    },
  });
  const hashPassword = bcrypt.hashSync(String("1234asdfqwer"), 3);

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
    ["test@toyasoft.com", hashPassword, 10000]
  );

  const [userRowData] = await con.execute<IUser[]>(
    `
    SELECT
      id,
      email,
      point
    FROM
      users
    WHERE
      id = ?
  `,
    [insertUserRowData.insertId]
  );
  const user = userRowData[0];
  userToken = await jwt.sign(
    {
      id: encodedId(user.id, "User"),
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
beforeEach(async () => {});

afterEach(async () => {
  // con.end();
});

describe("currentUser query test", () => {
  const query = JSON.stringify({
    query: `{ 
      currentUser {
        email
        id
        items {
          id
          name
          point
          userId
        }
      }
    }`,
  });
  it("normally", async () => {
    const response = await yoga.fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${userToken}`,
      },
      body: query,
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.currentUser?.email).toBe("test@toyasoft.com");
  });
  it("if specify userToken", async () => {
    const response = await yoga.fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: query,
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    result.errors.map((error: GraphQLError) => {
      expect(error.message).toBe("認証エラーです");
    });
  });
});
