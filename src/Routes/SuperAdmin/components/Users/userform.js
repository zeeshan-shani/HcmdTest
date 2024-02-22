import { CONST } from 'utils/constants';
import * as Yup from 'yup';
const getUserFormdata = ({ roleData = [], isProvider = false, providerValue = CONST.PROVIDER_TYPE.HCMD_PROVIDER, companyRoles = [] }) => {

    const providerData = [
        // {
        //     "name": "facilityId",
        //     "label": "Facility",
        //     "valueKey": "facilityId",
        //     "value": "",
        //     "placeholder": "Facility",
        //     "type": "select",
        //     "validationType": "array",
        //     "validations": [],
        //     "isEditable": true,
        //     "optionKey": {
        //         "url": base.URL + '/facility/list',
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
        //         "isMulti": true,
        //         "isClearable": true,
        //     },
        //     "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        // },
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

    const passwords = [
        {
            "name": "password",
            "label": "Password",
            "valueKey": "password",
            "value": "",
            "type": "password",
            "validationType": "string",
            "validations": [
                {
                    "type": "required",
                    "params": ["Password is required!"]
                },
                { "type": "min", "params": [8, "Password length should be at least 8 characters"] },
                // { "type": "max", "params": [50, "Password length cannot exceed more than 50 characters"] },
            ],
            "classes": { wrapper: "col-12 col-md-6 form-group", label: "", field: "form-control", error: "" },
            "isEditable": true,
            "autoComplete": "new-password",
            "pluginConfiguration": {
                "viewable": true
            }
        },
        {
            "name": "confirmPassword",
            "label": "Confirm Password",
            "valueKey": "confirmPassword",
            "value": "",
            "type": "password",
            "validationType": "string",
            "validations": [
                {
                    "type": "required",
                    "params": ["Confirm Password is required!"]
                },
                {
                    "type": "oneOf",
                    "params": [[Yup.ref("password")], "Confirm Passwords does not match"]
                },
            ],
            "classes": { wrapper: "col-12 col-md-6 form-group", label: "", field: "form-control", error: "" },
            "isEditable": true,
            "autoComplete": "new-password",
            "pluginConfiguration": {
                "viewable": true
            }
        },
    ]

    const roleDataFields = [
        {
            "name": "role",
            "label": "User Role",
            "valueKey": "role",
            "value": roleData[0],
            "type": "select",
            "validationType": "array",
            "validations": [{
                "type": "required",
                "params": ["Userrole is required!"]
            }],
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
            "isEditable": !isProvider,
            "options": roleData,
            "pluginConfiguration": {}
        },
        {
            "name": "mainDesignation",
            "label": "Company Role",
            "valueKey": "mainDesignation",
            "value": "",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "classes": { wrapper: "col-12 col-md-6 form-group", label: "", field: "", error: "" },
            "isEditable": true,
            "options": companyRoles || [],
            "pluginConfiguration": {
                "isCreatable": true,
                "isClearable": true
            },
        },
        {
            "name": "designation",
            "label": "User Group",
            "valueKey": "designation",
            "value": "",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
            "isEditable": true,
            "options": [],
            "pluginConfiguration": {
                "isMulti": true,
                "isClearable": true
            },
        },
        {
            "name": "keywords",
            "label": "Keywords",
            "valueKey": "keywords",
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
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
        },
    ]

    const userData = [
        {
            "name": "email",
            "label": "Email",
            "valueKey": "email",
            "value": "",
            "type": "email",
            "validationType": "string",
            "isEditable": true,
            "validations": [{
                "type": "required",
                "params": ["Email Id is required!"]
            }],
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
            "name": "companyName",
            "label": "Company Name",
            "valueKey": "companyName",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [{ "type": "required", "params": ["Company Name is required!"] }],
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6 form-group", label: "", field: "form-control", error: "" },
        },
        {
            "name": "extension",
            "label": "Extension",
            "valueKey": "extension",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [],
            "classes": { wrapper: "col-12 col-md-6 form-group", label: "", field: "form-control", error: "" },
            "isEditable": true
        },
    ]
    const userInfo = [
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
            "name": "address",
            "label": "Address",
            "valueKey": "address",
            "value": "",
            "type": "textarea",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "classes": { wrapper: "col-12", label: "", field: "form-control", error: "" },
            "pluginConfiguration": { "rows": 2 }
        }
    ]
    if (isProvider) {
        return providerValue === CONST.PROVIDER_TYPE.HCMD_PROVIDER ?
            [...userData, ...providerData, ...userInfo, ...passwords, ...roleDataFields] :
            [...userData, ...userInfo, ...providerData]
    }
    return [...userData, ...userInfo, ...passwords, ...roleDataFields];
}
export default getUserFormdata;