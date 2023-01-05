import { GraphQLError } from "graphql";
import { ResultSetHeader } from "mysql2";
import { GraphQLContext } from "../src/main";
import { decodedId, encodedId, IItem, IOrder, IUser } from "../src/schema";

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
  },
};