import { createSchema, GraphQLSchemaWithContext } from "graphql-yoga";
import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { GraphQLContext } from "./main";


require("dotenv").config();

type UserRow = {
  id: string
  email: string
  item_id: number
  item_name: string
  item_point: number
}

type ItemRow = {
  id: string
  name: string
  point: number
  user_id: number
}

type OrderRow = {
  id: string
  buyer_id: number
  seller_id: number
}

export const decodedId = (id: string) => {
  return Buffer.from(id, "base64").toString().split(":")[1];
};

export const encodedId = (id: string | number, typeName: string) => {
  return Buffer.from(`${typeName}:${id}`).toString("base64");
};

const typeDefs = loadFilesSync(path.join(process.cwd(), "schema.graphql"));


export const schema = createSchema({
  typeDefs: typeDefs,
  resolvers: {
    Query: {
      currentUser: async (parent: unknown, args: unknown, context: GraphQLContext) => {
        if (!context.user) {
          throw new GraphQLError("認証エラーです");
        }
        const [rows] = await context.con.execute(
          `
            SELECT
              u.id,
              u.email,
              i.id AS item_id,
              i.name AS item_name,
              i.point AS item_point
            FROM
              users AS u
            LEFT JOIN
              items AS i
            ON
              u.id = i.user_id
            WHERE
              u.id = ?
          `,
          [decodedId(context.user.id)]
        );
        const userRows: UserRow[] = Object.values(JSON.parse(JSON.stringify(rows)))
        const user: UserRow = userRows[0]
        const items = userRows.map((row: UserRow) => {
          return {
            id: encodedId(row.item_id, "Item"),
            name: row.item_name,
            point: row.item_point,
          };
        });
        return {
          id: user.id,
          email: user.email,
          items: items,
        };
      },
      user: async (parent: unknown, args: unknown, context: GraphQLContext) => {
        if (!context.user) {
          throw new GraphQLError("認証エラーです");
        }
        const [rows] = await context.con.execute(
          `
            SELECT
              u.id,
              u.email,
              i.id AS item_id,
              i.name AS item_name,
              i.point AS item_point
            FROM
              users AS u
            LEFT JOIN
              items AS i
            ON
              u.id = i.user_id
            WHERE
              u.id = ?
          `,
          [decodedId(context.user.id)]
        );
        const userRows: UserRow[] = Object.values(JSON.parse(JSON.stringify(rows)))
        const user: UserRow = userRows[0]
        const items = userRows.map((row: UserRow) => {
          return {
            id: encodedId(row.item_id, "Item"),
            name: row.item_name,
            point: row.item_point,
          };
        });
        return {
          id: user.id,
          email: user.email,
          items: items,
        };
      },
      item: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
        const [rows] = await context.con.execute(
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
          [decodedId(args.id)]
        );
        const itemRows: ItemRow[] = Object.values(JSON.parse(JSON.stringify(rows)))
        const item: ItemRow = itemRows[0]
        return {
          id: encodedId(item.id, "Item"),
          name: item.name,
          point: item.point,
        };
      },
      items: async (_parent: unknown, args: unknown, context: GraphQLContext) => {
        const rows = await context.con.execute(
          `
            SELECT
              i.id,
              i.name,
              i.point,
              i.user_id
            FROM
              items AS i
          `
        );
        const itemRows: ItemRow[] = Object.values(JSON.parse(JSON.stringify(rows)))

        return itemRows;
      },
      orders: async (_parent: unknown, args: unknown, context: GraphQLContext) => {
        const [rows] = await context.con.execute(
          `
            SELECT
              o.id,
              o.user_id AS buyer_id,
              i.user_id AS seller_id
            FROM
              orders AS o
            LEFT JOIN
              items AS i
            ON
              o.item_id = i.id
          `
        );
        const orderRows: OrderRow[] = Object.values(JSON.parse(JSON.stringify(rows)))

        return orderRows;
      },
    },
    Mutation: {
      createUser: async (
        _parent: unknown,
        args: { input: {
          email: string
          password: string
        } },
        context: GraphQLContext
      ) => {
        try {
          const regex = /^(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9.?/-]{8,20}$/;
          if (!regex.test(args.input.password)) {
            throw new GraphQLError(
              "パスワードは8文字以上20文字以内で少なくとも英語と数字を一文字以上入力してください"
            );
          }
          const [checkRows] = await context.con.execute(
            `
              SELECT
                id
              FROM
                users
              WHERE
                email = ?
            `,
            [args.input.email]
          );
          const checkUserRows: UserRow[] = Object.values(JSON.parse(JSON.stringify(checkRows)))
          const checkUser = checkUserTable[0][0]
          if (checkUser && checkUser.id) {
            throw new GraphQLError("メールアドレスは登録済みです");
          }
          const insertUserTable = await context.con.execute(
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
            [
              args.input.email,
              bcrypt.hashSync(String(args.input.password), 3),
              10000,
            ]
          );
          const userTable = await context.con.execute(
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
            [insertUserTable[0].insertId]
          );
          const user = userTable[0][0]
          return {
            user: {
              id: user.id,
            email: user.email,
            point: user.point,
            }
            
          };
        } catch (e) {
          console.log(e)
          return e;
        }
      },
      signin: async (
        _parent: unknown,
        args: { input: {
          email: string
          password: string
        } },
        context: GraphQLContext
      ) => {
        try {
          const userTable = await context.con.execute(
            `
              SELECT
                id,
                email,
                password
              FROM
                users
              WHERE
                email = ?
            `,
            [args.input.email]
          );
          const user = userTable[0][0];
          if (!user) {
            throw new GraphQLError("ユーザーが存在しません");
          }
          if (!bcrypt.compareSync(args.input.password, user.password)) {
            throw new GraphQLError("ログインできません");
          }
          return {
            user: {
              id: encodedId(user.id, "User"),
              email: user.email,
            },
            userToken: jwt.sign(
              {
                id: encodedId(user.id, "User"),
                email: user.email,
                type: "user",
              },
              String(process.env.AUTH_SECRET),
              {
                expiresIn: "365d",
              }
            ),
          };
        } catch (e) {
          return e;
        }
      },
      createItem: async (
        _parent: unknown,
        args: { input: {
          name: string
          point: number
        } },
        context: GraphQLContext
      ) => {
        try {
          if (!context.user) {
            throw new GraphQLError("認証エラーです");
          }
          const insertItemTable = await context.con.execute(
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
            [args.input.name, args.input.point, decodedId(context.user.id)]
          );
          const itemTable = await context.con.execute(
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
            [insertItemTable[0].insertId]
          );
          const item = itemTable[0][0];
          return {
            item: {
              id: item.id,
              name: item.name,
              point: item.point,
            },
          };
        } catch (e) {
          return e;
        }
      },
      updateItem: async (
        _parent: unknown,
        args: { input: {
          id: string
          name: string
          point: number
        } },
        context: GraphQLContext
      ) => {
        if (!context.user) {
          throw new GraphQLError("認証エラーです");
        }
        await context.con.execute(
          `
            UPDATE
              items
            SET
              name = ?,
              point = ?
            WHERE
              id = ?
              AND user_id = ?
          `,
          [
            args.input.name,
            args.input.point,
            decodedId(args.input.id),
            decodedId(context.user.id),
          ]
        );
        const itemTable = await context.con.execute(
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
          [decodedId(args.input.id)]
        );
        const item = itemTable[0][0];
        return {
          item: {
            id: item.id,
            name: item.name,
            point: item.point,
          },
        };
      },
      deleteItem: async (
        _parent: unknown,
        args: { input: {
          id: string
        } },
        context: GraphQLContext
      ) => {
        if (!context.user) {
          throw new GraphQLError("認証エラーです");
        }
        await context.con.execute(
          `
            DELETE FROM 
              items
            WHERE 
              id = ?
              AND user_id = ?
          `,
          [decodedId(args.input.id), decodedId(context.user.id)]
        );

        return { deletedItemId: args.input.id };
      },
      createOrder: async (_parent: unknown, args: {input: {
        itemId: string
      }}, context: GraphQLContext) => {
        console.log(args)
        if (!context.user) {
          throw new GraphQLError("認証エラーです");
        }
        await context.con.execute(
          `
            INSERT INTO
              orders (
                user_id,
                item_id
              )
            VALUES
              (?, ?)
          `,
          [decodedId(context.user.id), decodedId(args.input.itemId)]
        );
      },
    },
  },
});
