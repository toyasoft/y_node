import { createSchema, GraphQLSchemaWithContext } from "graphql-yoga";
import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { GraphQLContext } from "./main";
import { ResultSetHeader, RowDataPacket } from "mysql2";

require("dotenv").config();

export interface IUser extends RowDataPacket {
  id: string;
  email: string;
  point: number;
  password: string;
  item_id: number;
  item_name: string;
  item_point: number;
}

export interface IItem extends RowDataPacket {
  id: string;
  name: string;
  point: number;
  user_id: number;
}

export interface IOrder extends RowDataPacket {
  id: string;
  buyer: string;
  seller: string;
  name: string;
  point: number;
  created_at: number;
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
      currentUser: async (
        _parent: unknown,
        _args: unknown,
        context: GraphQLContext
      ) => {
        try {
          if (!context.user) {
            throw new GraphQLError("認証エラーです");
          }
          const [userRowData] = await context.con.execute<IUser[]>(
            `
              SELECT
                u.id,
                u.email,
                u.point,
                i.id AS item_id,
                i.name AS item_name,
                i.point AS item_point
              FROM
                users AS u
              LEFT JOIN (
                SELECT 
                  id,
                  name,
                  point,
                  user_id
                FROM
                  items
                WHERE
                  del = ?
              ) AS i
              ON
                u.id = i.user_id
              WHERE
                u.id = ?
            `,
            [0, decodedId(context.user.id)]
          );

          const user: IUser = userRowData[0];

          if (!user) {
            throw new GraphQLError("ユーザーが存在しません");
          }
          const items = userRowData
            .map((row: IUser) => {
              if (row.item_id) {
                return {
                  id: encodedId(row.item_id, "Item"),
                  name: row.item_name,
                  point: row.item_point,
                };
              }
            })
            .filter(Boolean);

          return {
            id: user.id,
            email: user.email,
            point: user.point,
            items: items,
          };
        } catch (e) {
          return e;
        }
      },
      user: async (
        _parent: unknown,
        args: { id: string },
        context: GraphQLContext
      ) => {
        const [userRowData] = await context.con.execute<IUser[]>(
          `
            SELECT
              u.id,
              u.email,
              i.id AS item_id,
              i.name AS item_name,
              i.point AS item_point
            FROM
              users AS u
            LEFT JOIN (
              SELECT 
                id,
                name,
                point,
                user_id
              FROM
                items
              WHERE
                del = ?
            ) AS i
            ON
              u.id = i.user_id
            WHERE
              u.id = ?
          `,
          [0, decodedId(args.id)]
        );

        const user: IUser = userRowData[0];
        if (!user) {
          throw new GraphQLError("ユーザーが存在しません");
        }
        const items = userRowData
          .map((row: IUser) => {
            if (row.item_id) {
              return {
                id: encodedId(row.item_id, "Item"),
                name: row.item_name,
                point: row.item_point,
              };
            }
          })
          .filter(Boolean);

        return {
          id: user.id,
          email: user.email,
          items: items,
        };
      },
      item: async (
        _parent: unknown,
        args: { id: string },
        context: GraphQLContext
      ) => {
        try {
          const itemId = decodedId(args.id);
          if (!itemId) {
            throw new GraphQLError("IDが存在しません");
          }
          const [itemRowData] = await context.con.execute<IItem[]>(
            `
            SELECT
              id,
              name,
              point,
              user_id
            FROM
              items
            WHERE
              id = ?
              AND del = ?
          `,
            [decodedId(args.id), 0]
          );
          const item: IItem = itemRowData[0];
          if (!item) {
            throw new GraphQLError("商品が存在しません");
          }

          return {
            id: encodedId(item.id, "Item"),
            name: item.name,
            point: item.point,
            userId: item.user_id,
          };
        } catch (e) {
          return e;
        }
      },
      items: async (
        _parent: unknown,
        _args: unknown,
        context: GraphQLContext
      ) => {
        const [itemRowData] = await context.con.execute<IItem[]>(
          `
            SELECT
              i.id,
              i.name,
              i.point,
              i.user_id
            FROM
              items AS i
            WHERE
              i.del = ?
          `,
          [0]
        );
        const items = itemRowData.map((row) => ({
          id: encodedId(row.id, "Item"),
          name: row.name,
          point: row.point,
          userId: row.user_id,
        }));

        return items;
      },
      orders: async (
        _parent: unknown,
        _args: unknown,
        context: GraphQLContext
      ) => {
        const [orderRowData] = await context.con.execute<IOrder[]>(
          `
            SELECT
              id,
              name,
              buyer,
              seller,
              point,
              created_at
            FROM
              orders
          `
        );
        const orders = orderRowData.map((row: IOrder) => ({
          id: row.id,
          name: row.name,
          buyer: row.buyer,
          seller: row.seller,
          point: row.point,
          createdAt: row.created_at,
        }));

        return orders;
      },
    },
    Mutation: {
      createUser: async (
        _parent: unknown,
        args: {
          input: {
            email: string;
            password: string;
          };
        },
        context: GraphQLContext
      ) => {
        try {
          const regex = /^(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9.?/-]{8,20}$/;
          if (!regex.test(args.input.password)) {
            throw new GraphQLError(
              "パスワードは8文字以上20文字以内で少なくとも英語大文字と英語小文字と数字を一文字以上入力してください"
            );
          }
          const [checkUserRowData] = await context.con.execute<IUser[]>(
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

          const checkUser = checkUserRowData[0];
          if (checkUser && checkUser.id) {
            throw new GraphQLError("メールアドレスは登録済みです");
          }
          const hashPassword = bcrypt.hashSync(String(args.input.password), 3);
          const initPoint = 10000;
          const [insertUserRowData] =
            await context.con.execute<ResultSetHeader>(
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
              [args.input.email, hashPassword, initPoint]
            );

          const [userRowData] = await context.con.execute<IUser[]>(
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

          return {
            user: {
              id: user.id,
              email: user.email,
              point: user.point,
            },
          };
        } catch (e) {
          return e;
        }
      },
      signin: async (
        _parent: unknown,
        args: {
          input: {
            email: string;
            password: string;
          };
        },
        context: GraphQLContext
      ) => {
        try {
          const [userRowData] = await context.con.execute<IUser[]>(
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

          const user = userRowData[0];
          if (!user) {
            throw new GraphQLError("ログインできません");
          }
          const checkPassword = bcrypt.compareSync(
            args.input.password,
            user.password
          );
          if (!checkPassword) {
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
        args: {
          input: {
            name: string;
            point: number;
          };
        },
        context: GraphQLContext
      ) => {
        try {
          if (!context.user) {
            throw new GraphQLError("認証エラーです");
          }
          const [insertItemRowData] =
            await context.con.execute<ResultSetHeader>(
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

          const [itemRowData] = await context.con.execute<IItem[]>(
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

          const item: IItem = itemRowData[0];

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
        args: {
          input: {
            id: string;
            name: string;
            point: number;
          };
        },
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
        const [itemRowData] = await context.con.execute<IItem[]>(
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
        const item = itemRowData[0];

        return {
          item: {
            id: encodedId(item.id, "Item"),
            name: item.name,
            point: item.point,
          },
        };
      },
      deleteItem: async (
        _parent: unknown,
        args: {
          input: {
            id: string;
          };
        },
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
              del = ?
            WHERE 
              id = ?
              AND user_id = ?
          `,
          [1, decodedId(args.input.id), decodedId(context.user.id)]
        );

        return { deletedItemId: args.input.id };
      },
      createOrder: async (
        _parent: unknown,
        args: {
          input: {
            itemId: string;
          };
        },
        context: GraphQLContext
      ) => {
        if (!context.user) {
          throw new GraphQLError("認証エラーです");
        }

        const [itemRowData] = await context.con.execute<IItem[]>(
          `
          SELECT
            i.id,
            i.name,
            i.point,
            i.user_id,
            u.email
          FROM
            items AS i
          LEFT JOIN
            users AS u
          ON
            i.user_id = u.id
          WHERE
            i.id = ?
            AND i.del = ?
            AND i.user_id != ?
        `,
          [decodedId(args.input.itemId), 0, decodedId(context.user.id)]
        );

        const item = itemRowData[0];

        const [insertOrderRowData] = await context.con.execute<ResultSetHeader>(
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
            decodedId(context.user.id),
            decodedId(args.input.itemId),
            item.point,
            context.user.email,
            item.email,
            item.name,
          ]
        );

        await context.con.execute(
          `
            UPDATE
              users
            SET
              point = point - ?
            WHERE
              id = ?
          `,
          [item.point, decodedId(context.user.id)]
        );

        await context.con.execute(
          `
            UPDATE
              users
            SET
              point = point + ?
            WHERE
              id = ?
          `,
          [item.point, item.user_id]
        );

        const [orderRowData] = await context.con.execute<IOrder[]>(
          `
            SELECT
              id,
              name,
              point,
              buyer,
              seller,
              created_at
            FROM
              orders
            WHERE
              id = ?
          `,
          [insertOrderRowData.insertId]
        );

        const order: IOrder = orderRowData[0];

        return {
          order: {
            id: order.id,
            name: order.name,
            point: order.point,
            buyer: order.buyer,
            seller: order.seller,
            createdAt: order.created_at,
          },
        };
      },
    },
  },
});
