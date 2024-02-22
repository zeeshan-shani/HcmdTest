import CryptoJS from "crypto-js";
import { Number } from "services/helper/default";

export const API_Payload_DEC = async (data, string = process.env.REACT_APP_SECKEY) => {
    const decrypt = await JSON.parse(CryptoJS.AES.decrypt(data, "HCMD" + Number(string)).toString(CryptoJS.enc.Utf8));
    return decrypt;
};
