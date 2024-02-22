const getForm = () => {
    return [
        {
            "name": "preferredHospital",
            "label": "Preferred Hospital",
            "valueKey": "preferredHospital",
            "value": "",
            "placeholder": "Select right location",
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
            "name": "coach",
            "label": "Coach",
            "valueKey": "coach",
            "value": "",
            "placeholder": "Select coach",
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
            "name": "preferredHomeHealth",
            "label": "Preferred Home Health",
            "valueKey": "preferredHomeHealth",
            "value": "",
            "placeholder": "Select coach",
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
            "name": "locationOfVisit",
            "label": "Location of Visit",
            "valueKey": "locationOfVisit",
            "value": "",
            "placeholder": "Select right location",
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
            "name": "preferredNursingHome",
            "label": "Preferred Nursing Home",
            "valueKey": "preferredNursingHome",
            "value": "",
            "placeholder": "Select right location",
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
            "name": "locationOfPreviousVisit",
            "label": "Location Of Previous Visit",
            "valueKey": "locationOfPreviousVisit",
            "value": "",
            "placeholder": "Select right location",
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
            "name": "preferredDMEProvider",
            "label": "Preferred DME Provider",
            "valueKey": "preferredDMEProvider",
            "value": "",
            "placeholder": "Select right provider",
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
            "name": "changeOfLocationWithDates",
            "label": "Change Of Location With Dates",
            "valueKey": "changeOfLocationWithDates",
            "value": "",
            "placeholder": "Change of location with dates",
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
            "name": "preferredPharmacy",
            "label": "Preferred Pharmacy",
            "valueKey": "preferredPharmacy",
            "value": "",
            "placeholder": "Select most suitable pharmacy",
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
            "name": "previousHospitalOfAdmissionWithdates",
            "label": "Previous Hospital Of Admission With dates",
            "valueKey": "previousHospitalOfAdmissionWithdates",
            "value": "",
            "placeholder": "Describe the previous data of patient",
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
            "name": "PreviousNursingHomesofadmissionwithdates",
            "label": "Previous Nursing Homes of admission with dates",
            "valueKey": "PreviousNursingHomesofadmissionwithdaes",
            "value": "",
            "placeholder": "Describe the previous data of patient",
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
            "name": "trackofPatientLocation",
            "label": "Track every location change when patient goes from home to Hospital to nursing home to assisted living (and any of the above in anyorder) with timeline",
            "valueKey": "trackofPatientLocation",
            "value": "",
            "placeholder": "Track of Patient Location",
            "type": "textarea",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": { "rows": 3 },
            "classes": { wrapper: "col-12", label: "", field: "", error: "" }
        }
    ]
}
export default getForm;