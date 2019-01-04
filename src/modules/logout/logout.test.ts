import { Connection } from "typeorm";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";
import { deleteSchema } from "../../utils/deleteSchema";
import { TestClient } from "../../utils/TestClient";

let conn: Connection;
const email = "bob123@bob.com";
const password = "sdfsdfsfs";
let userId: string;

beforeAll(async () => {
  conn = await createTypeormConnection();
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

describe("logout", () => {
  test("multiple session", async () => {
    // computer 1
    const sess1 = new TestClient(process.env.TEST_HOST as string);
    // computer 2
    const sess2 = new TestClient(process.env.TEST_HOST as string);

    await sess1.login(email, password);
    await sess2.login(email, password);

    expect(await sess1.me()).toEqual(await sess2.me());

    await sess1.logout();

    const response1 = await sess1.me();

    expect(response1.data.me).toBeNull();

    expect(await sess1.me()).toEqual(await sess2.me());
  });
  test("single session", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.login(email, password);

    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    await client.logout();

    const response2 = await client.me();

    expect(response2.data.me).toBeNull();
  });
});
