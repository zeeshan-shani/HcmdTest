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
        // {
        //     "name": "nextOfKin",
        //     "label": "Next of Kin",
        //     "valueKey": "nextOfKin",
        //     "value": "",
        //     "placeholder": "Select the kin",
        //     "type": "select",
        //     "validationType": "array",
        //     "validations": [],
        //     "isEditable": true,
        //     "pluginConfiguration": {
        //         "isAsyncSelect": true,
        //         "isClearable": true,
        //     },
        //     "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        // },
        {
            "name": "AddressOfRecordAndInsurance",
            "label": "Address of record and insurance",
            "valueKey": "AddressOfRecordAndInsurance",
            "value": "",
            "type": "textarea",
            "isEditable": true,
            "validationType": "string",
            "validations": [],
            "pluginConfiguration": { rows: 2 },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "powerofAttorney",
            "label": "Power of attorney",
            "valueKey": "powerofAttorney",
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
            "name": "DateOfInitialHCMDandContactingStaff",
            "label": "Date of initial HCMD and contacting staff",
            "valueKey": "DateOfInitialHCMDandContactingStaff",
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
            "name": "lawyer",
            "label": "Lawyer",
            "valueKey": "lawyer",
            "value": "",
            "placeholder": "Select lawyer",
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
            "name": "physicianphone",
            "label": "Primary care physician and contact",
            "valueKey": "physicianphone",
            "value": "",
            "type": "phone",
            "validationType": "string",
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
            "isEditable": true
        },
        {
            "name": "firstPersonPatientSpokeTo",
            "label": "Who was the first person patient spoke to?",
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
            "name": "consultingphone",
            "label": "All consulting physicians and contacts",
            "valueKey": "consultingphone",
            "value": "",
            "type": "phone",
            "validationType": "string",
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
            "isEditable": true
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
            "name": "responsibleParty",
            "label": "Responsible Party",
            "valueKey": "responsibleParty",
            "value": "",
            "placeholder": "Select layer",
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
            "name": "phone",
            "label": "Family contact",
            "valueKey": "phone",
            "value": "",
            "type": "phone",
            "validationType": "string",
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
            "isEditable": true
        },
        {
            "name": "visitConfirmationContact",
            "label": "Contact for visit confirmations",
            "valueKey": "visitConfirmationContact",
            "value": "",
            "type": "phone",
            "validationType": "string",
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
            "isEditable": true
        },
    ]
}
export default getpatientForm;