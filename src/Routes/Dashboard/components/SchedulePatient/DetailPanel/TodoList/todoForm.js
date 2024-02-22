import { base } from "utils/config";
import { CONST } from "utils/constants";

export const priorityOptions = [
    { "label": "Routine", "value": CONST.MSG_TYPE.ROUTINE },
    { "label": "Urgent", "value": CONST.MSG_TYPE.URGENT },
    { "label": "Emergency", "value": CONST.MSG_TYPE.EMERGENCY }
]

const getTodoForm = () => {
    return [
        {
            "name": "title",
            "label": "Task",
            "valueKey": "title",
            "value": "",
            "type": "textarea",
            "validationType": "string",
            "validations": [{
                "type": "required",
                "params": ["Task is Required!"]
            }],
            "classes": { wrapper: "col-12", label: "", field: "form-control", error: "" },
            "autoFocus": true,
            "isEditable": true,
            "pluginConfiguration": { "rows": 2 }
        },

        {
            "name": "assigneeId",
            "label": "Assignee",
            "valueKey": "assigneeId",
            "value": "",
            "placeholder": "Select assignee",
            "type": "select",
            "validationType": "array",
            "validations": [],
            "isEditable": true,
            "optionKey": {
                "url": base.URL + '/user/list',
                "payload": {
                    "query": {
                        "isActive": true,
                    },
                    "options": {
                        "sort": [["name", "asc"]],
                        "populate": ["users:own"],
                    },
                    "keys": ["name", "firstName", "lastName"],
                    "value": ""
                },
                "method": "post",
                "labelField": "name",
                "valueField": "id"
            },
            "pluginConfiguration": {
                "isAsyncSelect": true,
                "isClearable": true,
                "defaultOptions": true
            },
            "classes": { wrapper: "col-12", label: "", field: "", error: "" },
        },
        {
            "name": "dueDate",
            "label": "Due Date",
            "valueKey": "dueDate",
            "value": "",
            "type": "date",
            "validationType": "string",
            "validations": [],
            "isEditable": true,
            "classes": { wrapper: "col-md-6 col-12", label: "", field: "form-control", error: "" },
            "pluginConfiguration": { "isDateRange": false }
        },
        {
            "name": "priority",
            "label": "Priority",
            "valueKey": "priority",
            "value": [priorityOptions[0]],
            "type": "select",
            "validationType": "array",
            "validations": [],
            "isEditable": true,
            "options": priorityOptions,
            "classes": { wrapper: "col-12 col-md-6", label: "", field: "", error: "" },
            "pluginConfiguration": {}
        },
        // {
        //     "name": "repeat",
        //     "label": "Repeatative",
        //     "valueKey": "repeat",
        //     "value": "",
        //     "type": "text",
        //     "validationType": "string",
        //     "validations": [],
        //     "classes": { wrapper: "col-12 col-md-6", label: "", field: "form-control", error: "" },
        //     "isEditable": false,
        // },
    ]
}
export default getTodoForm;