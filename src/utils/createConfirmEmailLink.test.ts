import * as Redis from "ioredis";
import fetch from "node-fetch";

import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeormConnection } from "./createTypeormConnection";
import { User } from "../entity/User";

let userId: string;
const redis = new Redis();

beforeAll(async () => {
  await createTypeormConnection();
  const user = await User.create({
    email: "bob5@bob.com",
    password: "sdfsdfsfs"
  }).save();
  userId = user.id;
});

// describe("make sure createConfirmEmailLink works", async () => {
//   const redis = new Redis();
//   const url = await createConfirmEmailLink(
//     process.env.TEST_HOST as string,
//     userId,
//     redis
//   );
//   it("checks if the link is working", async () => {
//     const response = await fetch(url);
//     const text = await response.text();
//     expect(text).toEqual("ok");
//   });

//   it("checks if the user is confirmed", async () => {
//     const user = await User.findOne({ where: { id: userId } });
//     expect((user as User).confirmed).toBeTruthy();
//   });

//   it("should remove the key from redis after being confirmed", async () => {
//     const chunks = url.split("/");
//     const key = chunks[chunks.length - 1];

//     const value = await redis.get(key);
//     expect(value).toBeNull();
//   });
// });

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

  const response2 = await fetch(`${process.env.TEST_HOST}/confirm/sfsdfscsd`);
  const text2 = await response2.text();
  expect(text2).toEqual("invalid");
});
