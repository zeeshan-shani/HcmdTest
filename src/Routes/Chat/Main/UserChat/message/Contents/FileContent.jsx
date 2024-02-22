import { useCallback, useMemo } from "react";
import { ArrowReturnRight } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import { changeModel } from "redux/actions/modelAction";
import { format_all, messageFormat, sanitizeHTMLText, textToShow } from "redux/common";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { dispatch } from "redux/store";
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import MessageCategory from "../Options/MessageCategory";
import { MessageDropDown } from "../Options/MessageDropDown";
import MessageFooter from "../Options/MessageFooter";
import MessageHeader from "../Options/MessageHeader";
import { PopupOpt } from "../Options/PopupOpt";

export const FileContent = ({
    item,
    classes,
    moveToOrigin,
    prevMsg,
    pTime,
    DisableOpt = false,
    ReadOnly = false,
    SetUserChatState,
    setInspectUser,
    onPopupView,
    searchKey,
    ghostOn,
    isBufferMsg,
    isGroupAdmin,
    hideReactions,
    withDate
}) => {
    const { user } = useSelector(state => state.user);
    const format_message = useMemo(() => sanitizeHTMLText(item?.message && searchKey ? messageFormat(item.message, searchKey) : format_all(item.message), [item.message, searchKey]), [item?.message, searchKey]);
    const format_filename = useMemo(() => sanitizeHTMLText(item?.fileName && searchKey ? textToShow(item.fileName, searchKey) : item.fileName, [item.fileName, searchKey], {}), [item?.fileName, searchKey]);
    const onClickOpenFile = useCallback(() => {
        changeModel(CHAT_MODELS.PDF_VIEWER);
        dispatch({ type: CHAT_CONST.SET_PDF_URL, payload: item.mediaUrl, fileName: item.fileName, id: item.id });
    }, [item.mediaUrl, item.fileName, item.id]);

    try {
        return (
            <div className={`message-content position-relative ${classes}`} style={{ fontSize: user?.fontSize }}>
                <MessageHeader item={item} prevMsg={prevMsg} pTime={pTime} forceView={DisableOpt} setInspectUser={!ReadOnly ? setInspectUser : () => { }} />
                {!item.isDeleted && !ghostOn && !DisableOpt && !ReadOnly && <>
                    <MessageDropDown item={item} SetUserChatState={SetUserChatState} moveToOrigin={moveToOrigin} isGroupAdmin={isGroupAdmin} />
                    {!ReadOnly && (item.mediaType?.startsWith("application/pdf")) &&
                        <PopupOpt onPopupView={onPopupView} item={item} />}
                </>}
                {(item?.isForwarded) &&
                    <div className='deleted-message text-secondary mb-0 d-flex' style={{ fontSize: user?.fontSize }}>
                        <span>
                            <ArrowReturnRight size={user?.fontSize} className="mr-2" />
                        </span>
                        <p className="mb-0">Forwarded message</p>
                    </div>}
                {(item.isDeleted) &&
                    <p className='font-weight-lighter deleted-message text-secondary mb-0' style={{ fontSize: user?.fontSize }}>
                        {`This ${item.isMessage ? 'Message' : 'Task'} was Deleted`}
                    </p>}
                <div className="document my-1 cursor-pointer" onClick={onClickOpenFile}>
                    {item.mediaType.endsWith("pdf") ?
                        <div className="btn btn-primary btn-icon rounded-circle text-light mr-2">
                            <svg className="hw-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        : <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-icon rounded-circle text-light mr-2">
                            <svg className="hw-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                            </svg>
                        </a>}
                    <div className="document-body text-truncate">
                        <h6 className="text-truncate message-text" title={`File: ${item?.fileName}`} dangerouslySetInnerHTML={{ __html: format_filename }} />
                        <ul className="list-inline small mb-0">
                            <li className="list-inline-item">
                                <p className="text-muted text-uppercase mb-0" style={{ fontSize: user?.fontSize }}>{item?.mediaType?.split("/").reverse()[0]}</p>
                            </li>
                        </ul>
                    </div>
                </div>
                {item?.message &&
                    <div className="message-text">
                        <p className="message-task-text" dangerouslySetInnerHTML={{ __html: format_message }} style={{ fontSize: user?.fontSize }} />
                    </div>}
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
        );
    } catch (error) {
        console.error(error);
    }
}