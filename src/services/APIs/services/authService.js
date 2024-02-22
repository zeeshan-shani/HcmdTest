import { CONST } from "utils/constants";
import { preparePayload } from "../serviceProviders/Encryptor";
import PlaceholderApiProvider from "../serviceProviders/PlaceholderApiProvider";

class AuthService extends PlaceholderApiProvider {
    async login({ payload, config = {}, headers, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = await preparePayload({ data, payload, encrypted, configuration, headers });
        return this.api.post('/login', data, configuration)
    }

    async verifyToken() {
        return this.api.get(`/verifyToken`, {
            headers: { 'Cache-Control': 'max-age=0' }
        });
    }

    async changePassword({ payload, config = {}, headers, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post("/changePassword", data, configuration);
    }
}

const authService = new AuthService('/auth');

export default authService;
