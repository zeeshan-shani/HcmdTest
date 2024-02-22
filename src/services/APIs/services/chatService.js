import { CONST } from "utils/constants";
import { preparePayload } from "../serviceProviders/Encryptor";
import PlaceholderApiProvider from "../serviceProviders/PlaceholderApiProvider";

class ChatService extends PlaceholderApiProvider {
  async getChatData({
    payload = {},
    config = { headers: {} },
    headers = {},
    encrypted = true,
  }) {
    let data = payload;
    let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post("/info", data, configuration);
  }
  async createChat({
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
  // To get chats for dashboard list
  async dashboardList({
    payload = {},
    config = { headers: {} },
    headers = {},
    encrypted = true,
  }) {
    let data = payload;
    let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post("/dashboard/list", data, configuration);
  }
  async chatList({
    payload = {},
    config = { headers: {} },
    headers = {},
    encrypted = true,
  }) {
    let data = payload;
    let configuration = { ...config };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post("/list", data, configuration);
  }
  async chatuserList({
    payload = {},
    config = { headers: {} },
    headers = {},
    encrypted = true,
  }) {
    let data = payload;
    let configuration = { ...config };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post("/user/list", data, configuration);
  }
  async muteNotification({
    payload = {},
    config = { headers: {} },
    headers = {},
    encrypted = true,
  }) {
    let data = payload;
    let configuration = { ...config };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post("/updateMuteNotification", data, configuration);
  }
  async getGrouplist({
    payload = {},
    config = { headers: {} },
    headers = {},
    encrypted = true,
  }) {
    let data = payload;
    let configuration = { ...config };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post("/grouplist", data, configuration);
  }
  async announce({
    payload = {},
    config = { headers: {} },
    headers = {},
    encrypted = true,
  }) {
    let data = payload;
    let configuration = { ...config };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post("/announcement", data, configuration);
  }
  async getAnnouncementList({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
    let data = payload;
    let configuration = { ...config };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post('/announcement/list', { params: data, ...configuration });
}
}

const chatService = new ChatService("/chat");

export default chatService;
