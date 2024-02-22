import { CONST } from "utils/constants";
import { preparePayload } from "../serviceProviders/Encryptor";
import PlaceholderApiProvider from "../serviceProviders/PlaceholderApiProvider";

class PatientService extends PlaceholderApiProvider {
    async create({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/create', data, configuration);
    }
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
    async delete({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post(`/delete`, data, configuration);
    }
    async attachmentCreate({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/attachment/create', data, configuration);
    }
    async attachmentUpdate({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/attachment/update', data, configuration);
    }
    async attachmentDelete({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/attachment/delete', data, configuration);
    }
    async noteCreate({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/note/create', data, configuration);
    }
    async noteUpdate({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/note/update', data, configuration);
    }
    async noteDelete({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/note/delete', data, configuration);
    }
    async taskCreate({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/task/create', data, configuration);
    }
    async taskUpdate({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/task/update', data, configuration);
    }
    async taskDelete({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config, ...CONST.API_TIMEOUT.L2 };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/task/delete', data, configuration);
    }
    async createPatientSchedule({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/createpatientschedule', data, configuration);
    }
    async markAsRead({ payload = {}, config = { headers: {} }, headers = {}, encrypted = true }) {
        let data = payload;
        let configuration = { ...config };
        data = preparePayload({ data, payload, encrypted, configuration, headers })
        return this.api.post('/markAsRead', data, configuration);
    }
}

const patientService = new PatientService('/patient');

export default patientService;
