import { GraphQLError } from "graphql";
import { GraphQLContext } from "../src/main";
import { decodedId, encodedId, IUser } from "../src/schema";

export default {
  Query: {
    currentUser: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      try {
        if (!context.user) {
          throw new GraphQLError("認証エラーです");
        }
        const [userRowData] = await context.con.execute<IUser[]>(
          `
              SELECT
              u.id,
              u.email,
              u.point,
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
          [0, decodedId(context.user.id)]
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
          point: user.point,
          items: items,
        };
      } catch (e) {
        return e;
      }
    },
  },
};
