import { GraphQLError } from "graphql";
import { ResultSetHeader } from "mysql2";
import { GraphQLContext } from "../src/main";
import { decodedId, encodedId, IItem, IOrder, IUser } from "../src/schema";

export default {
  Mutation: {
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
  },
};