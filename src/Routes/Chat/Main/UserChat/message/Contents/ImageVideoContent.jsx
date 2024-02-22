import { useMemo } from "react"
import { onImageGalleryOpen } from "../Message"
import { MessageDropDown } from "../Options/MessageDropDown"
import MessageHeader from "../Options/MessageHeader"
import MessageFooter from "../Options/MessageFooter"
import { format_all, getChatImageURL, messageFormat, sanitizeHTMLText, textToShow } from "redux/common"
import { PopupOpt } from "../Options/PopupOpt"
import { ArrowReturnRight } from "react-bootstrap-icons"
import { CONST } from "utils/constants"
import MessageCategory from "../Options/MessageCategory"
import { useSelector } from "react-redux"

export const ImageVideoContent = ({ item,
    classes,
    onPopupView,
    moveToOrigin,
    pTime,
    prevMsg,
    DisableOpt = false,
    ReadOnly = false,
    SetUserChatState,
    setInspectUser,
    SetPopupData,
    searchKey,
    ghostOn,
    isBufferMsg,
    hideReactions,
    isGroupAdmin,
    withDate }) => {
    const { user } = useSelector(state => state.user);
    const format_message = useMemo(() => sanitizeHTMLText(item?.message && searchKey ? messageFormat(item.message, searchKey) : format_all(item.message)), [item.message, searchKey]);
    const format_filename = useMemo(() => sanitizeHTMLText(item?.fileName && searchKey ? textToShow(item.fileName, searchKey) : item.fileName, {}), [item.fileName, searchKey]);
    try {
        return (
            <div className={`message-content position-relative h-200  ${classes}`} style={{ fontSize: user?.fontSize }}>
                <MessageHeader item={item} prevMsg={prevMsg} pTime={pTime} forceView={DisableOpt} setInspectUser={!ReadOnly ? setInspectUser : () => { }} />
                {!item.isDeleted && !ghostOn && !DisableOpt && !ReadOnly && <>
                    <MessageDropDown
                        item={item}
                        SetUserChatState={SetUserChatState}
                        SetPopupData={SetPopupData}
                        moveToOrigin={moveToOrigin}
                        isGroupAdmin={isGroupAdmin}
                    />
                    {/* && !navigator?.userAgentData?.mobile */}
                    {!ReadOnly && (item.mediaType?.startsWith(CONST.MEDIA_TYPE.IMAGE) || item.mediaType?.startsWith(CONST.MEDIA_TYPE.VIDEO)) &&
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
                    <p className='deleted-message text-secondary mb-0' style={{ fontSize: user?.fontSize }}>{`This ${item.isMessage ? 'Message' : 'Task'} was Deleted`}</p>}
                <div className="form-row">
                    <div className="col">
                        <div className="popup-media my-1">
                            {item.mediaType.startsWith(CONST.MEDIA_TYPE.IMAGE) &&
                                <img className="img-fluid rounded hw-200" src={getChatImageURL({ imageurl: item.mediaUrl, cache: false, size: '200x200' })} alt="" onClick={() => onImageGalleryOpen(item.id)} />}
                            {item.mediaType.startsWith(CONST.MEDIA_TYPE.VIDEO) &&
                                <video width="320" height="240" controls>
                                    <source src={item.mediaUrl} type="video/mp4" />
                                    <source src={item.mediaUrl} type="video/ogg" />
                                    Your browser does not support the video tag.
                                </video>}
                        </div>
                        <div className="message-text">
                            <div className="mr-1">File:</div>
                            <p className="mb-0" title={`File: ${item?.fileName}`} style={{ fontSize: user?.fontSize }} dangerouslySetInnerHTML={{ __html: format_filename }} />
                        </div>
                        {item?.message &&
                            <div className="mt-1 message-text">
                                <p className="message-task-text" dangerouslySetInnerHTML={{ __html: format_message }} style={{ fontSize: user?.fontSize }}></p>
                            </div>}
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
        );
    }
    catch (error) {
        console.error(error);
    }
}