import { TakeConfirmation } from "Components/components";
import dischargeReasonService from "services/APIs/services/dischargeReasonService";

const getDeleteForm = ({ cbDelete }) => {
    const reasonsList = [
        // { value: "Treatment completion", label: "Treatment completion" },
        // { value: "Transfer to another facility", label: "Transfer to another facility" },
        // { value: "Patient request", label: "Patient request" },
        // { value: "Stable condition", label: "Stable condition" },
    ]

    return [
        {
            "name": "dischargeDate",
            "label": "Date of discharge",
            "valueKey": "dischargeDate",
            "value": "",
            "type": "date",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": { "isDateRange": false },
            // "classes": { wrapper: "col-12", label: "", field: "form-control", error: "" },
        },
        {
            "name": "reasonType",
            "label": "Select Reason",
            "valueKey": "reasonType",
            "value": "",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "isEditable": true,
            "options": reasonsList,
            "onDelete": async (id) => {
                TakeConfirmation({
                    title: "Are you sure to delete the reason?",
                    onDone: async () => {
                        await dischargeReasonService.delete({ payload: { id } });
                        cbDelete();
                    }
                })
            },
            "pluginConfiguration": {
                "isCreatable": true,
                "isClearable": true,
                "isOptionRemovable": true,
                "removedText": "Delete option",
                "deleteUrl": "/dischargeReason/delete",
            },
            // "classes": { wrapper: "col-12", label: "", field: "", error: "" },
        },
        {
            "name": "reason",
            "label": "Reason",
            "valueKey": "reason",
            "value": "",
            "type": "textarea",
            "validationType": "string",
            "validations": [
                // {
                //     "type": "required",
                //     "params": ["Please mention reason of the transfer"]
                // }
            ],
            "isEditable": true,
            "pluginConfiguration": { "rows": 3 }
        }
    ]
}

export default getDeleteForm;