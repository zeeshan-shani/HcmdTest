import { useMemo } from "react";
import { ArrowReturnRight } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import { format_all, getAudioUrl, messageFormat, sanitizeHTMLText, textToShow } from "redux/common";
import { MessageDropDown } from "../Options/MessageDropDown"
import MessageCategory from "../Options/MessageCategory";
import MessageFooter from "../Options/MessageFooter"
import MessageHeader from "../Options/MessageHeader"

export const AudioContent = ({ item,
    classes,
    SetUserChatState,
    moveToOrigin,
    prevMsg,
    pTime,
    DisableOpt = false,
    ReadOnly = false,
    setInspectUser,
    searchKey,
    ghostOn,
    isBufferMsg,
    hideReactions,
    isGroupAdmin,
    withDate }) => {
    const { user } = useSelector(state => state.user);
    const format_message = useMemo(() => sanitizeHTMLText(item.message && searchKey ? messageFormat(item.message, searchKey) : format_all(item.message)), [item.message, searchKey]);
    const format_filename = useMemo(() => sanitizeHTMLText(item?.fileName && searchKey ? textToShow(item.fileName, searchKey) : item.fileName, {}), [item?.fileName, searchKey]);
    try {
        return (
            <div className={`message-content position-relative ${classes}`} style={{ fontSize: user?.fontSize }}>
                <MessageHeader item={item} prevMsg={prevMsg} pTime={pTime} forceView={DisableOpt} setInspectUser={!ReadOnly ? setInspectUser : () => { }} />
                {!item.isDeleted && !ghostOn && !DisableOpt && !ReadOnly &&
                    <MessageDropDown item={item} SetUserChatState={SetUserChatState} moveToOrigin={moveToOrigin} isGroupAdmin={isGroupAdmin} />}
                {(item?.isForwarded) &&
                    <div className='deleted-message text-secondary mb-0 d-flex' style={{ fontSize: user?.fontSize }}>
                        <span>
                            <ArrowReturnRight size={user?.fontSize} className="mr-2" />
                        </span>
                        <p className="mb-0">Forwarded message</p>
                    </div>}
                {(item.isDeleted) &&
                    <p className='deleted-message text-secondary mb-0' style={{ fontSize: user?.fontSize }}>
                        {`This ${item.isMessage ? 'Message' : 'Task'} was Deleted`}
                    </p>}
                <div className="document my-1">
                    <audio controls id={item.id}>
                        <source src={getAudioUrl(item.mediaUrl, false)} type="audio/ogg" />
                        <source src={getAudioUrl(item.mediaUrl, false)} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
                <div className="message-text">
                    <div className="mr-1">File:</div>
                    <p className="mb-0" title={`File: ${item?.fileName}`} style={{ fontSize: user?.fontSize }} dangerouslySetInnerHTML={{ __html: format_filename }} />
                </div>
                {item?.message &&
                    <div className="mt-1 message-text">
                        <div className="mr-1 message-task-text">
                            {`${(item.subject || item.patient) ? (item.isMessage ? 'Message: ' : 'Task: ') : ''}`}
                        </div>
                        <p className="" dangerouslySetInnerHTML={{ __html: format_message }} style={{ fontSize: user?.fontSize }} />
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