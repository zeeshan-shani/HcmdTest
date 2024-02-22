import React from 'react'
import { toastPromise } from 'redux/common';
import ModalReactstrap from 'Components/Modals/Modal';
import NewTemplate from './NewTemplate';
import taskTemplateService from 'services/APIs/services/taskTemplateService';
// import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';

// const templateForm = [
//     {
//         "name": "subject",
//         "label": "Subject",
//         "valueKey": "subject",
//         "value": "",
//         "type": "text",
//         "validationType": "string",
//         "validations": [
//             {
//                 "type": "required",
//                 "params": [
//                     "Please enter subject"
//                 ]
//             }
//         ],
//         "isEditable": true,
//         "classes": { wrapper: "col-12", label: "", field: "", error: "" },
//     },
//     {
//         "name": "description",
//         "label": "Task Description",
//         "valueKey": "description",
//         "value": "",
//         "type": "textarea",
//         "validationType": "string",
//         "validations": [
//             {
//                 "type": "required",
//                 "params": [
//                     "Please enter description of the task"
//                 ]
//             }
//         ],
//         "isEditable": true,
//         "pluginConfiguration": {
//             "rows": 3
//         },
//         "classes": { wrapper: "col-12", label: "", field: "", error: "" },
//     },
//     {
//         "name": "type",
//         "label": "Task type",
//         "valueKey": "type",
//         "value": "routine",
//         "type": "radio",
//         "validationType": "string",
//         "validations": [
//             {
//                 "type": "required",
//                 "params": [
//                     "Please Select type of the task"
//                 ]
//             }
//         ],
//         "isEditable": true,
//         "options": [
//             {
//                 "label": "Routine",
//                 "value": "routine"
//             },
//             {
//                 "label": "Urgent",
//                 "value": "urgent"
//             },
//             {
//                 "label": "Emergency",
//                 "value": "emergency"
//             }
//         ],
//         "classes": { wrapper: "col-12", label: "", field: "", error: "" },
//     },
//     // {
//     //     "name": "repeat",
//     //     "label": "Repeat",
//     //     "valueKey": "repeat",
//     //     "value": [{ "label": "None", "value": 0 }],
//     //     "type": "select",
//     //     "validationType": "array",
//     //     "validations": [],
//     //     "isEditable": true,
//     //     "options": [
//     //         { "label": "None", "value": 0 },
//     //         { "label": "Every Day", "value": 1 },
//     //         { "label": "Every Week", "value": 7 },
//     //         { "label": "Every Month", "value": 30 },
//     //         { "label": "Every Year", "value": 365 },
//     //         { "label": "Custom", "value": 'custom' },
//     //     ],
//     //     "pluginConfiguration": {},
//     //     "classes": { wrapper: "col-md-6", label: "", field: "", error: "" },
//     // },
//     // {
//     //     "name": "endDate",
//     //     "label": "End Date",
//     //     "valueKey": "endDate",
//     //     "value": "",
//     //     "type": "date",
//     //     "validationType": "string",
//     //     "validations": [
//     //         { "type": "nullable", "params": [] }
//     //     ],
//     //     "isEditable": true,
//     //     "pluginConfiguration": { "isDateRange": false, "isClearable": true },
//     //     "classes": { wrapper: "col-md-6", label: "", field: "", error: "" },
//     // },
//     // {
//     //     "name": "endRepeat",
//     //     "label": "End Repeat",
//     //     "valueKey": "endRepeat",
//     //     "value": "",
//     //     "type": "date",
//     //     "validationType": "string",
//     //     "validations": [
//     //         { "type": "nullable", "params": [] }
//     //     ],
//     //     "isEditable": true,
//     //     "pluginConfiguration": { "isDateRange": false, "isClearable": true },
//     //     "classes": { wrapper: "col-12", label: "", field: "", error: "" },
//     // }
// ];

export const AddTemplateTask = ({ showModal, onClose, getTemplateTaskList, activeChatId }) => {
    const addNewTask = async (newData) => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    const payload = { ...newData, type: newData.type, chatId: activeChatId }
                    const data = await taskTemplateService.create({ payload });
                    resolve(data);
                    getTemplateTaskList();
                    onClose();
                } catch (error) {
                    reject(error);
                }
            },
            loading: 'Creating new template task',
            success: 'Successfully created template',
            error: 'Could not create template',
            options: { id: "add-template-task" }
        });
    }
    return (<>
        <ModalReactstrap
            show={showModal} Modalprops={{ keyboard: false }}
            header={'New Template Task'}
            toggle={onClose}
            body={
                <NewTemplate onSubmit={addNewTask} onClose={onClose} />
                // <FormGenerator
                //     className='m-0'
                //     formClassName={'row'}
                //     dataFields={templateForm}
                //     onSubmit={(data) => addNewTask(data)}
                // />
            }
        />
    </>);
}
