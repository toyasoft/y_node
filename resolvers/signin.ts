import { GraphQLError } from "graphql";
import { ResultSetHeader } from "mysql2";
import { GraphQLContext } from "../src/main";
import { decodedId, encodedId, IItem, IOrder, IUser } from "../src/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default {
  Mutation: {
    signin: async (
      _parent: unknown,
      args: {
        input: {
          email: string;
          password: string;
        };
      },
      context: GraphQLContext
    ) => {
      try {
        const [userRowData] = await context.con.execute<IUser[]>(
          `
            SELECT
              id,
              email,
              password
            FROM
              users
            WHERE
              email = ?
          `,
          [args.input.email]
        );

        const user = userRowData[0];
        if (!user) {
          throw new GraphQLError("ログインできません");
        }
        const checkPassword = bcrypt.compareSync(
          args.input.password,
          user.password
        );
        if (!checkPassword) {
          throw new GraphQLError("ログインできません");
        }

        return {
          user: {
            id: encodedId(user.id, "User"),
            email: user.email,
          },
          userToken: jwt.sign(
            {
              id: encodedId(user.id, "User"),
              email: user.email,
              type: "user",
            },
            String(process.env.AUTH_SECRET),
            {
              expiresIn: "365d",
            }
          ),
        };
      } catch (e) {
        return e;
      }
    },
  },
};