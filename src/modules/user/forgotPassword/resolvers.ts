import * as bcrypt from "bcryptjs";
import * as yup from "yup";
import { userNotFoundError, expiredKeyError } from "./errorMessages";
import { registerPasswordValidation } from "../../../yupSchemas";
import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { forgotPasswordPrefix } from "../../../constants";
import { formatYupError } from "../../../utils/formatYupError";

const schema = yup.object().shape({
  newPassword: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [
          {
            path: "email",
            message: userNotFoundError
          }
        ];
      }
      await forgotPasswordLockAccount(user.id, redis);
      // @todo add frontend url
      await createForgotPasswordLink("", user.id, redis);
      // @todo send email with url
      return true;
    },

    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const redisKey = `${forgotPasswordPrefix}${key}`;
      const userId = await redis.get(redisKey);
      if (!userId) {
        return [
          {
            path: "key",
            message: expiredKeyError
          }
        ];
      }

      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const hashPassword = await bcrypt.hash(newPassword, 10);

      const updateUserPromise = User.update(
        { id: userId },
        { forgotPasswordLocked: false, password: hashPassword }
      );

      const deleteRedisKeyPromise = redis.del(redisKey);

      await Promise.all([updateUserPromise, deleteRedisKeyPromise]);
      return null;
    }
  }
};
