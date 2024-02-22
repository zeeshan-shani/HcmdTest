/**
 * This file contains the CoreApi class, which is responsible for handling API requests and responses.
 * It sets up the base URL and slug for the API, and provides methods for intercepting requests and responses.
 * The class also includes helper functions for handling errors and decrypting response data.
 */

import { base } from 'utils/config';
import { showError } from 'utils/package_config/toast';
import axiosProvider from './axiosProvider';
import { API_Payload_DEC } from './serviceProviders/Decryptor';

// Set the key name and retrieve the app version from environment variables
const key_name = "app_version";
const app_version = process.env.REACT_APP_VERSION;

// Retrieve the local version from localStorage
let local_version = localStorage.getItem(key_name);

// Update the local version in localStorage if it is not set or different from the app version
if (!local_version || (local_version && local_version !== app_version)) {
    localStorage.setItem(key_name, app_version);
}

// Set cache headers based on the local version
const cacheHeaders = local_version !== app_version ?
    {
        'Cache-Control': 'max-age=0'
    }
    :
    {
        'Cache-Control': 'max-age=600000'
    }

class CoreApi {
    constructor(baseUrl, slug = '') {
        this.baseUrl = baseUrl;
        this.slug = slug;
        this.api = axiosProvider(`${this.baseUrl}${this.slug}`);
        this.setInterceptors({
            beforeRequest: this._beforeRequest,
            requestError: this._requestError,
            afterResponse: this._afterResponse,
            responseError: this._responseError,
        });
    }

    setInterceptors = ({
        beforeRequest,
        requestError,
        afterResponse,
        responseError,
    }) => {
        this.api.interceptors.request.use(beforeRequest, requestError);
        this.api.interceptors.response.use(afterResponse, responseError);
    };

    _beforeRequest(config = {}) {
        if (!config.timeout) config.timeout = 1000 * 25;
        if (config.method === "get") config.headers["Access-Control-Allow-Origin"] = "*";
        if (localStorage.getItem("token")) config.headers["x-access-token"] = localStorage.getItem("token");
        if (config.headers["encrypt_request"] === "true" && config.headers['Content-type'] !== "text/plain")
            config.headers["Content-Type"] = "text/plain";
        else config.headers["Content-Type"] = "application/json";
        config.headers = { ...cacheHeaders, ...config.headers }
        // if (process.env.REACT_APP_VERSION)
        //     config.url = `${config.url}?v=${process.env.REACT_APP_VERSION}`
        return config;
    }

    _requestError(error) {
        throw error;
    }

    async _afterResponse(resp) {
        // console.log('resp.request', resp.request.responseURL)
        if (base.RUNNING === "LOCAL" || resp.request.responseType === "arraybuffer")
            return resp.data || resp;
        const res = await API_Payload_DEC(resp.data);
        resp.data = res
        // console.log('res', res)
        return resp.data || resp;
    }

    _responseError(error) {
        if (error?.response?.data?.status === 0 && error?.response?.data?.message)
            return showError(error.response.data.message)
        return error;
        // throw error;
    }
}

export default CoreApi;