const getOrganizationForm = () => {
    return [
        {
            "name": "name",
            "label": "Organization",
            "valueKey": "name",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [
                {
                    "type": "required",
                    "params": [
                        "Organization name is required!"
                    ]
                }
            ],
            "isEditable": true
        },
        {
            "name": "image",
            "label": "Image",
            "valueKey": "image",
            "value": "",
            "type": "file",
            "validationType": "array",
            "validations": [],
            "isEditable": true,
            "pluginConfiguration": {
                "imagePreview": true,
                "maxFiles": 1,
                "maxFileSize": 0,
                "acceptedFileTypes": ["image"]
            }
        },

    ]
}

export default getOrganizationForm;