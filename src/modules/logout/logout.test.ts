import { Connection } from "typeorm";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";
import { deleteSchema } from "../../utils/deleteSchema";
import axios from "axios";

let conn: Connection;
const email = "bob123@bob.com";
const password = "sdfsdfsfs";
let userId: string;

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

const loginMutation = (e: string, p: string) => `
  mutation{
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

const logoutMutation = `
mutation{
  logout
}
`;

describe("logout", () => {
  test("test logging out a user", async () => {
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

    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: logoutMutation
      },
      {
        withCredentials: true
      }
    );

    const response2 = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      {
        withCredentials: true
      }
    );

    expect(response2.data.data.me).toBeNull();
  });
});
