import * as faker from "faker";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
import { deleteSchema } from "../../../utils/deleteSchema";
import { TestClient } from "../../../utils/TestClient";
import { createTestConn } from "../../../testUtils/createTestConn";

let conn: Connection;
faker.seed(Date.now() + 4);
const email = faker.internet.email();
const password = faker.internet.password();
let userId: string;

beforeAll(async () => {
  conn = await createTestConn();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  await deleteSchema(User);
  conn.close();
});

describe("me query", () => {
  const client = new TestClient(process.env.TEST_HOST as string);
  test("return null if no cookie", async () => {
    const response = await client.me();

    expect(response.data.me).toBeNull();
  });

  test("get current user", async () => {
    await client.login(email, password);

    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });
});
