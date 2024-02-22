const getpatientForm = () => {
    return [
        {
            "name": "addressOfVisit",
            "label": "Address of Visit",
            "valueKey": "addressOfVisit",
            "value": "",
            "placeholder": "Select location",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": {
                "isAsyncSelect": true,
                "isClearable": true,
            },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "addressOfRecordAndInsurance",
            "label": "Address of record and insurance",
            "valueKey": "addressOfRecordAndInsurance",
            "value": "",
            "placeholder": "Providers",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": {
                "isAsyncSelect": true,
                "isClearable": true,
            },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "dateOfInitialHCMDandContactingStaff",
            "label": "Date of initial HCMD and contacting staff",
            "valueKey": "dateOfInitialHCMDandContactingStaff",
            "value": "",
            "type": "date",
            "placeholder": "Select the date",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
            "pluginConfiguration": {
                "isDateRange": false
            }
        },
        {
            "name": "reference",
            "label": "Where the patient hear about us?",
            "valueKey": "reference",
            "value": "",
            "placeholder": "Select the right person",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": {
                "isAsyncSelect": true,
                "isClearable": true,
            },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "firstPersonPatientSpokeTo",
            "label": "Who was the first person patient spoke to?",
            "valueKey": "firstPersonPatientSpokeTo",
            "value": "",
            "placeholder": "Select the right person",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": {
                "isAsyncSelect": true,
                "isClearable": true,
            },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "patientEnrollBy",
            "label": "Person who enrolled the patient?",
            "valueKey": "patientEnrollBy",
            "value": "",
            "placeholder": "Select the right person",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": {
                "isAsyncSelect": true,
                "isClearable": true,
            },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "familyContact",
            "label": "Family contact",
            "valueKey": "familyContact",
            "value": "",
            "type": "phone",
            "validationType": "string",
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
            "isEditable": true
        }
    ]
}
export default getpatientForm;