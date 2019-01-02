import fetch from "node-fetch";
import { redis } from "../redis";

import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeormConnection } from "./createTypeormConnection";
import { User } from "../entity/User";

let userId: string;

beforeAll(async () => {
  await createTypeormConnection();
  const user = await User.create({
    email: "bobsad@bob.com",
    password: "sdfsdfsfs"
  }).save();
  userId = user.id;
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
