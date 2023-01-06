import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers } from "@graphql-tools/merge";
import { createSchema } from "graphql-yoga";
import { RowDataPacket } from "mysql2";
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
