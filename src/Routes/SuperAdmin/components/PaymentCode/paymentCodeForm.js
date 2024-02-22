import { CONST } from "utils/constants";

const getPaymentCodeForm = () => {
    return [
        {
            "name": "code",
            "label": "Payment Code",
            "valueKey": "code",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [{
                "type": "required",
                "params": ["Payment code is required!"]
            }],
            "isEditable": true,
            "classes": { wrapper: "col-12", label: "", field: "", error: "" },
        },
        {
            "label": "Type of code",
            "name": "codeType",
            "value":
                CONST.BILLING_CODE_TYPES.SECONDARY_BILLING_CODE.value,
            "valueKey": "codeType",
            "type": "radio",
            "options": [
                CONST.BILLING_CODE_TYPES.NEW_BILLING_CODE,
                CONST.BILLING_CODE_TYPES.FOLLOWUP_CODE,
                CONST.BILLING_CODE_TYPES.SECONDARY_BILLING_CODE,
            ],
            "isEditable": true,
            "validationType": "string",
            "classes": { wrapper: "col-12", label: "", field: "", error: "" },
            "validations": [{ type: "required", params: ["Code type required!"] }],
        },
        {
            "label": "Mark as Default",
            "name": "isDefault",
            "value": "false",
            "valueKey": "isDefault",
            "type": "radio",
            "options": [{ label: "Yes", value: "true" }, { label: "No", value: "false" }],
            "isEditable": true,
            "validationType": "string",
            "classes": { wrapper: "col-12", label: "", field: "", error: "" },
            "validations": [{ type: "required", params: ["Required field!"] }],
        },
    ]
}
export default getPaymentCodeForm;