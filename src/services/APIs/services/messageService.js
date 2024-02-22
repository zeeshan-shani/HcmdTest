import { CONST } from "utils/constants";
import { preparePayload } from "../serviceProviders/Encryptor";
import PlaceholderApiProvider from "../serviceProviders/PlaceholderApiProvider";

class MessageService extends PlaceholderApiProvider {

    async getPresignedUrl({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/file', data, configuration);
    }
    async list({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/list', data, configuration);
    }
    async messageList({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/info', data, configuration);
    }
    async getCountrange({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/messageCountRange', data, configuration);
    }
    async getThreadList({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/threadMessageList', data, configuration);
    }
    async getMediaList({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/chatGallaryMedia', data, configuration);
    }
    async getLastMessage({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/checkUserLastMessage', data, configuration);
    }
    async getGlobalMessages({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/searchMessageAndChat', data, configuration);
    }
    async getRecipient({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/recipient', data, configuration);
    }
}

const messageService = new MessageService('/message');

export default messageService;
