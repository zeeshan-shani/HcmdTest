
const getNotesForm = () => {
    return [
        {
            "name": "note",
            "label": "Note",
            "valueKey": "note",
            "value": "",
            "type": "textarea",
            "validationType": "string",
            "validations": [{
                "type": "required",
                "params": ["Note is Required!"]
            }],
            "isEditable": true,
            "pluginConfiguration": { "rows": 3 },
            "classes": { wrapper: "col-12", label: "", field: "form-control vh-60", error: "" },
        },
    ]
}
export default getNotesForm;