import axios from "axios";
import { Connection } from "typeorm";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";
import { deleteSchema } from "../../utils/deleteSchema";

let conn: Connection;
const email = "bob123@bob.com";
const password = "sdfsdfsfs";
let userId: string;

const loginMutation = (e: string, p: string) => `
  mutation{
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

const meQuery = `
  {
    me {
      id
      email
    }
  }
`;

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

describe("me query", () => {
  // test("cant get user if not logged in", async () => {

  // });

  test("get current user", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    );

    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      {
        withCredentials: true
      }
    );

    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });
});
