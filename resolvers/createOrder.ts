import { GraphQLError } from "graphql";
import { ResultSetHeader } from "mysql2";
import { GraphQLContext } from "../src/main";
import { decodedId, IItem, IOrder, IUser } from "../src/schema";

export default {
  Mutation: {
    createOrder: async (
      _parent: unknown,
      args: {
        input: {
          itemId: string;
        };
      },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError("認証エラーです");
      }
      if (!decodedId(args.input.itemId)) {
        throw new GraphQLError("商品IDが無効です");
      }

      const [itemRowData] = await context.con.execute<IItem[]>(
        `
        SELECT
          i.id,
          i.name,
          i.point,
          i.user_id,
          u.email
        FROM
          items AS i
        LEFT JOIN
          users AS u
        ON
          i.user_id = u.id
        WHERE
          i.id = ?
          AND i.del = ?
          AND i.user_id != ?
      `,
        [decodedId(args.input.itemId), 0, decodedId(context.user.id)]
      );

      const item = itemRowData[0];

      if (!item) {
        throw new GraphQLError("商品が存在しません");
      }

      const [insertOrderRowData] = await context.con.execute<ResultSetHeader>(
        `
          INSERT INTO
            orders (
              user_id,
              item_id,
              point,
              buyer,
              seller,
              name
            )
          VALUES
            (?, ?, ?, ?, ?, ?)
        `,
        [
          decodedId(context.user.id),
          decodedId(args.input.itemId),
          item.point,
          context.user.email,
          item.email,
          item.name,
        ]
      );

      await context.con.execute(
        `
          UPDATE
            users
          SET
            point = point - ?
          WHERE
            id = ?
        `,
        [item.point, decodedId(context.user.id)]
      );

      const [buyerRowData] = await context.con.execute<IUser[]>(
        `
          SELECT
            id,
            email,
            point
          FROM
            users
          WHERE
            id = ?
        `,
        [decodedId(context.user.id)]
      );
      const buyer = buyerRowData[0];
      await context.con.execute(
        `
          UPDATE
            users
          SET
            point = point + ?
          WHERE
            id = ?
        `,
        [item.point, item.user_id]
      );
      const [sellerRowData] = await context.con.execute<IUser[]>(
        `
          SELECT
            id,
            email,
            point
          FROM
            users
          WHERE
            id = ?
        `,
        [item.user_id]
      );
      const seller = sellerRowData[0];

      const [orderRowData] = await context.con.execute<IOrder[]>(
        `
          SELECT
            id,
            name,
            point,
            buyer,
            seller,
            created_at
          FROM
            orders
          WHERE
            id = ?
        `,
        [insertOrderRowData.insertId]
      );

      const order: IOrder = orderRowData[0];

      return {
        order: {
          id: order.id,
          name: order.name,
          point: order.point,
          buyer: order.buyer,
          seller: order.seller,
          createdAt: order.created_at,
        },
        buyer: {
          id: buyer.id,
          email: buyer.email,
          point: buyer.point,
        },
        seller: {
          id: seller.id,
          email: seller.email,
          point: seller.point,
        },
      };
    },
  },
};
