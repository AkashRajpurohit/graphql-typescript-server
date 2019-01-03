import { invalidLogin, confirmEmailError } from "./errorMessages";
import { User } from "../../entity/User";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { deleteSchema } from "../../utils/deleteSchema";
import { Connection } from "typeorm";
import { TestClient } from "../../utils/TestClient";

const email = "akash121@gmail.com";
const password = "b2dsdfsd";

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  await deleteSchema(User);
  conn.close();
});

const client = new TestClient(process.env.TEST_HOST as string);

const loginExpectError = async (
  email: string,
  password: string,
  errMsg: string
) => {
  const response = await client.login(email, password);

  expect(response.data).toEqual({
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
    await client.register(email, password);

    await loginExpectError(email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(email, "sdssd", invalidLogin);
  });

  test("Login the registered and confirmed user", async () => {
    const response = await client.login(email, password);

    expect(response.data).toEqual({ login: null });
  });
});
