import { GraphQLError } from "graphql";
import { GraphQLContext } from "../src/main";
import { decodedId, encodedId, IItem, IUser } from "../src/schema";

export default {
  Query: {
    item: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      try {
        const itemId = decodedId(args.id);
        if (!itemId) {
          throw new GraphQLError("IDが存在しません");
        }
        const [itemRowData] = await context.con.execute<IItem[]>(
          `
          SELECT
            id,
            name,
            point,
            user_id
          FROM
            items
          WHERE
            id = ?
            AND del = ?
        `,
          [decodedId(args.id), 0]
        );
        const item: IItem = itemRowData[0];
        if (!item) {
          throw new GraphQLError("商品が存在しません");
        }

        return {
          id: encodedId(item.id, "Item"),
          name: item.name,
          point: item.point,
          userId: item.user_id,
        };
      } catch (e) {
        return e;
      }
    },
  },
};