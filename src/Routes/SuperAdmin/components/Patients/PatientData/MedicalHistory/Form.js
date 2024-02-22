const getForm = () => {
    return [
        {
            "name": "pastmedicalHistory",
            "label": "Past Medical History",
            "valueKey": "pastmedicalHistory",
            "value": "",
            "placeholder": "Mention history routes",
            "type": "textarea",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": { "rows": 3 },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "pastSurgicalHistory",
            "label": "Past Surgical History",
            "valueKey": "pastSurgicalHistory",
            "value": "",
            "placeholder": "Mention history routes",
            "type": "textarea",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": { "rows": 3 },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "smokingHistory",
            "label": "Smoking History",
            "valueKey": "smokingHistory",
            "value": "",
            "placeholder": "Mention history routes",
            "type": "textarea",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": { "rows": 3 },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "alcoholHistory",
            "label": "Alcohol History",
            "valueKey": "alcoholHistory",
            "value": "",
            "placeholder": "Mention history routes",
            "type": "textarea",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": { "rows": 3 },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "drugHistory",
            "label": "Drug History",
            "valueKey": "drugHistory",
            "value": "",
            "placeholder": "Mention history routes",
            "type": "textarea",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": { "rows": 2 },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "allergies",
            "label": "Allergies",
            "valueKey": "allergies",
            "value": "",
            "placeholder": "Select",
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
            "name": "diagnosisCodes",
            "label": "Diagnosis Codes for admission to hospital and nursing home",
            "valueKey": "diagnosisCodes",
            "value": "",
            "placeholder": "Select",
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
            "name": "diagnosisOfPatient",
            "label": "Capture each diagnosis of the patient and connect ones that are connectable",
            "valueKey": "diagnosisOfPatient",
            "value": "",
            "placeholder": "Mention relavant information",
            "type": "textarea",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": { "rows": 3 },
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "confirmDateOfConnection",
            "label": "Click and Confirm date of connection",
            "valueKey": "confirmDateOfConnection",
            "value": "",
            "type": "date",
            "placeholder": "Select the right date",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
            "pluginConfiguration": {
                "isDateRange": false
            }
        },
        {
            "name": "templatePlanforEachDiagnosis",
            "label": "Treatment plan for each diagnosis",
            "valueKey": "templatePlanforEachDiagnosis",
            "value": "",
            "placeholder": "Describe the plans",
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
            "name": "subjectiveAssessment",
            "label": "Subjective assessment for each diagnosis",
            "valueKey": "subjectiveAssessment",
            "value": "",
            "placeholder": "Describe the plans",
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