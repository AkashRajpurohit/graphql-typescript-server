import { request } from "graphql-request";
import { User } from "../../entity/User";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { deleteSchema } from "../../utils/deleteSchema";
import { Connection } from "typeorm";

const email = "akash121@gmail.com";
const password = "b2dsdfsd";

let conn: Connection;

const mutation = (e: string, p: string) => `
  mutation{
    register(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  await deleteSchema(User);
  conn.close();
});

describe("Register user", async () => {
  it("make sure we can register a user", async () => {
    const response = await request(
      process.env.TEST_HOST as string,
      mutation(email, password)
    );
    expect(response).toEqual({ register: null });

    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);

    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  it("test for duplicate emails", async () => {
    const response2: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, password)
    );
    expect(response2.register).toHaveLength(1);
    expect(response2.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  it("check bad email", async () => {
    const response3: any = await request(
      process.env.TEST_HOST as string,
      mutation("b", password)
    );
    expect(response3).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: invalidEmail
        }
      ]
    });
  });

  it("catch bad password", async () => {
    const response4: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, "sd")
    );
    expect(response4).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });

  it("catch bad password and bad email", async () => {
    const response5: any = await request(
      process.env.TEST_HOST as string,
      mutation("df", "sd")
    );
    expect(response5).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: invalidEmail
        },
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });
});
