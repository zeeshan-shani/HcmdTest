/**
*
 * This file defines the APIService class which extends the PlaceholderApiProvider class.
 * It provides a method, apiCall, for making API calls with optional encryption and configuration.
 * The apiCall method accepts a payload object, config object, headers object, and other optional parameters.
 * It prepares the payload, encrypts it if required, and makes the API call using the specified method (post or get).
 * The API endpoint route can also be specified.
 *
 * Example usage:
 * const apiService = new APIService('/');
 * apiService.apiCall({ payload: { ... }, config: { ... }, headers: { ... } });
 */

import { CONST } from "utils/constants";
import { preparePayload } from "../serviceProviders/Encryptor";
import PlaceholderApiProvider from "../serviceProviders/PlaceholderApiProvider";

class APIService extends PlaceholderApiProvider {
    async apiCall({ payload, config = {}, headers, encrypted = true, route = "", method = "post" }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = await preparePayload({ data, payload, encrypted, configuration, headers });
        if (method === "post")
            return this.api.post(route, data, configuration)
        else if (method === "get")
            return this.api.get(route, data, configuration)
    }
}

const ApiService = new APIService('/');
export default ApiService;