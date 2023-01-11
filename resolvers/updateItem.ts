import { GraphQLError } from "graphql";
import { ResultSetHeader } from "mysql2";
import { GraphQLContext } from "../src/main";
import { decodedId, encodedId, IItem } from "../src/schema";

export default {
  Mutation: {
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
      try {
        if (!context.user) {
          throw new GraphQLError("認証エラーです");
        }
        if (!decodedId(args.input.id)) {
          throw new GraphQLError("商品IDが無効です");
        }
        if (args.input.name.length > 255) {
          throw new GraphQLError("文字数オーバーです");
        }
        const [updateItemRowData] = await context.con.execute<ResultSetHeader>(
          `
          UPDATE
            items
          SET
            name = ?,
            point = ?
          WHERE
            id = ?
            AND user_id = ?
            AND del = ?
        `,
          [
            args.input.name,
            args.input.point,
            decodedId(args.input.id),
            decodedId(context.user.id),
            0,
          ]
        );
        if (updateItemRowData.affectedRows === 0) {
          throw new GraphQLError("商品が存在しません");
        }
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
      } catch (e) {
        return e;
      }
    },
  },
};
