import { createSchema, GraphQLSchemaWithContext } from "graphql-yoga";
import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { GraphQLContext } from "./main";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { mergeResolvers } from "@graphql-tools/merge";
import currentUser from "../resolvers/currentUser";
import user from "../resolvers/user";
import item from "../resolvers/item";
import items from "../resolvers/items";
import orders from "../resolvers/orders";
import createUser from "../resolvers/createUser";
import signin from "../resolvers/signin";
import createItem from "../resolvers/createItem";
import updateItem from "../resolvers/updateItem";
import deleteItem from "../resolvers/deleteItem";
import createOrder from "../resolvers/createOrder";

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
  createOrder
]);

export const schema = createSchema({
  typeDefs: typeDefs,
  resolvers: resolvers
});
