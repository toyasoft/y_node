import { GraphQLError } from "graphql";
import { ResultSetHeader } from "mysql2";
import { GraphQLContext } from "../src/main";
import { decodedId, encodedId, IItem, IOrder, IUser } from "../src/schema";

export default {
  Mutation: {
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
  },
};