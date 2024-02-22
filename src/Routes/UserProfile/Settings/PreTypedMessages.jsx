import React, { useCallback, useMemo, useState } from 'react'
import { Button } from 'react-bootstrap';
import moment from 'moment-timezone';
import { MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';
import ModalReactstrap from 'Components/Modals/Modal';
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
import { toastPromise } from 'redux/common';
import preTypedMessageService from 'services/APIs/services/preTypedMessageService';
import { useQuery } from '@tanstack/react-query';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { CONST } from 'utils/constants';

const defaultState = {
    create: false,
    update: false
}
export default function PreTypedMessages() {
    const [state, setState] = useState(defaultState);

    const { data: messageList, isFetching, refetch } = useQuery({
        queryKey: ["/preTypedMessage/list",],
        queryFn: async () => {
            const data = await preTypedMessageService.list({});
            if (data?.status === 1) {
                data.data.lastUpdated = moment().format();
                return data.data
            };
            return [];
        },
        keepPreviousData: false,
        refetchOnMount: true,
        staleTime: CONST.QUERY_STALE_TIME.L2,
    });
    const onCloseModal = useCallback(() => setState(prev => ({ ...prev, create: false, update: false })), []);
    const updateMessage = useCallback((msgData) => setState(prev => ({ ...prev, update: msgData })), []);

    const addNewMessage = useCallback(async (payload, mode, id) => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    if (id) payload.id = id
                    const data = mode === 'update' ?
                        await preTypedMessageService.update({ payload }) :
                        await preTypedMessageService.create({ payload })
                    if (!data?.status) return reject(data.message)
                    refetch();
                    onCloseModal();
                    resolve(1);
                } catch (error) {
                    reject(0);
                }
            },
            loading: mode === 'update' ? "Updating message" : "Creating new message",
            success: mode === 'update' ? "Successfully updated message" : "Successfully added message",
            error: error => error ? error : "Couldn't added message",
            options: { id: "create-message" }
        });
    }, [refetch, onCloseModal]);

    const deleteMessage = useCallback(async ({ id }) => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    await preTypedMessageService.delete({ payload: { id } });
                    refetch();
                    resolve(1);
                } catch (error) {
                    reject(0);
                }
            },
            loading: "Removing message data",
            success: "Successfully removed message",
            error: "Couldn't removed data",
            options: { id: "delete-message" }
        })
    }, [refetch]);

    return (
        <div className="card mb-3">
            <div className="card-header">
                <h6 className="mb-1">Pre-Typed Messages</h6>
                <p className="mb-0 text-muted small">It can be accessible by .(dot) while typing message in chat.</p>
            </div>
            <div className="card-body overflow-scroll hide-horizonal-scroll" style={{ maxHeight: "65vh" }}>
                <div className="pretyped-messages note-container p-0">
                    {isFetching && <Loader height={'80px'} />}
                    {!!messageList?.length ?
                        (messageList?.map((message, index) => {
                            return (
                                <div className="note" key={index}>
                                    <div className="note-body">
                                        <div className='d-flex justify-content-between flex-wrap'>
                                            <div className="note-added-on">{`Last modified: ${moment(message.updatedAt).format("MM/DD/YY hh:mm A")}`}</div>
                                            <div className="d-flex gap-10">
                                                <MuiEditAction onClick={() => updateMessage(message)} />
                                                <MuiDeleteAction onClick={() => deleteMessage(message)} />
                                            </div>
                                        </div>
                                        <p className="note-description white-space-preline text-color">{message.message}</p>
                                    </div>
                                </div>
                            )
                        })) :
                        (<div>No messages available</div>)}

                </div>
            </div>
            <div className="card-footer d-flex justify-content-end gap-10">
                <Button onClick={() => setState(prev => ({ ...prev, create: true }))}>
                    Add Message
                </Button>
                <Button variant='link' className='text-muted mx-1'>
                    Delete all
                </Button>
            </div>
            <CreateEditMessages
                showModal={Boolean(state.create || state.update)}
                onCancel={onCloseModal}
                onSubmit={addNewMessage}
                mode={state.update ? 'update' : 'create'}
                fieldName="Message"
                updateData={state.update}
            />
        </div>
    )
}


export const CreateEditMessages = ({ showModal, onSubmit, onCancel, mode = 'create', updateData, fieldName = 'field', patientId }) => {
    let taskJSONForm = useMemo(() => {
        const formData = [
            {
                "name": "message",
                "label": "Message",
                "valueKey": "message",
                "value": "",
                "type": "textarea",
                "validationType": "string",
                "validations": [{
                    "type": "required",
                    "params": ["Message is Required!"]
                }],
                "isEditable": true,
                "pluginConfiguration": { "rows": 3 },
                "classes": { wrapper: "col-12", label: "", field: "form-control vh-60", error: "" },
            },
        ];
        return formData.map((item) => {
            if (updateData) {
                if (updateData.hasOwnProperty(item.name)) item.value = updateData[item.name];
            }
            return item;
        });
    }, [updateData]);

    return (
        <ModalReactstrap
            header={<>{mode === 'update' ? 'Edit ' + fieldName : 'Create ' + fieldName}</>}
            toggle={onCancel}
            show={showModal}
            size='lg'
            body={
                showModal &&
                <FormGenerator
                    className="m-0"
                    formClassName={"row"}
                    dataFields={taskJSONForm}
                    resetOnSubmit={false}
                    onSubmit={(data) => onSubmit(data, mode, (mode === 'update' && updateData.id))}
                />
            }
        />
    )
}
