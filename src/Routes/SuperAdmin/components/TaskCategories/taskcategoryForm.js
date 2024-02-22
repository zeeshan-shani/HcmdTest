const taskcategoryForm = () => {
    return [
        {
            "name": "name",
            "label": "Category name",
            "valueKey": "name",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [{
                "type": "required",
                "params": ["Category name is required!"]
            }],
            "isEditable": true,
            "classes": { wrapper: "col-12", label: "", field: "", error: "" },
        }
    ]
}
export default taskcategoryForm;