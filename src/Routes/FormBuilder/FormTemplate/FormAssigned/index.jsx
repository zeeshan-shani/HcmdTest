import React, { useCallback, useState } from 'react'
import { debounce } from 'lodash'
import { generatePayload, toastPromise } from 'redux/common'
import AsyncSelect from 'react-select/async'
import chatService from 'services/APIs/services/chatService'
import { Button } from 'react-bootstrap'
import chatTemplateService from 'services/APIs/services/chatTemplateService'

export default function FormAssigned({ formData }) {
    const [state, setState] = useState({
        search: "",
        chatData: formData?.chatTemplates?.map(i => ({ label: i.templateChat?.name, value: i.templateChat?.id })) || [],
        loading: false
    });

    const loadSuggestions = debounce(async (query, callback) => {
        setState(prev => ({ ...prev, loading: true }));
        let payload = await generatePayload({
            keys: ["name"], value: query || "",
            options: {
                sort: [["name", "asc"]],
                attributes: ["id", "name", "image", "type", "createdAt"],
                pagination: true,
                limit: 10,
            },
        });
        const data = await chatService.getGrouplist({ payload })
        setState(prev => ({ ...prev, loading: false }));
        if (data?.status === 1)
            return callback(
                data.data.map(group => ({
                    ...group,
                    label: group.name,
                    value: group.id,
                }))
            );
        return callback([]);
    }, 1000);

    const onUpdate = useCallback(async () => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    const chatIds = state.chatData.map(i => i.id);
                    setState(prev => ({ ...prev, loading: true }));
                    const data = await chatTemplateService.update({
                        payload: { chatIds, templateTabId: formData.id }
                    });
                    if (data?.status === 1) {
                        setState(prev => ({ ...prev, loading: false }));
                        resolve(1);
                    }
                } catch (error) {
                    reject(0);
                }
            },
            loading: "Updating chats templates", error: "Couldn't update templates", success: "Chats templates updated"
        });
    }, [state.chatData, formData?.id]);


    return (
        <div>
            <AsyncSelect
                classNamePrefix="select"
                className={`basic-single`}
                isClearable
                value={state.chatData || []}
                placeholder={`Select Chats...`}
                loadOptions={loadSuggestions}
                isLoading={state.loading}
                menuPlacement="auto"
                isMulti
                onChange={(value) => setState(prev => ({ ...prev, chatData: value }))}
            />
            <div className='d-flex gap-10 mt-2'>
                <Button onClick={onUpdate} disabled={state.loading}>Update</Button>
            </div>
            {/* <FormGenerator
                className={'m-1 text-color'}
                formClassName="row"
                dataFields={[{
                    "name": "designation",
                    "label": "Groups",
                    "valueKey": "designation",
                    "value": "",
                    "type": "select",
                    "validationType": "array",
                    "validations": [],
                    "optionKey": {
                        "url": base.URL + '/chat/list',
                        "payload": {
                            "keys": ["name"],
                            "value": "",
                            "options": {
                                pagination: true, limit: 20
                            }
                        },
                        "method": "post",
                        "labelField": "name",
                        "valueField": "id"
                    },
                    "classes": { wrapper: "col-12", label: "", field: "", error: "" },
                    "isEditable": true,
                    "options": [],
                    "pluginConfiguration": {
                        "isMulti": true,
                        "isClearable": true
                    },
                }]}
                onSubmit={data => console.log(data)}
                resetOnSubmit={false}
            /> */}
        </div>
    )
}
