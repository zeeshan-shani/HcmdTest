import { CONST } from "utils/constants";
import { preparePayload } from "../serviceProviders/Encryptor";
import PlaceholderApiProvider from "../serviceProviders/PlaceholderApiProvider";

class UserService extends PlaceholderApiProvider {
  async create({
    payload = {},
    config = { headers: {} },
    headers = {},
    encrypted = true,
  }) {
    let data = payload;
    let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post("/create", data, configuration);
  }
  async list({
    payload = {},
    config = { headers: {} },
    headers = {},
    encrypted = true,
  }) {
    let data = payload;
    let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    console.log("-->",data);
    return this.api.post("/list", data, configuration);
  }
  async update({
    payload = {},
    config = { headers: {} },
    headers = {},
    encrypted = true,
  }) {
    let data = payload;
    let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post("/update", data, configuration);
  }
  async getRoles() {
    return this.api.get("/role");
  }
}

const userService = new UserService("/user");

export default userService;
