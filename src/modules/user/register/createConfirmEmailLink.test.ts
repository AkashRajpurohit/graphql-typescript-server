import fetch from "node-fetch";
import * as faker from "faker";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { Connection } from "typeorm";
import { createTestConn } from "../../../testUtils/createTestConn";
import { User } from "../../../entity/User";
import { deleteSchema } from "../../../utils/deleteSchema";
import { redis } from "../../../redis";

let userId: string;
let conn: Connection;
faker.seed(Date.now() + 5);

beforeAll(async () => {
  conn = await createTestConn();
  const user = await User.create({
    email: faker.internet.email(),
    password: faker.internet.password()
  }).save();
  userId = user.id;
});

afterAll(async () => {
  await deleteSchema(User);
  conn.close();
});

test("make sure createConfirmEmailLink works", async () => {
  const url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userId,
    redis
  );
  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual("ok");

  const user = await User.findOne({ where: { id: userId } });
  expect((user as User).confirmed).toBeTruthy();

  const chunks = url.split("/");
  const key = chunks[chunks.length - 1];
  const value = await redis.get(key);
  expect(value).toBeNull();
});
