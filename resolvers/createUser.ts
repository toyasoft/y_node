import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import { ResultSetHeader } from "mysql2";
import { GraphQLContext } from "../src/main";
import { IUser } from "../src/schema";

export default {
  Mutation: {
    createUser: async (
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
        if (args.input.email.length > 256) {
          throw new GraphQLError("文字数オーバーです");
        }
        const pattern =
          /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/;
        if (!pattern.test(args.input.email)) {
          throw new GraphQLError("メールアドレスではありません");
        }
        const regex = /^(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9.?/-]{8,20}$/;
        if (!regex.test(args.input.password)) {
          throw new GraphQLError(
            "パスワードは8文字以上20文字以内で少なくとも英語大文字と英語小文字と数字を一文字以上入力してください"
          );
        }
        const [checkUserRowData] = await context.con.execute<IUser[]>(
          `
            SELECT
              id
            FROM
              users
            WHERE
              email = ?
          `,
          [args.input.email]
        );

        const checkUser = checkUserRowData[0];
        if (checkUser && checkUser.id) {
          throw new GraphQLError("メールアドレスは登録済みです");
        }
        const hashPassword = bcrypt.hashSync(String(args.input.password), 3);
        const initPoint = 10000;
        const [insertUserRowData] = await context.con.execute<ResultSetHeader>(
          `
            INSERT INTO
              users (
                email,
                password,
                point
              )
            VALUES
              (?, ?, ?)
          `,
          [args.input.email, hashPassword, initPoint]
        );

        const [userRowData] = await context.con.execute<IUser[]>(
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
          [insertUserRowData.insertId]
        );
        const user = userRowData[0];

        return {
          user: {
            id: user.id,
            email: user.email,
            point: user.point,
          },
        };
      } catch (e) {
        return e;
      }
    },
  },
};
