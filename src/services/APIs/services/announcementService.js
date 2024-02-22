import { preparePayload } from "../serviceProviders/Encryptor";
import PlaceholderApiProvider from "../serviceProviders/PlaceholderApiProvider";

class AnnouncementService extends PlaceholderApiProvider {
  async announce({
    payload = {},
    config = { headers: {} },
    headers = {},
    encrypted = true,
  }) {
    let data = payload;
    let configuration = { ...config };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post("/", data, configuration);
  }
  async getAnnouncementList({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
    let data = payload;
    let configuration = { ...config };
    data = preparePayload({ data, payload, encrypted, configuration, headers });
    return this.api.post('/list', { params: data, ...configuration });
}
}

const announcementService = new AnnouncementService("/announcement");

export default announcementService;
