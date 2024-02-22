import { preparePayload } from "../serviceProviders/Encryptor";
import PlaceholderApiProvider from "../serviceProviders/PlaceholderApiProvider";

class TemplateAssignuserService extends PlaceholderApiProvider {
    async update({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/update', data, configuration);
    }
}

const templateAssignuserService = new TemplateAssignuserService('/templateassignuser');

export default templateAssignuserService;
