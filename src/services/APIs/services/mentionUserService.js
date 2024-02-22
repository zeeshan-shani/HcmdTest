import { CONST } from "utils/constants";
import { preparePayload } from "../serviceProviders/Encryptor";
import PlaceholderApiProvider from "../serviceProviders/PlaceholderApiProvider";

class MentionUserService extends PlaceholderApiProvider {
    async list({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/list', data, configuration);
    }
}

const mentionUserService = new MentionUserService('/mentionUser');

export default mentionUserService;
