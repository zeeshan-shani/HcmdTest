import { base } from "utils/config";

const getOutsideProviderForm = (roleData) => {
    const userData = [
        {
            "name": "firstName",
            "label": "First name",
            "valueKey": "firstName",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [
                // { "type": "required", "params": ["First name is required!"] }
            ],
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6 form-group", label: "", field: "form-control", error: "" },
        },
        {
            "name": "lastName",
            "label": "Last name",
            "valueKey": "lastName",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [
                // { "type": "required", "params": ["Last name is required!"] }
            ],
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6 form-group", label: "", field: "form-control", error: "" },
        },
        {
            "name": "name",
            "label": "User name",
            "valueKey": "name",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [{
                "type": "required",
                "params": ["User name is required!"]
            }],
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6 form-group", label: "", field: "form-control", error: "" },
        },
        {
            "name": "phone",
            "label": "Phone Number",
            "valueKey": "phone",
            "value": "",
            "type": "phone",
            "validationType": "string",
            "validations": [],
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
            "isEditable": true
        },
        {
            "name": "designation",
            "label": "User Group",
            "valueKey": "designation",
            "value": "",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "classes": { wrapper: "col-12 col-md-6 d-none", label: "", field: "", error: "" },
            "isEditable": false,
            "options": [],
            "pluginConfiguration": {
                "isMulti": true,
                "isClearable": false
            },
        },
        {
            "name": "role",
            "label": "User Role",
            "valueKey": "role",
            "value": [roleData.find(i => i.label === "user")] || [],
            "type": "select",
            "validationType": "array",
            "validations": [{
                "type": "required",
                "params": ["Userrole is required!"]
            }],
            "classes": { wrapper: "col-12 col-md-6 d-none", label: "", field: "", error: "" },
            "isEditable": false,
            "options": roleData,
            "pluginConfiguration": {}
        },
        {
            "name": "facilityId",
            "label": "Facility",
            "valueKey": "facilityId",
            "value": "",
            "placeholder": "Facility",
            "type": "select",
            "validationType": "array",
            "validations": [{
                "type": "required",
                "params": ["Facility is required!"]
            }],
            "isEditable": true,
            "optionKey": {
                "url": base.URL + '/facility/list',
                "payload": {
                    "keys": ["name"],
                    "value": "",
                    "options": {
                        "populate": ["facility:other"]
                    }
                },
                "method": "post",
                "labelField": "name",
                "valueField": "id"
            },
            "pluginConfiguration": {
                "isAsyncSelect": true,
                "isMulti": true,
                "isClearable": false,
            },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "speciality",
            "label": "Speciality",
            "valueKey": "speciality",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [],
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "form-control", error: "" },
            "isEditable": true
        },
        {
            "name": "faxNumber",
            "label": "Fax Number",
            "valueKey": "faxNumber",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [],
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "form-control", error: "" },
            "isEditable": true
        },


    ]
    return userData;
}
export default getOutsideProviderForm;