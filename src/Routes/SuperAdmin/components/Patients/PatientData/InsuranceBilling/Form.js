const getForm = () => {
    return [
        {
            "name": "primaryInsurance",
            "label": "Primary Insurance",
            "valueKey": "primaryInsurance",
            "value": "",
            "type": "text",
            "placeholder": "Primary insurance details",
            "validationType": "string",
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "secondaryInsurance",
            "label": "Secondary Insurance",
            "valueKey": "secondaryInsurance",
            "value": "",
            "type": "text",
            "placeholder": "Secondary insurance details",
            "validationType": "string",
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "tertiaryInsurance",
            "label": "Tertiary Insurance",
            "valueKey": "tertiaryInsurance",
            "value": "",
            "type": "text",
            "placeholder": "Tertiary insurance details",
            "validationType": "string",
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "insuranceVisitBased",
            "label": "Insurance for each visit based on diagnosis and location",
            "valueKey": "insuranceVisitBased",
            "value": "",
            "type": "text",
            "placeholder": "Insurance details",
            "validationType": "string",
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
        {
            "name": "medicalEligibilityandStatus",
            "label": "Medical eligibility and status",
            "valueKey": "medicalEligibilityandStatus",
            "value": "",
            "type": "text",
            "placeholder": "Medical eligibility and status",
            "validationType": "string",
            "isEditable": true,
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" }
        },
    ]
}
export default getForm;