import { GraphQLContext } from "../src/main";
import { IOrder } from "../src/schema";

export default {
  Query: {
    orders: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      const [orderRowData] = await context.con.execute<IOrder[]>(
        `
          SELECT
            id,
            name,
            buyer,
            seller,
            point,
            created_at
          FROM
            orders
        `
      );
      const orders = orderRowData.map((row: IOrder) => ({
        id: row.id,
        name: row.name,
        buyer: row.buyer,
        seller: row.seller,
        point: row.point,
        createdAt: row.created_at,
      }));

      return orders;
    },
  },
};
