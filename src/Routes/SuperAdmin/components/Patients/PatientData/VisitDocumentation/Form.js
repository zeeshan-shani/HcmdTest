const getForm = () => {
    return [
        {
            "name": "DateOfFirstVisit",
            "label": "Date of first visit",
            "valueKey": "DateOfFirstVisit",
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
            "name": "VisitOrders",
            "label": "Capture visit orders on the application",
            "valueKey": "VisitOrders",
            "value": "",
            "placeholder": "Select the right data",
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
            "name": "DateOfRequestOfRecords",
            "label": "Date of request of records",
            "valueKey": "DateOfRequestOfRecords",
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
            "name": "VisitNotes",
            "label": "Capture visit notes on the application",
            "valueKey": "VisitNotes",
            "value": "",
            "placeholder": "Select the right data",
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
            "name": "DateOfConsent",
            "label": "Date of consent",
            "valueKey": "DateOfConsent",
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
            "name": "familyDiscussionPoints",
            "label": "Capture family meeting discussion points on the application",
            "valueKey": "familyDiscussionPoints",
            "value": "",
            "placeholder": "Select the right data",
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
            "name": "DateOfChangeofCodeStatus",
            "label": "Date of change of code status",
            "valueKey": "DateOfChangeofCodeStatus",
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
            "name": "transcriptionAssistant",
            "label": "Transcription assistant for each visit",
            "valueKey": "transcriptionAssistant",
            "value": "",
            "placeholder": "Select the assistant",
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
            "name": "personChangingTheCodeStatus",
            "label": "Person changing the code status",
            "valueKey": "personChangingTheCodeStatus",
            "value": "",
            "placeholder": "Select the person",
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
            "name": "providerOfRecordForEachVisit",
            "label": "Provider of record for each visit",
            "valueKey": "providerOfRecordForEachVisit",
            "value": "",
            "placeholder": "Select the provider",
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
            "name": "DateOfPalliativeConsult",
            "label": "Date of palliative consult (if any)",
            "valueKey": "DateOfPalliativeConsult",
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
            "name": "billingProvider",
            "label": "Billing provider for each visit",
            "valueKey": "billingProvider",
            "value": "",
            "placeholder": "Select the provider",
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
            "name": "palliativeConsult",
            "label": "Person who did the palliative consult",
            "valueKey": "palliativeConsult",
            "value": "",
            "placeholder": "Select the person",
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
            "name": "ConsentWithDateOfSignature",
            "label": "Consent with date of signature for each one",
            "valueKey": "ConsentWithDateOfSignature",
            "value": "",
            "placeholder": "Select the consent",
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
    ]
}
export default getForm;