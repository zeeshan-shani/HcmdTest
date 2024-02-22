import React, { useCallback, useMemo } from 'react'
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator'
import ModalReactstrap from 'Components/Modals/Modal'
import { toastPromise } from 'redux/common';
import templateTabService from 'services/APIs/services/templateTabService';

export default function NewFormModal({ state, setState, mode = "create", closeModals }) {

    let taskJSONForm = useMemo(() => {
        const formData = getFormJSON();
        return formData.map((item) => {
            if (state.updateForm && state.updateForm.hasOwnProperty(item.name))
                item.value = state.updateForm[item.name];
            return item;
        })
    }, [state.updateForm]);

    const onSubmit = useCallback(async (payload) => {
        if (state.tabData.id) payload.templateGroupId = state.tabData.id;
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    const data = await templateTabService.create({ payload });
                    if (data?.status === 1) {
                        setState(prev => ({
                            ...prev,
                            tabData: {
                                ...prev.tabData,
                                forms: [...prev.tabData.forms, data.data],
                                // formData: data.data
                            }
                        }))
                        closeModals();
                    }
                    resolve();
                } catch (error) {
                    console.error(error);
                    reject();
                }
            }, loading: "Creating form data", success: "Successfully created form", error: "Couldn't create form data",
            options: { id: "new-form" }
        })
    }, [closeModals, setState, state]);

    return (
        <ModalReactstrap
            show={state.addNewForm}
            toggle={closeModals}
            header={mode === 'update' ? "Edit Form" : "Create Form"}
            body={<>
                {state.addNewForm &&
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

const getFormJSON = () => {
    return [
        {
            "name": "title",
            "label": "Form title",
            "valueKey": "title",
            "value": "",
            "type": "text",
            "validationType": "string",
            "validations": [{
                "type": "required",
                "params": ["Form Title is Required!"]
            }],
            "isEditable": true,
            "classes": { wrapper: "col-12", label: "", field: "form-control", error: "" },
        },
    ]
}