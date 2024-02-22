
const getTransferForm = () => {
    return [
        {
            "name": "provider",
            "label": "Assign to Provider",
            "valueKey": "provider",
            "value": "",
            "placeholder": "Select Provider",
            "type": "select",
            "validationType": "array",
            "validations": [
                {
                    "type": "required",
                    "params": ["Provider is required"]
                }
            ],
            "options": [],
            "isEditable": true,
            // "optionKey": {
            //     "url": base.URL + '/user/list',
            //     "payload": {
            //         "query": {
            //             "isActive": true,
            //         },
            //         "keys": ["name"],
            //         "value": ""
            //     },
            //     "method": "post",
            //     "labelField": "name",
            //     "valueField": "id"
            // },
            "pluginConfiguration": {
                // "isAsyncSelect": true,
                // "isClearable": true,
            },
        },
        {
            "name": "transferType",
            "label": "Transfer type",
            "valueKey": "transferType",
            "value": "permenant",
            "type": "radio",
            "validationType": "string",
            "validations": [{
                "type": "required",
                "params": ["Type should be mentioned"]
            }],
            "isEditable": true,
            "options": [{
                "label": "Permenant",
                "value": "permenant"
            },
            {
                "label": "Temporary",
                "value": "temporary"
            }]
        },
        {
            "name": "duration",
            "label": "Duration Period (In days)",
            "valueKey": "duration",
            "value": "",
            "type": "number",
            "validationType": "number",
            "validations": [],
            "isEditable": true,
            "note": "Don't require in case of permenant transfer"
        },
        {
            "name": "reasonOfTransfer",
            "label": "Reason of Transfer",
            "valueKey": "reasonOfTransfer",
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

export default getTransferForm;