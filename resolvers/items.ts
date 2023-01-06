import { GraphQLContext } from "../src/main";
import { encodedId, IItem } from "../src/schema";

export default {
  Query: {
    items: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      const [itemRowData] = await context.con.execute<IItem[]>(
        `
          SELECT
            i.id,
            i.name,
            i.point,
            i.user_id
          FROM
            items AS i
          WHERE
            i.del = ?
        `,
        [0]
      );
      const items = itemRowData.map((row) => ({
        id: encodedId(row.id, "Item"),
        name: row.name,
        point: row.point,
        userId: row.user_id,
      }));

      return items;
    },
  },
};
