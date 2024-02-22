import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment-timezone";
import DatePicker from "react-datepicker";
import { MentionsInput, Mention } from 'react-mentions';

import { menuStyle } from './css/defaultStyle';
import { SocketEmiter } from "utils/wssConnection/Socket";
import { CONST, SOCKET } from "utils/constants";
import { AttachmentFile } from './AttachmentFile';
import AudioFooter from "Routes/Chat/Main/UserChat/footer/AudioFooter";
import { MessageSendButton } from './SendButton';
import { TaskSendButton } from "./TaskSendButton";
import { CancelEditButton } from "./CancelEditButton";
import { EmojiArea } from "./EmojiArea";
import { QuoteMessage } from "./QuoteMessage";
import { TypesButton } from "./TypesButton";

import MessageReactionsViewer from "./MessageReactionsViewer";
import MemberAssign from "./MemberAssign";
import Switch from "antd/es/switch";
import preTypedMessageService from "services/APIs/services/preTypedMessageService";
import { AttachmentPreview } from "./AttachmentPreview";
import { getPatientList, getSendToUsers } from "redux/actions/chatAction";
import { fnBrowserDetect, generatePayload } from "redux/common";
import { messageRef } from "../message/ChatMessages";
import { isMobile } from "react-device-detect";
import { onUploadImage, uploadToS3 } from "utils/AWS_S3/s3Connection";
import { ToggleSwitch } from "./TaskType/ToggleSwitch";
import { showError } from "utils/package_config/toast";
import { useQuery } from "@tanstack/react-query";
import CategoryAssign from "./CategoryAssign";
import { getPatientName } from "Components/Modals/PatientInfoModal";
import { useMount, useUnmount } from "react-use";
import draftMessageService from "services/APIs/services/draftMessageService";

const defaultInput = {
    subject: null,
    patient: null,
    message: "",
    ccText: null,
    ccMentions: [],
    bccMentions: [],
    bcc: null,
    isTeam: false,
    patientIds: [],
    categories: [],
    isDepartment: false
}
const defaultState = {
    isPrivateChat: false,
    privUsrId: null,
    isTask: false,
    contextmenu: null
}
export const ChatFooter = ({
    messagesEndRef,
    userChatState,
    SetUserChatState,
    pastedFiles = [],
    onSendMessage = () => { },
    threadFooter,
    draftFooter
}) => {
    const { editMessage, messageStatus, quoteMessage } = userChatState;
    const { activeChat, messages, userDesignations } = useSelector((state) => state.chat);
    const { user, connected } = useSelector((state) => state.user);
    const [footerState, setFooterState] = useState(defaultState);
    const [messageText, setMessageText] = useState(defaultInput);
    const [messageType, setMessageType] = useState(CONST.MSG_TYPE.ROUTINE);
    const [isRecording, setRecorder] = useState(false);
    const textRef = useRef();
    const inputRef = useRef();
    const memberRef = useRef();
    const categoryRef = useRef();
    const ccRef = useRef(null);
    // const chatFooter = useRef(null);
    const patientRef = useRef(null);
    const [taskDueDate, setTaskDueDate] = useState(moment().add(24, "hour").toLocaleString());
    const [assignMembers, setAssignMem] = useState([]);
    const [assignDesignation, setAssignDesg] = useState([]);
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [isUploading, setUploading] = useState(false);
    const [uploadDone, setUploadDone] = useState(false);

    // useClickAway(chatFooter, () => SetUserChatState(prev => ({ ...prev, messageStatus: false })));

    // Unmounted is used to save previous data in message box
    useUnmount(() => {
        !threadFooter &&
            (async () => {
                if (!footerState.draft && (!messageText.message || messageText.message === "\n")) return;
                // setChatFooterData({ id: activeChat.id, data: messageText })
                const request = {
                    payload: {
                        chatId: activeChat.id,
                        message: JSON.stringify({
                            ...messageText,
                            chatId: activeChat.id,
                            chatType: activeChat.type,
                            type: messageType,
                            sendTo: getSendToUsers(user.id, activeChat.type, activeChat.chatusers),
                            sendBy: user.id,
                            dueDate: taskDueDate,
                            isMessage: !Boolean((footerState.isPrivateChat && footerState.isTask) || (!!assignMembers?.length || !!attachmentFiles?.length)),
                            assignedUsers: footerState.isPrivateChat ? [footerState.privUsrId, user.id] : assignMembers.map((mem) => mem.user.id),
                            // attachments: filesLinks,
                            isTeam: messageText?.isTeam,
                            isDepartment: messageText.isDepartment,
                            taskDepartment: messageText.isDepartment ? assignDesignation.map(i => i.id) : undefined,
                            label: messageText.categories.map(i => i.id) || [],
                            patientIds: messageText.patientIds,
                        })
                    }
                }
                // footerState.draft ?
                await draftMessageService.update(request)
                // await draftMessageService.create(request)
            })();
    });

    useMount(() => {
        !threadFooter &&
            (async () => {
                const payload = await generatePayload({
                    findOne: true,
                    rest: { chatId: activeChat.id, sent: false, schedule: false },
                    options: { sort: [["createdAt", "DESC"]] }
                })
                const data = await draftMessageService.list({ payload });
                if (data?.status === 1 && data?.data) {
                    setFooterState(prev => ({ ...prev, draft: data.data }))
                    const messageData = JSON.parse(data.data.message);
                    setMessageText(prev => ({ ...prev, ...messageData }))
                    messageData.type && setMessageType(messageData.type);
                    messageData.dueDate && setTaskDueDate(messageData.dueDate);
                }
            })();
    });

    const { data: preTypedMessages, refetch: refetchPreMsg } = useQuery({
        queryKey: ["/preTypedMessage/list"],
        queryFn: async () => {
            const data = await preTypedMessageService.list({});
            if (data?.status === 1) return data.data.map(item => ({ id: item.id, display: item.message }));
            return [];
        },
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L2,
    });

    const usersData = useMemo(() => {
        if (!activeChat?.chatusers) return [];
        const data = activeChat?.chatusers
            ?.filter(item => activeChat.users?.includes(item.userId) && item.userId !== user.id && item?.user?.isActive)
            ?.map((item) => ({ id: item.userId, display: `${item.user?.name}` }));
        const designations = activeChat.type !== CONST.CHAT_TYPE.PRIVATE && userDesignations?.map((item) => ({ id: 'd-' + item.id, display: `${item.name}` }))
        return (designations && !!designations.length ? [...data, ...designations] : data);
    }, [activeChat.chatusers, activeChat.users, user.id, userDesignations, activeChat.type]);

    useEffect(() => {
        !isMobile && !threadFooter && inputRef?.current?.focus();
        setAssignMem([]);
        setAssignDesg([]);
        // setMessageText(prev => {
        //     const savedData = getChatFooterData(activeChat.id);
        //     return savedData ?? defaultInput;
        // });
        setFooterState(prev => {
            const isPrivateChat = activeChat.type === CONST.CHAT_TYPE.PRIVATE
            const privUsrId = isPrivateChat && activeChat.users.find(item => item !== user.id);
            return { ...prev, isPrivateChat, privUsrId }
        })
    }, [activeChat.id, activeChat.type, activeChat.users, user.id, threadFooter]);

    useEffect(() => {
        if (!!pastedFiles?.length) {
            let selectedFiles = Object.keys(pastedFiles).map((item) => ({ file: pastedFiles[item], id: item + pastedFiles[item].lastModified }));
            !!selectedFiles.length && setAttachmentFiles(prev => (!!prev?.length) ? [...prev, ...selectedFiles] : selectedFiles);
        }
    }, [pastedFiles]);

    useEffect(() => {
        if (editMessage) {
            inputRef?.current?.focus();
            SetUserChatState(prev => ({ ...prev, messageStatus: true }))
            setMessageType(editMessage.type);
            setMessageText((prev) => {
                return {
                    ...prev,
                    subject: editMessage.subject,
                    patient: editMessage.patient,
                    message: editMessage.message,
                    ccText: editMessage.ccText,
                    bcc: editMessage.bccText,
                }
            });
        } else setMessageText(defaultInput);
        //eslint-disable-next-line
    }, [editMessage]);

    useEffect(() => {
        if (!quoteMessage) return;
        messageRef[quoteMessage.id]?.current?.scrollIntoView(false);
        setTimeout(() => inputRef?.current?.focus(), 500);

    }, [quoteMessage]);

    const clearFooterData = useCallback(() => {
        SetUserChatState(prev => ({ ...prev, quoteMessage: null, messageStatus: false }))
        setMessageText(defaultInput);
        setAssignMem([]);
        setAssignDesg([]);
        if (!isUploading && !!attachmentFiles.length) {
            setAttachmentFiles([]);
            setUploadDone(false);
        }
    }, [SetUserChatState, attachmentFiles.length, isUploading]);

    const inputEvent = ({ name, value }) => setMessageText((prev) => ({ ...prev, [name]: value }));

    const onCloseQuoteHandler = () => SetUserChatState(prev => ({ ...prev, quoteMessage: null }))

    const scrollDown = useCallback(() => {
        setTimeout(() => messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" }), 1000);
    }, [messagesEndRef]);

    const onAttachmentsUpload = useCallback(async () => {
        if (isUploading) return;
        setUploading(true);
        try {
            let index = 0, filesUrl = [];
            for (const fileItem of attachmentFiles) {
                const file = fileItem.file;
                const presignedUrl = await onUploadImage(file);
                const uploadedImageUrl = await uploadToS3(presignedUrl, file);
                filesUrl[index] = {
                    mediaUrl: uploadedImageUrl,
                    mediaType: `${file.type.split("/").shift()}/${file.name?.split(".")?.pop()}`,
                    fileName: file.name,
                };
                index++;
            };
            // setUploadedLinks(filesUrl);
            setUploadDone(true);
            setUploading(false);
            return filesUrl;
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    }, [attachmentFiles, isUploading]);

    const sendTaskHandler = useCallback(async (taskType, duedate = null) => {
        let filesLinks = [];
        if (!connected) return showError("You're offline, Please check your connection and try again", { id: "offline-error" });
        if (!!attachmentFiles?.length) filesLinks = await onAttachmentsUpload();
        if (messageText && messageText.message.trim() !== "") {
            if (!!assignMembers.length || !!attachmentFiles.length || footerState.isPrivateChat) {
                const msgObject = {
                    chatType: activeChat.type,
                    chatId: activeChat.id,
                    message: messageText.message,
                    type: taskType,
                    sendTo: getSendToUsers(user.id, activeChat.type, activeChat.chatusers),
                    sendBy: user.id,
                    quotedMessageId: quoteMessage ? quoteMessage.id : null,
                    patient: quoteMessage ? quoteMessage.patient : messageText.patient,
                    subject: messageText.subject,
                    dueDate: duedate,
                    isMessage: false,
                    ccText: messageText.ccText,
                    ccMentions: messageText.ccMentions,
                    bccText: messageText.bcc,
                    bccMentions: messageText.bccMentions,
                    patientIds: messageText.patientIds,
                    assignedUsers: footerState.isPrivateChat ? [footerState.privUsrId, user.id] : assignMembers.map((mem) => mem.user.id),
                    attachments: filesLinks,
                    isTeam: messageText?.isTeam,
                    isDepartment: messageText.isDepartment,
                    taskDepartment: messageText.isDepartment ? assignDesignation.map(i => i.id) : undefined,
                    label: messageText?.categories?.map(i => i.id) || []
                }
                onSendMessage(msgObject);
                if (!msgObject.quotedMessageId) scrollDown()
                clearFooterData();
            }
            else if (!assignMembers.length) { }
            if (!!attachmentFiles?.length) setAttachmentFiles([]);
        } else inputRef?.current?.focus();
    }, [activeChat.chatusers, activeChat.id, activeChat.type, assignMembers, clearFooterData, connected, footerState.isPrivateChat,
    footerState.privUsrId, messageText, quoteMessage, scrollDown, user.id, attachmentFiles?.length, onAttachmentsUpload, assignDesignation, onSendMessage]);

    const sendMessageHandler = useCallback((msgType, e = undefined) => {
        e?.preventDefault();
        if (!connected) return showError("You're offline, Please check your connection and try again", { id: "offline-error" });
        if (messageText && messageText.message.trim() !== "") {
            const frontMsgId = Math.floor(Math.random() * 9999);
            const msgObject = {
                chatType: activeChat.type,
                chatId: activeChat.id,
                message: messageText.message,
                type: msgType,
                sendTo: getSendToUsers(user.id, activeChat.type, activeChat.chatusers),
                sendBy: user.id,
                quotedMessageId: quoteMessage ? quoteMessage.id : null,
                patient: quoteMessage ? quoteMessage.patient : messageText.patient,
                subject: messageText.subject,
                isMessage: true,
                ccText: messageText.ccText,
                ccMentions: messageText.ccMentions,
                bccText: messageText.bcc,
                bccMentions: messageText.bccMentions,
                patientIds: messageText.patientIds,
                frontMsgId,
                label: messageText?.categories?.map(i => i.id) || []
            }
            SetUserChatState(prev => ({
                ...prev,
                messageStatus: false,
                quoteMessage: null,
                bufferMessages: [...(prev.bufferMessages || []), { ...msgObject, id: frontMsgId }]
            }));
            onSendMessage(msgObject);
            if (!msgObject.quotedMessageId) scrollDown();
            clearFooterData();
        } else
            inputRef?.current?.focus();
    }, [SetUserChatState, activeChat.chatusers, activeChat.id, activeChat.type, clearFooterData, messageText, quoteMessage,
        scrollDown, user.id, connected, onSendMessage]);

    const sendEditMessage = useCallback((messageType, e = undefined) => {
        e?.preventDefault();
        if (!connected) return showError("You're offline, Please check your connection and try again", { id: "offline-error" });
        const index = messages.data.rows.findIndex(item => item.id === editMessage?.id);
        const mentionusers = messages.data.rows[index]?.mentionusers;
        const ccMentionArr = messageText.ccMentions?.map(item => Number(item.id));
        const oldMentionUsersArr = mentionusers?.map(item => item.userId);
        const body = {
            chatId: editMessage.chatId,
            messageId: editMessage.id,
            messageData: {
                ...messageText,
                ccText: messageText.ccText,
                ccMentionArr,
                oldMentionUsers: mentionusers,
                oldMentionUsersArr,
                newCCUsers: ccMentionArr?.filter((item => !oldMentionUsersArr.includes(item))),
                deletedCCUsers: oldMentionUsersArr?.filter((item => !ccMentionArr.includes(item))),
                type: messageType,
                label: messageText?.categories?.map(i => i.id) || []
            }
        }
        draftFooter ? onSendMessage(body) : SocketEmiter(SOCKET.REQUEST.EDIT_CHAT_MESSAGE, body);
        setMessageText(defaultInput);
        SetUserChatState(prev => ({ ...prev, messageStatus: false, editMessage: null }))
    }, [SetUserChatState, connected, editMessage?.chatId, editMessage?.id, messageText, messages?.data?.rows, draftFooter, onSendMessage]);

    const ccChangehandler = useCallback((event, newValue, newPlainTextValue, mentions) => {
        // -------------- step 1  ---------------------
        let newMentionValue = newValue.split('<@');
        if (!!newMentionValue.length && !event.target.value.endsWith('@') && event.target.value !== '') {
            const element = newMentionValue.at(-1);
            const [eleId] = element.split('>');
            if (eleId.startsWith('d-')) {
                let tempnewValue = newValue;
                let newString = '';
                activeChat.chatusers.map((user) => {
                    if (user?.user?.userDesignations) {
                        const temp = Number(eleId.split('-')[1]);
                        if (user?.user?.userDesignations.map(item => item.designationId).includes(temp)) {
                            newString = newString + `<@${user?.user.id}>(${user?.user.name})`
                        }
                    }
                    return null;
                });
                const newUpdated = tempnewValue.replace(`<@${element}`, newString);
                newValue = newUpdated;
                // -------------- step 2  ---------------------
                let newArr = [];
                let elements = newUpdated.split('<@');
                let arr = elements.filter(e => e);
                arr.map((ele, ind) => {
                    if (ele && ele !== undefined) {
                        const [id, name] = ele.split('>');
                        const prevEle = newArr[ind - 1];
                        let result = name.lastIndexOf(")");
                        let newName = name.substring(0, result) + name.substring(result + 1);
                        newArr.push({
                            id: Number(id),
                            display: `@${newName.substring(1)} `,
                            childIndex: 0,
                            index: ind !== 0 ? (prevEle?.index + `<@${prevEle?.id}>(${prevEle?.display}) `.length) : 0,
                            plainTextIndex: ind !== 0 ? (prevEle?.plainTextIndex + prevEle?.display?.length) : 0,
                        })
                    }
                    return null;
                });
                mentions = newArr
            } else {
                // ("no, it won't change anything")
            }
        }
        setMessageText((prev) => ({ ...prev, ccText: newValue, ccMentions: mentions, }));
        ccRef.current.selectionStart = ccRef.current.selectionStart + ccRef.current.size;
    }, [activeChat.chatusers]);

    const patientChangehandler = (event, newValue, newPlainTextValue, mentions) =>
        setMessageText((prev) => ({ ...prev, patient: newValue, patientIds: mentions.map((item) => Number(item.id)) }));

    const onCancelEdit = () => SetUserChatState(prev => ({ ...prev, editMessage: null }));

    const SubmitHandler = useCallback(() => {
        if (!editMessage) sendMessageHandler(messageType)
        else sendEditMessage(messageType);
    }, [editMessage, messageType, sendEditMessage, sendMessageHandler]);

    const checkKey = useCallback((e) => {
        if (navigator?.userAgentData?.mobile) return;
        if (fnBrowserDetect() === 'safari') return;
        if (e.key === "Enter" && !e.shiftKey) {
            if ((footerState.isPrivateChat && footerState.isTask) || (!!assignMembers?.length || !!attachmentFiles?.length || e.altKey)) sendTaskHandler(messageType, taskDueDate)
            else SubmitHandler();
        };
    }, [SubmitHandler, assignMembers, messageType, sendTaskHandler, taskDueDate, attachmentFiles, footerState.isPrivateChat, footerState.isTask]);

    const onSubmitAudio = useCallback(({ fileType, fileName, uploadedAudioUrl }) => {
        const msgObject = {
            chatType: activeChat.type,
            chatId: activeChat.id,
            message: "",
            mediaType: fileType,
            mediaUrl: uploadedAudioUrl,
            type: CONST.MSG_TYPE.ROUTINE,
            sendTo: getSendToUsers(user.id, activeChat.type, activeChat.chatusers),
            isMessage: true,
            sendBy: user.id,
            quotedMessageId: quoteMessage ? quoteMessage.id : null,
            patient: "",
            subject: "",
            fileName: `${fileName}.mp3`
        }
        onSendMessage(msgObject);
    }, [activeChat.chatusers, activeChat.id, activeChat.type, quoteMessage, user.id, onSendMessage]);

    const onChangeTaskType = useCallback((val) => {
        if (val === CONST.TASK_TYPE[2]) setMessageText(prev => ({ ...prev, isTeam: false, isDepartment: true }))
        else if (val === CONST.TASK_TYPE[1]) setMessageText(prev => ({ ...prev, isTeam: true, isDepartment: false }))
        else if (val === CONST.TASK_TYPE[0]) setMessageText(prev => ({ ...prev, isTeam: false, isDepartment: false }))
    }, []);

    if (isRecording)
        return <AudioFooter setRecorder={setRecorder} onSubmitAudio={onSubmitAudio} />;

    return (<>
        <div className="bg__chat-dark">
            <MessageReactionsViewer />
            {quoteMessage && !editMessage &&
                <QuoteMessage quoteMessage={quoteMessage} onCloseQuoteHandler={onCloseQuoteHandler} />}
            <div onClick={() => (!messageStatus) && SetUserChatState(prev => ({ ...prev, messageStatus: true }))}>
                {!!attachmentFiles.length && !editMessage &&
                    <AttachmentPreview
                        attachmentFiles={attachmentFiles}
                        isUploading={isUploading}
                        // setUploadedLinks={setUploadedLinks}
                        setUploading={setUploading}
                        uploadDone={uploadDone}
                        inputRef={inputRef}
                        setUploadDone={setUploadDone}
                        setAttachmentFiles={setAttachmentFiles} />}
                {messageStatus && <>
                    {!quoteMessage && <>
                        <div className="pre-chatfooter row m-0 transparent-bg">
                            <div className='form-control emojionearea-form-control d-flex align-items-center rounded-0 transparent-bg' style={{ fontSize: user?.fontSize }}>
                                <label className="mb-0">Subject:</label>
                                <input
                                    ref={textRef}
                                    autoComplete="off"
                                    type="text"
                                    name='subject'
                                    className='emojionearea-form-control inputField mx-1 flex-100 transparent-bg'
                                    value={messageText.subject ? messageText.subject : ""}
                                    onChange={e => inputEvent({ name: e.target.name, value: e.target.value })}
                                    placeholder="Enter Subject"
                                />
                            </div>
                        </div>
                        <div className="pre-chatfooter row m-0 transparent-bg">
                            <div className='form-control emojionearea-form-control w-50 d-flex align-items-center rounded-0 mentions-input transparent-bg border-y-none' style={{ fontSize: user?.fontSize }}>
                                <label className="mb-0">Patient:</label>
                                <MentionsInput
                                    id="patientInput"
                                    name="patient"
                                    autoComplete="off"
                                    placeholder="@"
                                    type="text"
                                    style={menuStyle}
                                    value={messageText?.patient ? messageText.patient : ''}
                                    onChange={patientChangehandler}
                                    className='mentions__ccusers emojionearea-form-control inputField mx-1 flex-100 transparent-bg'
                                    singleLine
                                    inputRef={patientRef}
                                >
                                    <Mention
                                        type="user"
                                        trigger="@"
                                        markup="<@__id__>(__display__) " // Warning: Don't remove space
                                        // markup="<#__id__>(@__display__)"
                                        // data={patientData}
                                        data={getPatientData}
                                        displayTransform={(id, display) => { return `@${display} ` }} // Warning: Don't remove space
                                        className="text-highlight-blue z-index-1"
                                        style={{ zIndex: 1, position: 'inherit' }}
                                    />
                                </MentionsInput>
                            </div>
                            <div className={`form-control emojionearea-form-control w-50 d-flex align-items-center rounded-0 mentions-input transparent-bg border-y-none`} style={{ fontSize: user?.fontSize }} id="ccInput">
                                <label className="mb-0">CC:</label>
                                <MentionsInput
                                    id="ccInput"
                                    name="cc"
                                    autoComplete="off"
                                    placeholder="@"
                                    type="text"
                                    style={menuStyle}
                                    value={messageText?.ccText ? messageText.ccText : ''}
                                    onChange={ccChangehandler}
                                    className='mentions__ccusers emojionearea-form-control inputField mx-1 flex-100 transparent-bg'
                                    singleLine
                                    inputRef={ccRef}
                                >
                                    <Mention
                                        type="user"
                                        trigger="@"
                                        markup="<@__id__>(__display__)"
                                        // markup="<#__id__>(@__display__)"
                                        data={usersData}
                                        // style={{ color: "#8ab4f8" }}
                                        displayTransform={(id, display) => { return `@${display} ` }}
                                        className="text-highlight-blue"
                                        appendSpaceOnAdd={true}
                                    />
                                </MentionsInput>
                            </div>
                        </div>
                    </>}
                    {!editMessage &&
                        <div className="pre-chatfooter row m-0">
                            <div className={`form-control emojionearea-form-control d-flex align-items-center rounded-0 justify-content-between transparent-bg gap-5 h-auto ${assignMembers.length > 1 ? 'flex-wrap' : ''}`} style={{ fontSize: user?.fontSize }}>
                                <div className="px-0 w-100 text-left d-flex align-items-center gap-10">
                                    {footerState.isPrivateChat ?
                                        <Switch
                                            checkedChildren="Task"
                                            unCheckedChildren="Message"
                                            defaultChecked={false}
                                            checked={footerState.isTask}
                                            className={'outline-none'}
                                            onChange={value => setFooterState(prev => ({ ...prev, isTask: value }))}
                                        />
                                        :
                                        (activeChat?.id !== -1 &&
                                            <MemberAssign
                                                memberRef={memberRef}
                                                assignMembers={assignMembers}
                                                userDesignations={userDesignations}
                                                setAssignMem={setAssignMem}
                                                assignDesignation={assignDesignation}
                                                setAssignDesg={setAssignDesg}
                                            />)}
                                    {/* {(footerState.isTask || !footerState.isPrivateChat) &&
                                        (!!assignMembers.length || !!attachmentFiles.length || footerState.isPrivateChat) &&
                                        <CategoryAssign
                                            ref={categoryRef}
                                            messageText={messageText}
                                            setMessageText={setMessageText}
                                        />} */}
                                    {/* {(footerState.isTask || !footerState.isPrivateChat) &&
                                        (!!assignMembers.length || !!attachmentFiles.length || footerState.isPrivateChat) && */}
                                    <CategoryAssign
                                        ref={categoryRef}
                                        messageText={messageText}
                                        setMessageText={setMessageText}
                                    />
                                </div>
                                <div className="max-width-fit min-width-fit d-flex flex-wrap">
                                    <DatePicker
                                        id="dueDate"
                                        placeholderText="Due Date"
                                        className="form-control flex-grow-1 bg-dark-f input-border text-color font-inherit border-radius-1" //p-4_8 
                                        selected={taskDueDate ? new Date(taskDueDate) : null}
                                        value={taskDueDate ? new Date(taskDueDate) : null}
                                        onChange={(date) => setTaskDueDate(date ? moment(date).toLocaleString() : null)}
                                        isClearable={true}
                                        dateFormat="MM/dd/yyyy h:mm aa"
                                        autoComplete='off'
                                        showTimeInput
                                        minDate={moment().toDate()}
                                        timeInputLabel="Time:"
                                    />
                                    {/* {assignDesignation?.length > 1 &&
                                        <Form.Check
                                            type={"checkbox"}
                                            className="my-1"
                                            id={`department-check`}
                                            label={`Departmental`}
                                            onChange={e => setMessageText(prev => ({ ...prev, isDepartment: e.target.checked }))}
                                        />} */}
                                </div>
                                {((assignMembers && assignMembers?.length > 1) || footerState.isPrivateChat) &&
                                    <div className="d-flex align-items-center">
                                        <ToggleSwitch
                                            values={CONST.TASK_TYPE}
                                            OnChange={e => onChangeTaskType(e)}
                                            selected={(messageText.isDepartment ? CONST.TASK_TYPE[2] :
                                                (messageText.isTeam ? CONST.TASK_TYPE[1] : CONST.TASK_TYPE[0]))}
                                        />
                                    </div>}
                            </div>
                        </div>}
                </>}
                <form className="chat-footer" style={{ fontSize: user?.fontSize }}>
                    {!editMessage ?
                        (!draftFooter &&
                            <AttachmentFile
                                attachmentFiles={attachmentFiles}
                                setRecorder={setRecorder}
                                setAttachmentFiles={setAttachmentFiles}
                                message={messageText}
                                cb={clearFooterData}
                                refetchPreMsg={refetchPreMsg}
                            />) :
                        <CancelEditButton onCancelEdit={onCancelEdit} />}
                    {/* <textarea
                        name="message"
                        autoComplete="off"
                        className={`form-control emojionearea-form-control message-input font-inherit ${editMessage ? 'edit-msg' : ''}`}
                        id="messageInput"
                        placeholder="Type Message/Task here..."
                        value={messageText?.message === "\n" ? '' : messageText?.message}
                        onChange={inputEvent}
                        onKeyPress={(e) => checkKey(e)}
                        ref={inputRef}
                    /> */}
                    <MentionsInput
                        inputRef={inputRef}
                        id="messageInput"
                        name="message"
                        autoComplete="off"
                        placeholder="Type Message/Task here..."
                        type="textarea"
                        rows={3}
                        style={menuStyle}
                        value={messageText?.message === "\n" ? '' : messageText?.message}
                        // onMouseUp={e => console.log(window.getSelection().toString())}
                        // onContextMenu={(e) => window.getSelection().toString() ? handleContextMenu(e) : null}
                        className={`mentions__cmmt form-control emojionearea-form-control message-input font-inherit ${editMessage ? 'edit-msg' : ''} h-100 bg-transparent`}
                        onChange={e => {
                            // inputEvent({ name: "message", value: e.target.value })
                            inputEvent({ name: "message", value: (e.target.value || "").replace(CONST.REGEX.MESSAGE_REPLACE, '$1') })
                        }}
                        onKeyPress={checkKey}
                        allowSuggestionsAboveCursor={true}
                    >
                        <Mention
                            type="user"
                            name="users"
                            trigger="@"
                            markup="<@__id__>(__display__)"
                            data={usersData}
                            displayTransform={(id, display) => { return `@${display} ` }}
                            className="mentions__cmmt text-highlight-blue"
                        />
                        <Mention
                            type="message"
                            name="messages"
                            trigger="."
                            markup="<<message#__id__>>(__display__)"
                            data={preTypedMessages}
                            displayTransform={(id, display) => display}
                            className="mentions__message"
                        />
                    </MentionsInput>
                    {/* {contextMenu} */}
                    <EmojiArea
                        setMessageText={setMessageText}
                        isEditing={editMessage}
                    />
                    {!editMessage && <>
                        <TypesButton
                            messageType={messageType}
                            setMessageType={setMessageType}
                            isEditing={false}
                            setTaskDueDate={setTaskDueDate}
                        />
                        {((!!assignMembers.length || !!attachmentFiles.length) || (footerState.isPrivateChat && footerState.isTask)) ?
                            <TaskSendButton
                                assignMembers={assignMembers}
                                sendTaskHandler={sendTaskHandler}
                                taskDueDate={taskDueDate}
                                taskType={messageType}
                                disabled={(!!attachmentFiles.length && isUploading)}
                            />
                            :
                            <MessageSendButton
                                sendMessageHandler={sendMessageHandler}
                                messageType={messageType}
                                setMessageType={setMessageType}
                                isEditing={false}
                                disabled={(!!attachmentFiles.length && isUploading)}
                            />
                        }
                        {/* {((!assignMembers.length && !attachmentFiles.length) || (!footerState.isTask)) && */}
                    </>}
                    {editMessage && <>
                        <TypesButton messageType={messageType} setMessageType={setMessageType} isEditing={true} setTaskDueDate={setTaskDueDate} />
                        <MessageSendButton sendMessageHandler={sendMessageHandler} messageType={messageType} setMessageType={setMessageType} sendEditMessage={sendEditMessage} isEditing={true} disabled={!!attachmentFiles.length && isUploading} />
                    </>}
                </form>
            </div>
        </div>
    </>);
}

export const getPatientData = async (query, callback) => {
    if (!query) return;
    const payload = await generatePayload({
        keys: ["firstName", "lastName"],  // remaining doctor filter
        value: query,
        options: { pagination: true, limit: 10 }
    });
    const data = await getPatientList(payload);
    if (data.status === 1) {
        const y = data.data.map(usr => {
            // let display = usr.firstName;
            // if (usr?.lastName) display = `${display}-${usr.lastName}`
            return { id: usr.id, display: getPatientName(usr.lastName, usr.firstName) };
        });
        callback(y);
    }
}

// const setChatFooterData = ({ id = 0, data = {} }) => {
//     let prevData = localStorage.getItem('accessFooterData') ? JSON.parse(localStorage.getItem('accessFooterData')) : {};
//     prevData[id] = data;
//     localStorage.setItem('accessFooterData', JSON.stringify({ ...prevData }));
// }
// const getChatFooterData = (id) => {
//     let prevData = localStorage.getItem('accessFooterData') ? JSON.parse(localStorage.getItem('accessFooterData')) : {};
//     return prevData[id] ? prevData[id] : null;
// }