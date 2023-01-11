import { GraphQLError } from "graphql";
import { GraphQLContext } from "../src/main";
import { decodedId, encodedId, IUser } from "../src/schema";

export default {
  Query: {
    user: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      try {
        if (!decodedId(args.id)) {
          throw new GraphQLError("ユーザーIDが無効です");
        }
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
      } catch (e) {
        return e;
      }
    },
  },
};
