import React, { useCallback, useMemo, useState } from 'react'
import CreateForm from 'Routes/Chat/Appbar/GroupForms/modals/CreateForm';
import { Button } from 'react-bootstrap'
import { X } from 'react-bootstrap-icons'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { generatePayload } from 'redux/common';
import { CONST } from 'utils/constants';
import { MuiActionButton } from 'Components/MuiDataGrid';
import { useQuery } from '@tanstack/react-query';
import { NoteAddOutlined } from '@mui/icons-material';
import chatTemplateService from 'services/APIs/services/chatTemplateService';
import 'reactflow/dist/style.css';
import 'styles/react-flow_canvas.css';

const defaultState = {
    create: false,
    activeForm: false,
    formData: null,
    editForm: false,
}
export default function GroupForms({ onClosehandler }) {
    const { user } = useSelector(state => state.user);
    const { activeChat } = useSelector(state => state.chat);
    const [state, setState] = useState(defaultState);

    const { data: templates = [] } = useQuery({
        queryKey: ["/chatTemplate/list", user.id, activeChat?.id],
        queryFn: async () => {
            const payload = await generatePayload({
                rest: { chatId: activeChat?.id },
                options: { populate: ["templateTab"] }
            });
            const data = await chatTemplateService.list({ payload });
            if (data?.status === 1) return data.data;
            return [];
        },
        keepPreviousData: false,
    });

    const validateValue = useCallback((value_data = "-") => {
        value_data = typeof value_data === "object" && value_data !== null && value_data.hasOwnProperty("value") ?
            value_data.value : (Array.isArray(value_data) ? (value_data.map(item => item.hasOwnProperty('value') ? item.value : item).join(', ')) : value_data);
        return typeof value_data !== 'object' ? value_data : validateValue(value_data);
    }, []);

    // const onSubmitFormHandler = useCallback((data) => {
    //     const ObjectData = data;
    //     let newData = "";
    //     const form = JSONParserer(state.formData.JSONData);
    //     Object.keys(form).forEach((key, index) => {
    //         const key_data = form[key].name;
    //         let value_data = ObjectData[key_data];
    //         value_data = validateValue(value_data);
    //         if (form[key].type === FIELD_TYPES_NAME.date)
    //             value_data = moment(value_data).format("MM/DD/YYYY");
    //         newData += `\n*${key_data}*: ${value_data}`;
    //     });
    //     const msgObject = {
    //         chatType: activeChat.type,
    //         chatId: activeChat.id,
    //         message: newData,
    //         type: CONST.MSG_TYPE.ROUTINE,
    //         sendTo: getSendToUsers(user.id, activeChat.type, activeChat.chatusers),
    //         sendBy: user.id,
    //         isMessage: true,
    //     }
    //     sendMessage(msgObject);
    //     showSuccess("Successfully Submitted Form");
    //     onClosehandler();
    // }, [activeChat?.chatusers, activeChat?.id, activeChat?.type, onClosehandler, state?.formData?.JSONData, user?.id, validateValue]);

    // const updateFormData = useCallback(async (updatedData) => {
    //     await toastPromise({
    //         func: async (resolve, reject) => {
    //             try {
    //                 const payload = {
    //                     JSONData: updatedData.JSON_String,
    //                     title: updatedData.form_title,
    //                     id: updatedData.id
    //                 }
    //                 const data = await formTemplateService.update({ payload });
    //                 resolve(data);
    //                 setState(prev => ({ ...prev, create: false }));
    //             } catch (error) {
    //                 reject(error);
    //             }
    //         },
    //         loading: 'Updating template form',
    //         success: 'Updated template form',
    //         error: 'Could not update template',
    //         options: { id: "update-template-form" }
    //     });
    //     getFormsList();
    // }, [getFormsList]);

    // const deleteForm = useCallback(async (id) => {
    //     TakeConfirmation({
    //         title: `Are you sure about deleting this template?`,
    //         onDone: async () => {
    //             await formTemplateService.delete({ payload: { id } });
    //             getFormsList();
    //         }
    //     })
    // }, [getFormsList]);

    const isGroupAdmin = useMemo(() => (activeChat.type === CONST.CHAT_TYPE.GROUP) ?
        activeChat?.chatusers?.find(usr => usr.userId === user.id)?.isAdmin : true
        , [activeChat?.chatusers, activeChat.type, user.id]);

    // const displayForm = useMemo(() => {
    //     if (!state?.activeForm || !state?.formData) return <></>;
    //     return (
    //         <ModalReactstrap
    //             show={true}
    //             backdrop="static"
    //             size='lg'
    //             toggle={() => setState(prev => ({ ...prev, activeForm: false, formData: null }))}
    //             header={state?.formData?.title}
    //             body={
    //                 <FormGenerator
    //                     className="m-1"
    //                     dataFields={JSONParserer(state.formData.JSONData)}
    //                     onSubmit={(data) => onSubmitFormHandler(data)}
    //                 />
    //             }
    //         />
    //     )
    // }, [onSubmitFormHandler, state?.formData, state?.activeForm]);

    const openTemplateForm = useCallback((data) => {
        setState(prev => ({ ...prev, create: true, formData: data }));
    }, []);

    try {
        return (
            <div className="tab-pane h-100 active">
                <div className="appnavbar-content-wrapper">
                    <div className="appnavbar-scrollable-wrapper">
                        <div className="appnavbar-heading sticky-top">
                            <ul className="nav justify-content-between align-items-center">
                                <li className="text-center">
                                    <h5 className="text-truncate mb-0">Template Messages</h5>
                                </li>
                                <li className="nav-item list-inline-item close-btn">
                                    <MuiActionButton Icon={X} size="small" className="text-color" onClick={onClosehandler} />
                                </li>
                            </ul>
                        </div>
                        <div className="appnavbar-body">
                            <div className="note-container">
                                {templates?.map((item) => {
                                    let { title = "", tab = "" } = item?.templateTabInfo;
                                    if (item.templateTabInfo?.templateGroupIdInfo)
                                        tab = ` (${item.templateTabInfo?.templateGroupIdInfo.title})`
                                    return (
                                        <div className="note" key={item.id}>
                                            <div className="note-body">
                                                {/* {/ <div className="note-added-on">{moment(item.createdAt).format("MM/DD/YY hh:mm A")}</div> /} */}
                                                <h5 className="note-title">{title ?? 'Untitled Form'}{tab ?? ''}</h5>
                                                {item?.description && <p className="note-description">{item.description}</p>}
                                            </div>
                                            <div className="note-footer p-2">
                                                <div className="note-tools">
                                                    {/* {/ <span className={`badge ${getNoteTypeClass(item.tag)} text-capitalize`}>{item.tag}</span> /} */}
                                                </div>
                                                <div className="note-tools">
                                                    {/* <MuiTooltip title="Send message">
                                                        <IconButton color='primary' aria-label="send" onClick={() => setState(prev => ({ ...prev, activeForm: true, formData: item }))}>
                                                            <NoteAddIcon />
                                                        </IconButton>
                                                    </MuiTooltip> */}
                                                    <MuiActionButton Icon={NoteAddOutlined} tooltip="Open template" onClick={() => openTemplateForm(item?.templateTabInfo)} />
                                                    {/* {isGroupAdmin && <>
                                                        <MuiTooltip title="Edit Template">
                                                            <IconButton color='primary' aria-label="edit" onClick={() => setState(prev => ({ ...prev, editForm: true, formData: item }))}>
                                                                <EditIcon />
                                                            </IconButton>
                                                        </MuiTooltip>
                                                        <MuiTooltip title="Delete Template">
                                                            <IconButton color='secondary' aria-label="delete" onClick={() => { deleteForm(item.id) }}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </MuiTooltip>
                                                    </>} */}
                                                </div>
                                            </div>
                                        </div>)
                                })}
                            </div>
                        </div>
                        {isGroupAdmin &&
                            <div className="appnavbar-footer">
                                <Button className='btn-block' onClick={() => setState(prev => ({ ...prev, create: true }))}>
                                    Chat Templates
                                </Button>
                            </div>}
                    </div>
                </div>
                {state?.create &&
                    <CreateForm
                        onCancel={() => setState(prev => ({ ...prev, create: false, formData: null }))}
                        formData={state.formData}
                        templates={templates.map(i => ({ value: i.templateTabInfo.id, label: i.templateTabInfo.title }))}
                    />}
                {/* {displayForm} */}
                {/* {state?.editForm && state.formData &&
                    <CreateForm
                        onCancel={() => setState(prev => ({ ...prev, editForm: false, formData: null }))}
                        onSave={(updates) => updateFormData(updates)}
                        formData={{ JSONData: JSONParserer(state.formData.JSONData), title: state.formData.title, id: state.formData.id }} />} */}
            </div>
        );
    } catch (error) {
        console.error(error);
    }
}