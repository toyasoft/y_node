import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers } from "@graphql-tools/merge";
import bcrypt from "bcryptjs";
import { createSchema } from "graphql-yoga";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import mysql, { ResultSetHeader } from "mysql2/promise";
import path from "path";
import createItem from "../resolvers/createItem";
import createOrder from "../resolvers/createOrder";
import createUser from "../resolvers/createUser";
import currentUser from "../resolvers/currentUser";
import deleteItem from "../resolvers/deleteItem";
import item from "../resolvers/item";
import items from "../resolvers/items";
import orders from "../resolvers/orders";
import signin from "../resolvers/signin";
import updateItem from "../resolvers/updateItem";
import user from "../resolvers/user";

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

const resolvers: any = mergeResolvers([
  currentUser,
  user,
  item,
  items,
  orders,
  createUser,
  signin,
  createItem,
  updateItem,
  deleteItem,
  createOrder,
]);

export const schema = createSchema({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

type UserValues = {
  email: string;
  password: string;
  point: number;
};

type ItemValues = {
  name: string;
  point: number;
  userId: number;
  del: number;
};

type OrderValues = {
  userId: number;
  itemId: number;
  point: number;
  buyer: string;
  seller: string;
  name: string;
};

export const initializeUserDatabase = async (
  con: mysql.Connection,
  user: UserValues
) => {
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
  const userToken = await jwt.sign(
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
  return {
    userId: insertUserRowData.insertId,
    userToken: userToken,
  };
};

export const initializeItemDatabase = async (
  con: mysql.Connection,
  item: ItemValues
) => {
  const [insertItemRowData] = await con.execute<ResultSetHeader>(
    `
      INSERT INTO
        items (
          name,
          point,
          user_id,
          del
        )
      VALUES
        (?, ?, ?, ?)
    `,
    [item.name, item.point, item.userId, item.del]
  );
  return { itemId: insertItemRowData.insertId };
};

export const initializeOrderDatabase = async (
  con: mysql.Connection,
  order: OrderValues
) => {
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
      order.userId,
      order.itemId,
      order.point,
      order.buyer,
      order.seller,
      order.name,
    ]
  );
};

export const clearUserDatabase = async (con: mysql.Connection) => {
  await con.execute(`
    DELETE FROM
      users
  `);
};

export const clearItemDatabase = async (con: mysql.Connection) => {
  await con.execute(`
    DELETE FROM
      items
  `);
};

export const clearOrderDatabase = async (con: mysql.Connection) => {
  await con.execute(`
    DELETE FROM
      orders
  `);
};
