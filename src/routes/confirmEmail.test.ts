import fetch from "node-fetch";

test("sends invalid back if bad id sent", async () => {
  const response2 = await fetch(`${process.env.TEST_HOST}/confirm/sfsdfscsd`);
  const text2 = await response2.text();
  expect(text2).toEqual("invalid");
});
