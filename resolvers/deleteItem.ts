import { GraphQLError } from "graphql";
import { ResultSetHeader } from "mysql2";
import { GraphQLContext } from "../src/main";
import { decodedId } from "../src/schema";

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
      if (!decodedId(args.input.id)) {
        throw new GraphQLError("商品IDが無効です");
      }
      const [updateItemRowData] = await context.con.execute<ResultSetHeader>(
        `
          UPDATE 
            items
          SET
            del = ?
          WHERE 
            id = ?
            AND user_id = ?
            AND del = ?
        `,
        [1, decodedId(args.input.id), decodedId(context.user.id), 0]
      );
      if (updateItemRowData.affectedRows === 0) {
        throw new GraphQLError("商品は存在しません");
      }

      return { deletedItemId: args.input.id };
    },
  },
};
