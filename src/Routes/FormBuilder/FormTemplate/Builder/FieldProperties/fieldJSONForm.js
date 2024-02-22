const conditionalOptions = [
    { value: "true", label: "True" },
    { value: "false", label: "False" },
];

const Imageoptions = [
    { label: "Static Image", value: "static" },
    // { label: "Image Upload", value: "static", disabled: true },
]
export const getJsonForm = ({ type, data, nodesOption, output }) => {
    const conditionalOpt = conditionalOptions.find(i => i.value === data?.conditional?.show);
    const conditionalWhen = nodesOption.find(i => i.value === data?.conditional?.when);
    let jsonObj = [
        {
            "name": "name",
            "label": "Name of the field",
            "valueKey": "name",
            "value": data.name || "",
            "type": "text",
            "validationType": "string",
            "validations": [{
                "type": "required",
                "params": ["Field name is required!"]
            }],
            "isEditable": true,
        },
    ];
    switch (type) {
        case "LabelNode":
            jsonObj = [
                ...jsonObj,
                // {
                //     "name": "value",
                //     "label": "Title",
                //     "valueKey": "value",
                //     "value": data.value || "",
                //     "type": "text",
                //     "validationType": "string",
                //     "validations": [{
                //         "type": "required",
                //         "params": ["Please Enter Label"],
                //     }],
                //     "isEditable": true,
                // },
                {
                    "name": "value",
                    "label": "Title",
                    "value": data?.value || [],
                    "valueKey": "value",
                    "placeholder": "Type label name here",
                    "type": "editor",
                    "validationType": "string",
                    "validations": [{
                        "type": "required",
                        "params": ["Please Enter Label"],
                    }],
                    "isEditable": true,
                },
                {
                    label: "",
                    name: "onlyOutput",
                    value: data?.onlyOutput || [],
                    valueKey: "onlyOutput",
                    type: "checkbox",
                    defaultValue: [{ value: "true", label: "Visible only in output" }],
                    optionKey: {
                        url: "",
                        method: "",
                    },
                    options: [{ value: "true", label: "Visible only in output" }],
                    isEditable: true,
                    validationType: "array",
                    validations: [],
                }
            ];
            break;
        case "TextFieldNode":
            jsonObj = [
                ...jsonObj,
                {
                    "name": "label",
                    "label": "Field label",
                    "valueKey": "label",
                    "value": data.label || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "placeholder",
                    "label": "Placeholder",
                    "valueKey": "placeholder",
                    "value": data.placeholder || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "description",
                    "label": "Description",
                    "valueKey": "description",
                    "value": data.description || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "prefix",
                    "label": "Prefix",
                    "valueKey": "prefix",
                    "value": data.prefix || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "suffix",
                    "label": "Suffix",
                    "valueKey": "suffix",
                    "value": data.suffix || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "defaultValue",
                    "label": "Default value",
                    "valueKey": "defaultValue",
                    "value": data.defaultValue || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "autoComplete",
                    "label": "Auto Complete",
                    "valueKey": "autoComplete",
                    "value": data.autoComplete || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    label: "",
                    name: "autoFocus",
                    value: data?.autoFocus || [],
                    valueKey: "autoFocus",
                    type: "checkbox",
                    optionKey: {
                        url: "",
                        method: "",
                    },
                    options: [{ value: "true", label: "Auto Focus" }],
                    isEditable: true,
                    validationType: "array",
                    validations: [],
                },
                {
                    label: "",
                    name: "isEditable",
                    value: data?.isEditable || [],
                    valueKey: "isEditable",
                    type: "checkbox",
                    optionKey: {
                        url: "",
                        method: "",
                    },
                    options: [{ value: "false", label: "Disable this field" }],
                    isEditable: true,
                    validationType: "array",
                    validations: [],
                },
            ];
            break;
        case "TextAreaNode":
            jsonObj = [
                ...jsonObj,
                {
                    "name": "label",
                    "label": "Field label",
                    "valueKey": "label",
                    "value": data.label || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "placeholder",
                    "label": "Placeholder",
                    "valueKey": "placeholder",
                    "value": data.placeholder || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "rows",
                    "label": "Rows",
                    "valueKey": "rows",
                    "value": data.rows || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "description",
                    "label": "Description",
                    "valueKey": "description",
                    "value": data.description || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "defaultValue",
                    "label": "Default value",
                    "valueKey": "defaultValue",
                    "value": data.defaultValue || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "autoComplete",
                    "label": "Auto Complete",
                    "valueKey": "autoComplete",
                    "value": data.autoComplete || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    label: "",
                    name: "autoFocus",
                    value: data?.autoFocus || [],
                    valueKey: "autoFocus",
                    type: "checkbox",
                    optionKey: {
                        url: "",
                        method: "",
                    },
                    options: [{ value: "true", label: "Auto Focus" }],
                    isEditable: true,
                    validationType: "array",
                    validations: [],
                },
                {
                    label: "",
                    name: "isEditable",
                    value: data?.isEditable || [],
                    valueKey: "isEditable",
                    type: "checkbox",
                    optionKey: {
                        url: "",
                        method: "",
                    },
                    options: [{ value: "false", label: "Disable this field" }],
                    isEditable: true,
                    validationType: "array",
                    validations: [],
                },
            ];
            break;
        case "CheckBoxNode":
            jsonObj = [
                ...jsonObj,
                {
                    "name": "label",
                    "label": "Checkbox label",
                    "valueKey": "label",
                    "value": data.label || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "defaultValue",
                    "label": "Default value",
                    "valueKey": "defaultValue",
                    "value": data.defaultValue || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    label: "",
                    name: "isEditable",
                    value: data?.isEditable || [],
                    valueKey: "isEditable",
                    type: "checkbox",
                    optionKey: {
                        url: "",
                        method: "",
                    },
                    options: [{ value: "false", label: "Disable this field" }],
                    isEditable: true,
                    validationType: "array",
                    validations: [],
                },
            ];
            break;
        case "NumberNode":
            jsonObj = [
                ...jsonObj,
                {
                    "name": "title",
                    "label": "Form Title",
                    "valueKey": "title",
                    // "value": formData.title,
                    "value": "",
                    "defaultValue": "formData.title",
                    "type": "text",
                    "validationType": "string",
                    "validations": [{
                        "type": "required",
                        "params": ["Please Enter Form Title"]
                    }],
                    "isEditable": true
                }
            ];
            break;
        case "ButtonNode":
            jsonObj = [
                ...jsonObj,
                {
                    "name": "text",
                    "label": "Button text",
                    "valueKey": "text",
                    "value": data.text || "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    label: "Type",
                    name: "type",
                    value: data.type || [],
                    valueKey: "type",
                    type: "select",
                    isEditable: true,
                    optionKey: { url: "", method: "", payload: {} },
                    options: [
                        { value: "primary", label: "Primary" },
                        { value: "secondary", label: "Secondary" },
                        { value: "success", label: "Success" },
                        { value: "warning", label: "Warning" },
                        { value: "danger", label: "Danger" },
                        { value: "info", label: "Info" },
                        { value: "light", label: "Light" },
                        { value: "dark", label: "Dark" },
                    ],
                    validationType: "array",
                    validations: [],
                },
            ];
            break;
        case "PasswordNode":
            jsonObj = [
                ...jsonObj,
                {
                    "name": "title",
                    "label": "Form Title",
                    "valueKey": "title",
                    // "value": formData.title,
                    "value": "",
                    "defaultValue": "formData.title",
                    "type": "text",
                    "validationType": "string",
                    "validations": [{
                        "type": "required",
                        "params": ["Please Enter Form Title"]
                    }],
                    "isEditable": true
                }
            ];
            break;
        case "RadioNode":
            jsonObj = [
                ...jsonObj,
                {
                    "name": "label",
                    "label": "Radio label",
                    "valueKey": "label",
                    "value": data.label || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "defaultValue",
                    "label": "Default value",
                    "valueKey": "defaultValue",
                    "value": data.defaultValue || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    label: "",
                    name: "isEditable",
                    value: data?.isEditable || [],
                    valueKey: "isEditable",
                    type: "checkbox",
                    optionKey: {
                        url: "",
                        method: "",
                    },
                    options: [{ value: "false", label: "Disable this field" }],
                    isEditable: true,
                    validationType: "array",
                    validations: [],
                },
            ];
            break;
        case "SelectNode":
            jsonObj = [
                ...jsonObj,
                {
                    "name": "label",
                    "label": "Select Label",
                    "valueKey": "label",
                    // "value": formData.title,
                    "value": data.label || "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "description",
                    "label": "Description",
                    "valueKey": "description",
                    "value": data.description || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
            ];
            break;
        case "DateTimeNode":
            jsonObj = [
                ...jsonObj,
                {
                    "name": "label",
                    "label": "Date Label",
                    "valueKey": "label",
                    "value": data.label || "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "placeholder",
                    "label": "Placeholder",
                    "valueKey": "placeholder",
                    "value": data.placeholder || "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    label: "",
                    name: "isClearable",
                    value: data?.isClearable || [],
                    valueKey: "isClearable",
                    type: "checkbox",
                    optionKey: {
                        url: "",
                        method: "",
                    },
                    options: [{ value: "true", label: "isClearable" }],
                    isEditable: true,
                    validationType: "array",
                    validations: [],
                },
                {
                    label: "",
                    name: "showTime",
                    value: data?.showTime || [],
                    valueKey: "showTime",
                    type: "checkbox",
                    optionKey: {
                        url: "",
                        method: "",
                    },
                    options: [{ value: "true", label: "Show Time" }],
                    isEditable: true,
                    validationType: "array",
                    validations: [],
                },
            ];
            break;
        case "SignatureNode":
            jsonObj = [
                ...jsonObj,
                {
                    "name": "label",
                    "label": "Signature Label",
                    "valueKey": "label",
                    "value": data.label || "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    "name": "description",
                    "label": "Description",
                    "valueKey": "description",
                    "value": data.description || "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
            ];
            break;
        case "ImageNode":
            jsonObj = [
                ...jsonObj,
                {
                    "name": "label",
                    "label": "Field label",
                    "valueKey": "label",
                    "value": data.label || "",
                    "defaultValue": "",
                    "type": "text",
                    "validationType": "string",
                    "validations": [],
                    "isEditable": true
                },
                {
                    label: "Upload method:",
                    name: "method",
                    valueKey: "method",
                    value: data.method ? [Imageoptions.find(i => i.value === data.method)] : [],
                    type: "select",
                    isEditable: true,
                    optionKey: { url: "", method: "", payload: {} },
                    options: Imageoptions,
                    validationType: "array",
                    defaultValue: [Imageoptions[0]],
                    validations: [],
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
            ];
            break;
        default:
    }
    if (!output)
        jsonObj = [
            ...jsonObj,
            {
                label: "This component should Display:",
                name: "show",
                value: (conditionalOpt && [conditionalOpt]) || [],
                valueKey: "show",
                placeholder: "Condition",
                type: "select",
                isEditable: true,
                pluginConfiguration: {
                    isClearable: true,
                },
                optionKey: { url: "", method: "", payload: {} },
                options: conditionalOptions,
                validationType: "array",
                validations: [],
            },
            {
                label: "When the form component:",
                name: "when",
                valueKey: "when",
                value: (conditionalWhen && [conditionalWhen]) || [],
                placeholder: "form field",
                type: "select",
                isEditable: true,
                pluginConfiguration: {
                    isClearable: true,
                },
                optionKey: { url: "", method: "", payload: {} },
                options: nodesOption || [],
                validationType: "array",
                validations: [],
            },
            {
                "label": "Has the value:",
                "name": "eq",
                "valueKey": "eq",
                "value": data?.conditional?.eq || "",
                "type": "text",
                "validationType": "string",
                "validations": [],
                "isEditable": true,
            }
        ];
    if (["TextFieldNode", "TextAreaNode"].includes(type)) {
        jsonObj = [
            ...jsonObj,
            {
                "label": "Calculated:",
                "name": "calculated",
                "valueKey": "calculated",
                "value": data?.calculated || "",
                "placeholder": "If Calculated, Enter 'field1 + field2'",
                "type": "text",
                "note": "For example: A = field1 + field2",
                "validationType": "string",
                "validations": [],
                "isEditable": true,
            },
        ]
    }
    return jsonObj
}