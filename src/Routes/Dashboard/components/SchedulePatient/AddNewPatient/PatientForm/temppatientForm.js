// import { base } from "utils/config";

import { CONST } from "utils/constants";

export const patientForm = [
    // {
    //     "name": "firstName",
    //     "label": "FirstName",
    //     "valueKey": "firstName",
    //     "value": "",
    //     "placeholder": "FirstName",
    //     "type": "select",
    //     "validationType": "array",
    //     "validations": [],
    //     "isEditable": true,
    //     "optionKey": {
    //         "url": base.URL + '/patient/list',
    //         "payload": {
    //             "keys": ["name"],
    //             "value": ""
    //         },
    //         "method": "post",
    //         "labelField": "name",
    //         "valueField": "id"
    //     },
    //     "pluginConfiguration": {
    //         "isAsyncSelect": true,
    //         "isMulti": false,
    //         "isClearable": true,
    //     },
    //     "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
    // },
    {
        "name": "firstName",
        "label": "First Name",
        "valueKey": "firstName",
        "value": "",
        "type": "text",
        "validationType": "string",
        "isEditable": true,
        "validations": [
            {
                "type": "required",
                "params": ["First name is required!"]
            }
        ],
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
    },
    {
        "name": "lastName",
        "label": "Last Name",
        "valueKey": "lastName",
        "value": "",
        "type": "text",
        "validationType": "string",
        "isEditable": true,
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
    },
    {
        "name": "phone",
        "label": "Phone Number",
        "valueKey": "phone",
        "value": "",
        "type": "phone",
        "validationType": "string",
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        "isEditable": true
    },
    // {
    //     "name": "facility",
    //     "label": "Facility",
    //     "valueKey": "facility",
    //     "value": "",
    //     "type": "text",
    //     "validationType": "string",
    //     "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
    //     "isEditable": true
    // },
    {
        "name": "insurance",
        "label": "Insurance",
        "valueKey": "insurance",
        "value": "",
        "type": "text",
        "validationType": "string",
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        "isEditable": true
    },
    {
        "name": "SSN",
        "label": "SSN",
        "valueKey": "SSN",
        "value": "",
        "type": "text",
        "validationType": "string",
        "validations": [],
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        "isEditable": true
    },
    {
        "name": "DOB",
        "label": "DOB",
        "valueKey": "DOB",
        "value": "",
        "type": "date",
        "validationType": "string",
        "validations": [
            // {
            //     "type": "required",
            //     "params": ["DOB is required!"]
            // }
        ],
        "isEditable": true,
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        "pluginConfiguration": {
            "isDateRange": false
        }
    },
    {
        "name": "state",
        "label": "State",
        "valueKey": "state",
        "value": "",
        "type": "text",
        "validationType": "string",
        "validations": [],
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        "isEditable": true
    },
    {
        "name": "city",
        "label": "City",
        "valueKey": "city",
        "value": "",
        "type": "text",
        "validationType": "string",
        "validations": [],
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        "isEditable": true
    },
    {
        "name": "zip",
        "label": "Zip",
        "valueKey": "zip",
        "value": "",
        "type": "text",
        "validationType": "string",
        "validations": [],
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        "isEditable": true
    },
    {
        "name": "gender",
        "label": "Gender",
        "valueKey": "gender",
        "value": "",
        "type": "select",
        "validationType": "array",
        "validations": [
            // {
            //     "type": "required",
            //     "params": ["Gender is required!"]
            // }
        ],
        "isEditable": true,
        "options": CONST.GENDER_TYPE,
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        "pluginConfiguration": {}
    },
    {
        "name": "maritalStatus",
        "label": "Marital Status",
        "valueKey": "maritalStatus",
        "value": "",
        "type": "select",
        "validationType": "array",
        "validations": [
            // {
            //     "type": "required",
            //     "params": ["Marital Status is required!"]
            // }
        ],
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        "isEditable": true,
        "options": CONST.MARITAL_TYPE,
        "pluginConfiguration": {}
    },
    // {
    //     "name": "location",
    //     "label": "Location",
    //     "valueKey": "location",
    //     "value": "",
    //     "type": "text",
    //     "validationType": "string",
    //     "validations": [],
    //     "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
    //     "isEditable": true
    // },
    // {
    //     "name": "roomNumber",
    //     "label": "Room Number",
    //     "valueKey": "roomNumber",
    //     "value": "",
    //     "type": "text",
    //     "validationType": "string",
    //     "validations": [],
    //     "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
    //     "isEditable": true
    // },
    {
        "name": "medicalRecordNumber",
        "label": "Medical Record Number",
        "valueKey": "medicalRecordNumber",
        "value": "",
        "type": "text",
        "validationType": "string",
        "validations": [],
        "isEditable": true,
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
    }
]