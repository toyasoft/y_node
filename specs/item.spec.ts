import { createYoga, YogaServerInstance } from "graphql-yoga";
import { createConnection } from "mysql2";
import { decodedId, encodedId, IItem, IUser, schema } from "../src/schema";
import mysql, { ResultSetHeader } from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../src/main";
import { GraphQLError } from "graphql";

let yoga: YogaServerInstance<any, any>;
let con: mysql.Connection;
let item: IItem;
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
  yoga = createYoga({
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
    ["商品1", 1000, insertUserRowData.insertId]
  );

  const [itemRowData] = await con.execute<IItem[]>(
    `
      SELECT
        id,
        name,
        point
      FROM
        items
      WHERE
        id = ?
    `,
    [insertItemRowData.insertId]
  );

  item = itemRowData[0];
});
afterAll(async () => {
  con.end();
});
beforeEach(async () => {});

afterEach(async () => {
  // con.end();
});

describe("currentUser item test", () => {
  const query = `{ 
    item {
      id
      name
      point
    }
  }`;
  it("normally", async () => {
    const response = await yoga.fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { id: encodedId(item.id, "Item") },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    console.log(result);
    expect(result.data?.item.name).toBe("商品1");
  });
  it("if specify id", async () => {
    const response = await yoga.fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { id: null },
      }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    result.errors.map((error: GraphQLError) => {
      // expect(error.message).toBe(
      //   'Field "item" argument "id" of type "ID!" is required, but it was not provided.'
      // );
    });
  });
});
