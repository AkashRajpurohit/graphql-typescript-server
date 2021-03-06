import * as rp from "request-promise";
export class TestClient {
  url: string;
  jar: any;
  options: {
    json: boolean;
    jar: any;
    withCredentials: boolean;
  };
  constructor(url: string) {
    this.url = url;
    this.jar = rp.jar();
    this.options = {
      json: true,
      jar: this.jar,
      withCredentials: true
    };
  }

  async login(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation{
          login(email: "${email}", password: "${password}") {
            path
            message
          }
        }
        `
      }
    });
  }

  async register(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation{
          register(email: "${email}", password: "${password}") {
            path
            message
          }
        }
        `
      }
    });
  }

  async forgotPasswordChange(newPassword: string, key: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation{
          forgotPasswordChange(newPassword: "${newPassword}", key: "${key}"){
            path
            message
          }
        }
        `
      }
    });
  }

  async me() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        {
          me {
            id
            email
          }
        }
        `
      }
    });
  }

  async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation{
          logout
        }
        `
      }
    });
  }
}
