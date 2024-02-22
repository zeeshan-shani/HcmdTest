
const getRelativeForm = () => [
    {
        "name": "name",
        "label": "Contact Name",
        "valueKey": "name",
        "value": "",
        "type": "text",
        "validationType": "string",
        "validations": [{
            "type": "required",
            "params": ["Relative name is required!"]
        }],
        "isEditable": true,
        "classes": { wrapper: "col-12", label: "", field: "form-control", error: "" },
    },
    {
        "name": "contactNumber",
        "label": "Contact number",
        "valueKey": "contactNumber",
        "value": "",
        "type": "text",
        "validationType": "string",
        "validations": [{
            "type": "required",
            "params": ["Relative number is required!"]
        }],
        "isEditable": true,
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "form-control", error: "" },
    },
    {
        "name": "priority",
        "label": "Priority",
        "valueKey": "priority",
        "value": "",
        "type": "text",
        "validationType": "string",
        "validations": [],
        "isEditable": true,
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "form-control", error: "" },
    },
    {
        "name": "relation",
        "label": "Relation",
        "valueKey": "relation",
        "value": "",
        "type": "text",
        "validationType": "string",
        "validations": [],
        "isEditable": true,
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "form-control", error: "" },
    },
    {
        "name": "typeOfNumber",
        "label": "Phone Type",
        "valueKey": "typeOfNumber",
        "value": "",
        "type": "text",
        "validationType": "string",
        "validations": [],
        "isEditable": true,
        "classes": { wrapper: "col-12 col-md-6", label: "", field: "form-control", error: "" },
    },
    {
        "name": "note",
        "label": "Notes",
        "valueKey": "note",
        "value": "",
        "type": "text",
        "validationType": "string",
        "validations": [],
        "isEditable": true,
        "classes": { wrapper: "col-12", label: "", field: "form-control", error: "" },
    }
]

export default getRelativeForm;