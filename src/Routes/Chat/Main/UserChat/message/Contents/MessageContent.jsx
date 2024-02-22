import { useCallback, useMemo } from "react";
import { MessageDropDown } from "../Options/MessageDropDown"
import { QuotedMessage } from "../Quoted/QuotedMessage";
import MessageFooter from '../Options/MessageFooter';
import MessageHeader from "../Options/MessageHeader";
import { format_all, format_ccText, format_patient, getAudioUrl, getImageURL, messageFormat, toastPromise } from "redux/common";
import { ArrowReturnRight, EyeFill } from "react-bootstrap-icons";
import { CONST } from "utils/constants";
import { getGhostAccess } from "utils/permission";
import { MuiTooltip } from "Components/components";
import { getTaskDetails } from "redux/actions/taskAction";
import { useSelector } from "react-redux";
import { Badge, Card } from "react-bootstrap";
import { DocumentScanner, PictureAsPdf } from "@mui/icons-material";
import { onImageGalleryOpen } from "../Message";
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import { changeModel } from "redux/actions/modelAction";
import { dispatch } from "redux/store";
import { CHAT_CONST } from "redux/constants/chatConstants";
import ErrorBoundary from "Components/ErrorBoundry";
import patientService from "services/APIs/services/patientService";
import MessageCategory from "../Options/MessageCategory";

export const MessageContent = ({
    item,
    classes = '',
    moveToOrigin,
    prevMsg,
    pTime,
    DisableOpt = false,
    ReadOnly = false,
    isPrivateChat,
    setInspectUser,
    searchKey,
    ghostOn,
    isBufferMsg,
    SetUserChatState,
    hideReactions,
    isGroupAdmin,
    withDate }) => {
    const { user } = useSelector((state) => state.user);
    const { chatList } = useSelector((state) => state.chat);
    const format_subject = item?.subject && (searchKey ? messageFormat(item.subject, searchKey) : format_all(item.subject));
    const format_patient1 = item?.patient && (searchKey ? format_patient(item.patient) : format_patient(item.patient));
    const format_message = item.message?.startsWith('\n') ? messageFormat(item?.message?.substring(1), searchKey) : messageFormat(item.message, searchKey);
    const isMention = ((item?.mentionusers && !!item.mentionusers?.length) || item.ccText);
    const MentionUsers = isMention && (searchKey ? format_ccText(item.ccText) : format_ccText(item.ccText));
    const padding = (item?.subject || item?.patient || isMention) && (!item.message?.startsWith('\n')) ? 'pt-1' : '';

    const viewPatientInfo = useCallback(async (patient) => {
        const str = patient;
        const regex = /<@(\d+)>\(([^)]+)\)/; // Regular expression to match the number within <@...>
        const [id] = str.match(regex); // string, name
        if (!id) return;
        toastPromise({
            func: async (resolve, reject) => {
                try {
                    const data = await patientService.list({
                        payload: {
                            query: { id },
                            options: { populate: ["patientAssign", "lastAllocatedSlot", "facilityInfo"] },
                            findOne: true
                        }
                    });
                    if (data?.status === 1) dispatch({ type: CHAT_CONST.SET_INSPECT_PATIENT, payload: data.data });
                    resolve(1);
                } catch (error) {
                    reject(0);
                }
            }, loading: "Fetching patient data", success: "Successfully fetch patient", error: "Couldn't fetch data"
        })
    }, []);

    if (!item?.isMessage) {
        const getTask = async (item) => getTaskDetails({ messageId: item?.id, taskId: item?.taskId, isDepartment: item?.task?.isDepartment, chatList });
        return (
            <ErrorBoundary>
                <div className={`message-content position-relative ${!item?.isMessage ? 'task-msg-border' : ''} ${Boolean(item?.followupTaskMessageId) ? "followup-task" : ""} ${classes}`} style={{ fontSize: user?.fontSize }}>
                    {(!isPrivateChat || (getGhostAccess(user))) &&
                        <MessageHeader item={item} prevMsg={prevMsg} pTime={pTime} forceView={DisableOpt} setInspectUser={!ReadOnly ? setInspectUser : () => { }} />}
                    {!item.isDeleted && !ghostOn && (!DisableOpt && !ReadOnly) &&
                        <MessageDropDown item={item} SetUserChatState={SetUserChatState} moveToOrigin={moveToOrigin} isGroupAdmin={isGroupAdmin} />}
                    {(item?.isForwarded) &&
                        <div className='deleted-message text-color mb-0 d-flex'>
                            <span>
                                <ArrowReturnRight size={user?.fontSize} className="mr-2" />
                            </span>
                            <p className="mb-0" style={{ fontSize: user?.fontSize }}>Forwarded message</p>
                        </div>}
                    {(item.isDeleted) &&
                        <p className='font-weight-normal deleted-message text-color mb-0' style={{ fontSize: user?.fontSize }}>{CONST.TEMPLATE_MSG.DELETE}</p>}
                    {!DisableOpt && !ReadOnly &&
                        <QuotedMessage item={item} moveToOrigin={moveToOrigin} />}

                    {/* // start main message */}

                    {item.task?.attachments && !!item.task?.attachments.length &&
                        <div className="task-attachments p-1">
                            <Card.Header className="position-relative p-0 d-flex justify-content-center transparent-bg">
                                <DocumentPreview item={item} />
                                {/* <div className="position-absolute task-download">
                                        <MuiTooltip title='Download'>
                                            <button className="btn mx-md-1 btn-secondary p-2_8 line-height-1 cursor-pointer task-view-btn" onClick={() => handleDownload(item.task.attachments[0].mediaUrl, item.task.attachments[0].fileName)}>
                                                <Download size={user?.fontSize} />
                                            </button>
                                        </MuiTooltip>
                                    </div> */}
                                {Boolean(item.task?.attachments.length - 1) && <div className="position-absolute task-badge">
                                    <h5 className="mb-0 text-color">
                                        <Badge bg="light">{`+${item.task?.attachments.length - 1}`}</Badge>
                                    </h5>
                                </div>}
                            </Card.Header>
                        </div>}
                    <div className="d-flex justify-content-between mt-1">
                        <div className='m-4px'>
                            {item?.followupTaskMessageId &&
                                <span className='text-color font-weight-bold' style={{ fontSize: user?.fontSize }}>{"Follow-up"}</span>}
                        </div>
                        <MuiTooltip title='View Task'>
                            <button className="btn btn-sm mx-md-1 btn-secondary p-2_8 line-height-1 cursor-pointer task-view-btn" onClick={(e) => {
                                e.preventDefault();
                                getTask(item);
                            }}>
                                <EyeFill size={user?.fontSize} />
                            </button>
                        </MuiTooltip>
                    </div>
                    <div className='m-4px'>
                        {format_subject &&
                            <div className='message-text'>
                                <p className="mb-0 " style={{ fontSize: user?.fontSize }}>
                                    <span className='mr-1 font-weight-semibold' style={{ fontSize: user?.fontSize }}>Subject: </span>
                                    <span className="message-subject" dangerouslySetInnerHTML={{ __html: format_subject }} />
                                </p>
                            </div>}
                        {format_patient1 &&
                            <div className='message-text'>
                                <p className="mb-0 " style={{ fontSize: user?.fontSize }}>
                                    <span className=' mr-1 font-weight-semibold'>Patient: </span>
                                    <span className="message-patient"
                                        dangerouslySetInnerHTML={{ __html: format_patient1 }}
                                        onClick={(e) => {
                                            e?.preventDefault();
                                            viewPatientInfo(item?.patient)
                                        }} />
                                </p>
                            </div>}
                        {isMention && item.ccText &&
                            <div className='message-text'>
                                <p className="mb-0 message-cc d-flex flex-wrap" style={{ fontSize: user?.fontSize }} dangerouslySetInnerHTML={{
                                    __html:
                                        "<span class='mr-1 font-weight-semibold'>CC: </span>" + MentionUsers
                                }} />
                            </div>}
                        <div className={`message-text ${padding}`}>
                            <p className="mb-0" style={{ fontSize: user?.fontSize }}>
                                <span className='font-weight-semibold mr-1'>
                                    Task:
                                </span>
                                <span className="message-task-text" dangerouslySetInnerHTML={{ __html: format_message }} />
                            </p>
                        </div>
                    </div>
                    <MessageCategory item={item} />
                    <MessageFooter
                        item={item}
                        moveToOrigin={DisableOpt && moveToOrigin}
                        isBufferMsg={isBufferMsg}
                        hideReactions={hideReactions}
                        withDate={withDate}
                        SetUserChatState={SetUserChatState}
                    />
                </div>
            </ErrorBoundary>)
    }

    return (
        <ErrorBoundary>
            <div className={`message-content position-relative ${!item?.isMessage ? 'task-msg-border' : ''} ${classes}`} style={{ fontSize: user?.fontSize }}>
                {(!isPrivateChat || (getGhostAccess(user))) &&
                    <MessageHeader item={item} prevMsg={prevMsg} pTime={pTime} forceView={DisableOpt} setInspectUser={!ReadOnly ? setInspectUser : () => { }} />}
                {!item.isDeleted && !ghostOn && (!DisableOpt && !ReadOnly) &&
                    <MessageDropDown item={item} SetUserChatState={SetUserChatState} moveToOrigin={moveToOrigin} isGroupAdmin={isGroupAdmin} />}
                {(item?.isForwarded) &&
                    <div className='deleted-message text-color mb-0 d-flex'>
                        <span>
                            <ArrowReturnRight size={user?.fontSize} className="mr-2" />
                        </span>
                        <p className="mb-0" style={{ fontSize: user?.fontSize }}>Forwarded message</p>
                    </div>}
                {(item.isDeleted) &&
                    <p className='font-weight-normal deleted-message text-color mb-0' style={{ fontSize: user?.fontSize }}>{CONST.TEMPLATE_MSG.DELETE}</p>}
                {!DisableOpt && !ReadOnly &&
                    <QuotedMessage item={item} moveToOrigin={moveToOrigin} />}
                <div className='m-4px'>
                    {format_subject &&
                        <div className='message-text'>
                            <p className="mb-0 " style={{ fontSize: user?.fontSize }}>
                                <span className='mr-1 font-weight-semibold' style={{ fontSize: user?.fontSize }}>Subject: </span>
                                <span className="message-subject" dangerouslySetInnerHTML={{ __html: format_subject }} />
                            </p>
                        </div>}
                    {format_patient1 &&
                        <div className='message-text'>
                            <p className="mb-0" style={{ fontSize: user?.fontSize }}>
                                <span className=' mr-1 font-weight-semibold'>Patient: </span>
                                <span className="message-patient"
                                    dangerouslySetInnerHTML={{ __html: format_patient1 }}
                                    onClick={(e) => {
                                        e?.preventDefault();
                                        viewPatientInfo(item?.patient)
                                    }} />
                            </p>
                        </div>}
                    {isMention && item.ccText &&
                        <div className='message-text'>
                            <p className="mb-0 message-cc d-flex flex-wrap" style={{ fontSize: user?.fontSize }} dangerouslySetInnerHTML={{
                                __html: "<span class='mr-1 font-weight-semibold'>CC: </span>" + MentionUsers
                            }} />
                        </div>}
                    <div className={`message-text ${padding}`}>
                        <p className="mb-0" style={{ fontSize: user?.fontSize }}>
                            {(item.subject || item.patient || (isMention && item.ccText)) && (!item.message?.startsWith('\n')) &&
                                <span className='font-weight-semibold mr-1'>
                                    {`${item.isMessage ? 'Message: ' : 'Task: '}`}
                                </span>}
                            <span className="message-task-text" dangerouslySetInnerHTML={{ __html: format_message }} />
                        </p>
                    </div>
                </div>
                <MessageCategory item={item} />
                <MessageFooter
                    withDate={withDate}
                    item={item}
                    moveToOrigin={DisableOpt && moveToOrigin}
                    isBufferMsg={isBufferMsg}
                    hideReactions={hideReactions}
                    SetUserChatState={SetUserChatState} />
            </div>
        </ErrorBoundary>);
}

const DocumentPreview = ({ item, maxHeight = "160px" }) => {
    const previewDoc = useMemo(() => item.task?.attachments[0], [item.task?.attachments]);

    if (previewDoc.mediaType.includes("image"))
        return (
            <img style={{ maxHeight }} className="card-img-top" src={getImageURL(previewDoc.mediaUrl, "128x128", false)} alt=""
                onClick={() => onImageGalleryOpen(null, item.task?.attachments)} />
        )
    else if (previewDoc.mediaType.includes("video"))
        return (
            <video className="img-fluid rounded border" style={{ maxHeight }}
                onClick={() => onImageGalleryOpen(null, item.task?.attachments)}>
                <source src={previewDoc.mediaUrl} type="video/mp4" />
                <source src={previewDoc.mediaUrl} type="video/ogg" />
                Your browser does not support the video tag.
            </video>
        )
    else if (previewDoc.mediaType.includes("audio"))
        return (
            <audio controls id={'audio-' + 999} className='audio-input' preload='metadata' title='audioFile' style={{ maxHeight }}>
                <source src={getAudioUrl(previewDoc.mediaUrl, false)} type="audio/ogg" />
                <source src={getAudioUrl(previewDoc.mediaUrl, false)} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        )
    else if (previewDoc.mediaType.includes("pdf"))
        return (
            <div className="btn btn-primary btn-icon rounded-circle text-light my-2"
                onClick={() => {
                    changeModel(CHAT_MODELS.PDF_VIEWER);
                    dispatch({ type: CHAT_CONST.SET_PDF_URL, payload: previewDoc.mediaUrl, fileName: previewDoc.fileName, id: -1 });
                }}>
                <PictureAsPdf className="text-center" />
            </div>
        )
    return (
        <div className="btn btn-primary btn-icon rounded-circle text-light my-2">
            <DocumentScanner className="text-center" />
        </div>
    )
}