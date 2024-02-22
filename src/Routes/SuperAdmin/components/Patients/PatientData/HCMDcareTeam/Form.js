const getForm = () => {
    return [
        {
            "name": "careCoordinatorOfPatient",
            "label": "Patient care coordinator of the patient",
            "valueKey": "careCoordinatorOfPatient",
            "value": "",
            "placeholder": "the patient care provider",
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
            "name": "patientConciergeOfthePatient",
            "label": "Patient concierge of the patient",
            "valueKey": "patientConciergeOfthePatient",
            "value": "",
            "placeholder": "the patient concierge",
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
            "name": "DSi",
            "label": "DSi",
            "valueKey": "DSi",
            "value": "",
            "placeholder": "DSi",
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
            "name": "triageSpecialist",
            "label": "Triage Specialist",
            "valueKey": "triageSpecialist",
            "value": "",
            "placeholder": "the triage specialist",
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
            "name": "hcmdPatientCoordinator",
            "label": "HCMD patient coordinator",
            "valueKey": "hcmdPatientCoordinator",
            "value": "",
            "placeholder": "the patient coordinator",
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
            "name": "hcmdBuilder",
            "label": "HCMD Builder",
            "valueKey": "hcmdBuilder",
            "value": "",
            "placeholder": "the right option",
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
            "name": "physicalTherapist",
            "label": "Physical Therapist",
            "valueKey": "physicalTherapist",
            "value": "",
            "placeholder": "the right option",
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
            "name": "occupationalTherapist",
            "label": "Occupational Therapist",
            "valueKey": "occupationalTherapist",
            "value": "",
            "placeholder": "the right option",
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
            "name": "speechTherapist",
            "label": "Speech Therapist",
            "valueKey": "speechTherapist",
            "value": "",
            "placeholder": "the right option",
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
            "name": "caseManagerOfRecord",
            "label": "Case manager of record",
            "valueKey": "caseManagerOfRecord",
            "value": "",
            "placeholder": "the record case manager",
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
            "name": "caseManagerOfHospital",
            "label": "Case manager of hospital",
            "valueKey": "caseManagerOfHospital",
            "value": "",
            "placeholder": "the hospital case manager",
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
            "name": "caseManagerOfNursingHome",
            "label": "Case manager of nursing home",
            "valueKey": "caseManagerOfNursingHome",
            "value": "",
            "placeholder": "nursing case manager",
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
            "name": "nurseOfRecordHCMD",
            "label": "Nurse of record for house call MD",
            "valueKey": "nurseOfRecordHCMD",
            "value": "",
            "placeholder": "the nurse",
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
            "name": "nurseOfRecordatHospital",
            "label": "Nurse of record at hospital",
            "valueKey": "nurseOfRecordatHospital",
            "value": "",
            "placeholder": "the nurse",
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
            "name": "nurseOfRecordForNursingHome",
            "label": "Nurse of record for nursing home",
            "valueKey": "nurseOfRecordForNursingHome",
            "value": "",
            "placeholder": "the nurse",
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