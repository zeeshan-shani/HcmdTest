import { preparePayload } from "../serviceProviders/Encryptor";
import PlaceholderApiProvider from "../serviceProviders/PlaceholderApiProvider";

class FcmTokenService extends PlaceholderApiProvider {
    async create({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/create', data, configuration);
    }
}

const fcmTokenService = new FcmTokenService('/fcmtoken');

export default fcmTokenService;
