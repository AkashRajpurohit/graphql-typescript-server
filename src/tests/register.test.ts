import { request } from "graphql-request";
import { host } from "./constants";
import { User } from "../entity/User";
import { createTypeormConnection } from "../utils/createTypeormConnection";

beforeAll(async () => {
  await createTypeormConnection();
});

const email = "tom@bob.com";
const password = "bob123";

const mutation = `
  mutation{
    register(email: "${email}", password: "${password}")
  }
`;

test("adds 1+2 to equal 3", async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: true });

  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);

  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});

// Use a test database
// drop all data once the test is over
// when i run yarn test it also starts the server
