import { base } from "utils/config";
import CoreApi from "../coreAPI";

class PlaceholderApiProvider extends CoreApi {
    constructor(endpoint) {
        super(base.URL, endpoint);
    }
}

export default PlaceholderApiProvider;
