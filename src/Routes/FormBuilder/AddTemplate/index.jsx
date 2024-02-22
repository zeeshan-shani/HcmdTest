import React, { useMemo } from 'react';
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
import ModalReactstrap from 'Components/Modals/Modal';

export default function AddTemplate({ state, closeModals, mode = 'create', onSubmit, groups }) {
    const { updateTab } = state;

    let taskJSONForm = useMemo(() => {
        const groupList = !!groups?.length && groups.map(item => ({ id: item.id, label: item.title, value: item.id }));
        const formData = getTemplateForm(groupList);
        return formData.map((item) => {
            if (updateTab) {
                if (item.name === 'groupTitle') {
                    const group = groups.find(i => i.id === updateTab.parentTabId);
                    item.value = [{ id: group.id, label: group.title, value: group.id }];
                }
                if (updateTab.hasOwnProperty(item.name)) item.value = updateTab[item.name];
            }
            return item;
        })
    }, [updateTab, groups]);

    return (
        <ModalReactstrap
            show={state.addNewTemplate}
            header={updateTab ? 'Edit Tab' : 'Add New Tab'}
            toggle={closeModals}
            body={<>
                {state.addNewTemplate &&
                    <FormGenerator
                        className="m-0"
                        formClassName={"row"}
                        dataFields={taskJSONForm}
                        resetOnSubmit={false}
                        onSubmit={onSubmit}
                    />}
            </>}
        />
    )
}

const getTemplateForm = (groupList) => {
    return [
        {
            "name": "groupTitle",
            "label": "Select Group",
            "valueKey": "groupTitle",
            "value": "",
            "type": "select",
            "validationType": "array",
            "validations": [{
                "type": "required",
                "params": ["Group name is Required!"]
            }],
            "isEditable": true,
            "options": !!groupList?.length ? groupList : [],
            "pluginConfiguration": {
                "isCreatable": true,
                // "isClearable": true
            },
            "classes": { wrapper: "col-12", label: "", field: "form-control", error: "" },
        },
        {
            "name": "title",
            "label": "Tab title",
            "valueKey": "title",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [{ "type": "required", "params": ["Title is Required!"] }],
            "isEditable": true,
            "classes": { wrapper: "col-12", label: "", field: "form-control", error: "" },
        },
    ]
}