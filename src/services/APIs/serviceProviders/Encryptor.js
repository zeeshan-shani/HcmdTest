import CryptoJS from "crypto-js";
import { Number } from "services/helper/default";
import { base } from "utils/config";

export const API_Payload_ENC = ({ payload, string = process.env.REACT_APP_SECKEY, prevent = true }) => {
    if (base.RUNNING === "LOCAL" && prevent) return payload;
    const encrypt = CryptoJS.AES.encrypt(JSON.stringify(payload), "HCMD" + Number(string)).toString();
    return encrypt;
};

export const preparePayload = ({ data, payload, encrypted, configuration, headers = {} }) => {
    try {
        let datapayload = data;
        if (headers) {
            if (configuration.headers)
                configuration.headers = { ...configuration.headers, ...headers };
            else configuration.headers = { ...headers };
        }
        if (encrypted && payload && base.RUNNING !== "LOCAL") {
            configuration.headers["encrypt_request"] = true;
            datapayload = payload && API_Payload_ENC({ payload })
        }
        return datapayload;
    } catch (error) {
        console.error(error);
    }
}
