import { CONST } from "utils/constants";
import { preparePayload } from "../serviceProviders/Encryptor";
import PlaceholderApiProvider from "../serviceProviders/PlaceholderApiProvider";

class DraftMessageService extends PlaceholderApiProvider {
    async list({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/list', data, configuration);
    }
    async update({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/update', data, configuration);
    }
    async create({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/create', data, configuration);
    }
    async delete({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/delete', data, configuration);
    }
}

const draftMessageService = new DraftMessageService('/messageDraft');

export default draftMessageService;
