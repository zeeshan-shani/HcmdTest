import { base } from "utils/config";

const getFacilityForm = () => {
    // const providers = [
    //     {
    //         "name": "np",
    //         "label": "NP",
    //         "valueKey": "np",
    //         "value": "",
    //         "placeholder": "NP",
    //         "type": "select",
    //         "validationType": "array",
    //         "validations": [],
    //         "isEditable": true,
    //         "optionKey": {
    //             "url": base.URL + '/user/list',
    //             "payload": {
    //                 "query": {
    //                     // "facilityId": update.id || undefined
    //                     "ownProvider": true
    //                 },
    //                 "keys": ["name"],
    //                 "value": ""
    //             },
    //             "method": "post",
    //             "labelField": "name",
    //             "valueField": "id"
    //         },
    //         "pluginConfiguration": {
    //             "isAsyncSelect": true,
    //             "isClearable": true,
    //             "isMulti": true
    //         },
    //         "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
    //     },
    //     {
    //         "name": "md",
    //         "label": "MD",
    //         "valueKey": "md",
    //         "value": "",
    //         "placeholder": "MD",
    //         "type": "select",
    //         "validationType": "array",
    //         "validations": [],
    //         "isEditable": true,
    //         "optionKey": {
    //             "url": base.URL + '/user/list',
    //             "payload": {
    //                 "query": {
    //                     // "facilityId": update.id || undefined
    //                     "ownProvider": true
    //                 },
    //                 "keys": ["name"],
    //                 "value": ""
    //             },
    //             "method": "post",
    //             "labelField": "name",
    //             "valueField": "id"
    //         },
    //         "pluginConfiguration": {
    //             "isAsyncSelect": true,
    //             "isClearable": true,
    //             "isMulti": true
    //         },
    //         "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
    //     },
    // ]
    const facility = [
        {
            "name": "name",
            "label": "Facility",
            "valueKey": "name",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [{
                "type": "required",
                "params": ["Facility is required!"]
            }],
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        },
        {
            "name": "orgId",
            "label": "Organization",
            "valueKey": "orgId",
            "value": "",
            "placeholder": "Select Organization",
            "type": "select",
            "validationType": "array",
            "validations": [
                {
                    "type": "required",
                    "params": ["Organization is required"]
                }
            ],
            "isEditable": true,
            "optionKey": {
                "url": base.URL + '/organization/list',
                "payload": {
                    "query": {},
                    "keys": ["name"],
                    "value": ""
                },
                "method": "post",
                "labelField": "name",
                "valueField": "id"
            },
            "pluginConfiguration": {
                "isAsyncSelect": true,
                "isClearable": true,
            },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        },
        {
            "name": "location",
            "label": "Location",
            "valueKey": "location",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [{
                "type": "required",
                "params": ["Location is required!"]
            }],
            "isEditable": true,
            "classes": { wrapper: "col-12", label: "", field: "", error: "" },
        },

    ]
    const org = [
        {
            "name": "roomNumber",
            "label": "Room no.",
            "valueKey": "roomNumber",
            "value": "",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "isEditable": true,
            "options": [],
            "pluginConfiguration": {
                "isCreatable": true,
                "isMulti": true,
                "isClearable": true
            },
            "classes": { wrapper: "col-12", label: "", field: "", error: "" },
        },
    ]

    // return [...facility, ...providers, ...org];
    return [...facility, ...org];
}

export default getFacilityForm;