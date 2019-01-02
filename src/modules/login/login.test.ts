import { request } from "graphql-request";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import { User } from "../../entity/User";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { deleteSchema } from "../../utils/deleteSchema";

const email = "akash121@gmail.com";
const password = "b2dsdfsd";

const registerMutation = (e: string, p: string) => `
  mutation{
    register(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

const loginMutation = (e: string, p: string) => `
  mutation{
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

beforeAll(async () => {
  await createTypeormConnection();
});

afterAll(async () => {
  await deleteSchema(User);
});

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, p)
  );

  expect(response).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  });
};

describe("login", () => {
  test("email not found send back error", async () => {
    await loginExpectError("bob@bob.com", "whatever", invalidLogin);
  });

  test("email not confirmed", async () => {
    await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );

    await loginExpectError(email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(email, "sdssd", invalidLogin);
  });

  test("Login the registered and confirmed user", async () => {
    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password)
    );

    expect(response).toEqual({ login: null });
  });
});
