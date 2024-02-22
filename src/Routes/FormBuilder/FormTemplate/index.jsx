import React, { useCallback, useState } from 'react'
import { TakeConfirmation } from 'Components/components';
import Actions from './Actions';
import { Button } from 'react-bootstrap';
import { toastPromise } from 'redux/common';
import Builder from './Builder';
import Renderer from './Renderer';
import useDebounce from 'services/hooks/useDebounce';
import { useDebounce as useReactDebounce } from 'react-use';
import { showSuccess } from 'utils/package_config/toast';
import templateTabService from 'services/APIs/services/templateTabService';
import FormAssigned from './FormAssigned';
import 'reactflow/dist/style.css';
import 'styles/react-flow_canvas.css';
import '@reactflow/node-resizer/dist/style.css';
import FormOutput from './FormOutput';

export default function FormTemplate({ state, setState, jsonSchema, setSchema, fetchingForm }) {
    const [templateState, setTemplateState] = useState({
        isRemoving: false,
        isUpdating: false,
        formTitle: state.tabData?.formData?.title || "",
        action: 'edit',
    });

    const updateForm = useCallback(async ({ formTitle, jsonSchema, formId, toast = true }) => {
        let payload = { id: formId, title: formTitle }
        const stringyfiedForm = JSON.stringify(jsonSchema);
        if (stringyfiedForm) payload.components = stringyfiedForm
        const doUpdate = async () => {
            setTemplateState(prev => ({ ...prev, isUpdating: true }));
            const data = await templateTabService.update({ payload });
            setState(prev => ({
                ...prev,
                tabData: {
                    ...prev.tabData,
                    forms: prev.tabData.forms.map((item) => {
                        if (item.id === formId) return { ...item, ...data.data };
                        return item;
                    }),
                    formData: { ...prev.tabData.formData, ...data.data }
                },
            }));
            setTemplateState(prev => ({ ...prev, isUpdating: false }));
        }
        if (!toast)
            await doUpdate()
        else {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        await doUpdate();
                        resolve();
                    } catch (error) {
                        console.error(error);
                        reject();
                    }
                }, loading: "Updating form data", success: "Form data updated", error: "Couldn't update form data",
                options: { id: "form-template" }
            })
        }
    }, [setState]);
    const formTitle = useDebounce(templateState.formTitle, 500);
    useReactDebounce(
        () => {
            updateForm({
                jsonSchema,
                formTitle,
                formId: state.tabData?.formData?.id,
                toast: false
            })
        },
        1.5 * 1000,
        [jsonSchema, formTitle]);

    const onRemoveTemplate = useCallback(async () => {
        TakeConfirmation({
            title: 'Are you sure to remove the template form?',
            onDone: async () => {
                setTemplateState(prev => ({ ...prev, isRemoving: true }));
                const data = await templateTabService.delete({ payload: { id: state.tabData.formData.id } });
                setState(prev => ({
                    ...prev,
                    tabData: {
                        ...prev.tabData,
                        forms: prev.tabData.forms.filter(i => i.id !== Number(data.data)),
                        formData: null
                    },
                }));
                setTemplateState(prev => ({ ...prev, isRemoving: false }));
                showSuccess("Template form removed");
            }
        });
    }, [state.tabData.formData.id, setState]);

    return (<>
        <div className="form-inputs text-color">
            <div className="d-flex mb-2 justify-content-end">
                <div className='flex-column'>
                    <div className='d-flex gap-10'>
                        <input type="text" className="form-control" placeholder="Form title" defaultValue={state.tabData?.formData?.title || ""}
                            onChange={e => setTemplateState(prev => ({ ...prev, formTitle: e.target.value }))} />
                        <Button variant='success'
                            onClick={() => updateForm({
                                jsonSchema,
                                formTitle,
                                formId: state.tabData?.formData?.id
                            })}
                            disabled={templateState.isUpdating}>
                            {templateState.isUpdating ? "Updating" : "Save"}
                        </Button>
                        <Button variant='secondary' onClick={onRemoveTemplate}>Delete</Button>
                    </div>
                    {/* <div className='text-right mt-1'>
                        {templateState.lastSaved ? `Saved ${templateState.lastSaved}` : ""}
                    </div> */}
                </div>
            </div>
            <Actions templateState={templateState} setTemplateState={setTemplateState} />
            <div className="mb-3" />
            {templateState.action === 'edit' &&
                <Builder
                    key={state.tabData?.formData?.id}
                    formId={state.tabData?.formData?.id}
                    templateState={templateState}
                    setMainState={setState}
                    state={state}
                    setState={setState}
                    formTitle={formTitle}
                    jsonSchema={jsonSchema}
                    setSchema={setSchema}
                    fetchingForm={fetchingForm}
                />}
            {templateState.action === 'use' &&
                <Renderer
                    key={state.tabData?.formData?.id}
                    templateState={templateState}
                    setMainState={setState}
                    state={state}
                    jsonSchema={jsonSchema}
                    fetchingForm={fetchingForm}
                />}
            {templateState.action === 'assigned' &&
                <FormAssigned
                    formData={state.tabData?.formData}
                />}
            {templateState.action === 'output' &&
                <FormOutput
                    key={state.tabData?.formData?.id}
                    templateState={templateState}
                    setMainState={setState}
                    state={state}
                    jsonSchema={jsonSchema}
                    setSchema={setSchema}
                    fetchingForm={fetchingForm}
                />}
        </div>
    </>)
}