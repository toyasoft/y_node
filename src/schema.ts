import { createSchema } from "graphql-yoga";
import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers } from "@graphql-tools/merge";

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
      user: async (_parent: unknown, args: any, context: any) => {
        console.log(args);
        return {
          id: 1,
        };
      },
      item: async (_parent: unknown, args: any, context: any) => {},
      items: async (_parent: unknown, args: any, context: any) => {
        console.log(args);
        console.log("test");
        const items = [
          {
            id: encodedId("1", "Item"),
            name: "test",
            price: 1000,
            image: "test.png",
            description: "説明文",
            username: "test",
          },
        ];
        return items;
      },
      orders: async (_parent: unknown, args: any, context: any) => {
        console.log(args);
        console.log("test");
        const orders = [
          {
            id: encodedId("1", "Order"),
            name: "test",
            price: 1000,
            buyer: "test",
            seller: "test",
          },
        ];
        return orders;
      },
    },
    Mutation: {
      createUser: async (
        _parent: unknown,
        args: { input: CreateUserInput },
        context: any
      ) => {},
      signin: async (
        _parent: unknown,
        args: { input: SigninInput },
        context: any
      ) => {},
      createItem: async (
        _parent: unknown,
        args: { input: CreateItemInput },
        context: any
      ) => {},
      updateItem: async (
        _parent: unknown,
        args: { input: UpdateItemInput },
        context: any
      ) => {},
      deleteItem: async (
        _parent: unknown,
        args: { input: DeleteItemInput },
        context: any
      ) => {},
    },
  },
});
