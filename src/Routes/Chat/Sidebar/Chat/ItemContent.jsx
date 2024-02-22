import { useMemo } from "react";
import { CONST } from "utils/constants";
import { useSelector } from "react-redux";
import { getMediaSVG, getTimeLabel } from ".";
import { format_all, getImageURL, getProfileStatus } from "redux/common";
import { Check, CheckAll } from "react-bootstrap-icons";
import { NotificationBadge } from "Components/components";
import { getGhostAccess } from "utils/permission";
import ErrorBoundary from "Components/ErrorBoundry";
import { MODEL_CONST } from "redux/constants/modelConstants";
import { dispatch } from "redux/store";

export const GroupItemContent = ({
    name, image, item, myChatDetails
}) => {
    const { user } = useSelector(state => state.user);
    const lastMessage = useMemo(() => item?.messages && item?.messages[0], [item?.messages]);
    const chatUpdatedTime = useMemo(() => (lastMessage ? lastMessage.createdAt : item.updatedAt), [lastMessage, item.updatedAt]);
    const msgText = useMemo(() => (lastMessage?.subject || lastMessage?.message) &&
        format_all(`${lastMessage?.sendByDetail?.name}: ${lastMessage.subject ? `Subject: ${lastMessage.subject}` : lastMessage.message}`), [lastMessage]);

    return (
        <ErrorBoundary>
            <div className="avatar">
                <img src={getImageURL(image, '50x50')} alt="" onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                        type: MODEL_CONST.USER_IMAGE_DATA, payload: {
                            name,
                            image,
                            id: "user-chat-image",
                            isEditable: false
                        }
                    })
                }} />
            </div>
            <div className="contacts-content">
                <div className="contacts-info">
                    <h6 className="chat-name text-truncate username-text" style={{ fontSize: user?.fontSize }}>{name}</h6>
                    <p className="chat-time light-text-70 mb-0" style={{ fontSize: user?.fontSize }}>{getTimeLabel(chatUpdatedTime)}</p>
                </div>
                {lastMessage ? <>{
                    !lastMessage?.isDeleted ? <>
                        {!lastMessage?.mediaType ?
                            <ChatTexts myChatDetails={myChatDetails}>
                                {lastMessage.sendBy === user.id && <>
                                    {lastMessage.lastMessageIsRead ? <CheckAll size={16} fill="#34b7f1" /> : <Check size={16} />}</>}
                                {msgText ?
                                    <p className="text-truncate mr-1 mb-0 in-one-line" dangerouslySetInnerHTML={{ __html: msgText }} style={{ fontSize: user?.fontSize }} />
                                    :
                                    <p className="text-truncate mr-1 mb-0 in-one-line" style={{ fontSize: user?.fontSize }}>{CONST.TEMPLATE_MSG.UPDATE}</p>
                                }
                            </ChatTexts>
                            :
                            <ChatTexts myChatDetails={myChatDetails}>
                                {item.sendBy === user.id && <>
                                    {lastMessage.lastMessageIsRead ? <CheckAll size={16} fill="#34b7f1" /> : <Check size={16} />}</>}
                                <p className="text-truncate mr-1 mb-0 in-one-line" style={{ fontSize: user?.fontSize }}>
                                    <>{`${lastMessage?.sendByDetail?.name}: `}</>
                                    <span className="mr-1">{getMediaSVG(lastMessage?.mediaType.split("/")[0], user?.fontSize ? user.fontSize : 18)}</span>
                                    <>{lastMessage?.fileName}</>
                                </p>
                            </ChatTexts>}</>
                        :
                        lastMessage?.isDeleted &&
                        <ChatTexts myChatDetails={myChatDetails}>
                            <p className="fs-14 text-truncate mr-1 mb-0 in-one-line" style={{ fontSize: user?.fontSize }}>
                                {`${lastMessage?.sendByDetail?.name}: ${CONST.TEMPLATE_MSG.DELETE}`}</p>
                        </ChatTexts>
                }</> :
                    <ChatTexts myChatDetails={myChatDetails}>
                        <p className="text-truncate" style={{ fontSize: user?.fontSize }}>{CONST.TEMPLATE_MSG.START_CHAT}</p>
                    </ChatTexts>
                }
            </div>
        </ErrorBoundary>
    );
}

export const PrivateItemContent = ({ name, profilePicture, profileStatus, item, myChatDetails }) => {
    const { user } = useSelector(state => state.user);
    const lastMessage = useMemo(() => item?.messages && item?.messages[0], [item?.messages]);
    const chatUpdatedTime = useMemo(() => (lastMessage ? lastMessage.createdAt : item.updatedAt), [lastMessage, item.updatedAt]);
    const msgText = useMemo(() => (lastMessage?.subject || lastMessage?.message) &&
        format_all(`${lastMessage.subject ? `Subject: ${lastMessage.subject}` : lastMessage.message}`), [lastMessage])
    const ghostOnly = useMemo(() => getGhostAccess(user) && !item?.users.includes(user.id), [item?.users, user]);

    return (
        <ErrorBoundary>
            <div className={`avatar ${!ghostOnly ? getProfileStatus(profileStatus) : ''}`}>
                <img src={getImageURL(profilePicture, '50x50')} alt="" onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                        type: MODEL_CONST.USER_IMAGE_DATA, payload: {
                            name,
                            image: profilePicture,
                            id: "user-chat-image",
                            isEditable: false
                        }
                    })
                }} />
            </div>
            <div className="contacts-content">
                <div className="contacts-info">
                    <h6 className="chat-name text-truncate username-text" style={{ fontSize: user?.fontSize }}>
                        {ghostOnly ?
                            item.chatusers
                                .filter(item => (!item?.isGhostChat))
                                .map((usr) => usr?.user?.name).join(' & ')
                            : name}
                    </h6>
                    <p className="chat-time light-text-70 mb-0" style={{ fontSize: user?.fontSize }}>{getTimeLabel(chatUpdatedTime)}</p>
                </div>
                {lastMessage ? <>{
                    !lastMessage?.isDeleted ? <>
                        {!lastMessage?.mediaType ?
                            <ChatTexts myChatDetails={myChatDetails}>
                                {lastMessage.sendBy === user.id && <>
                                    {lastMessage.lastMessageIsRead ? <CheckAll size={16} fill="#34b7f1" /> : <Check size={16} />}</>}
                                {msgText ?
                                    <p className="text-truncate mr-1 mb-0 in-one-line" dangerouslySetInnerHTML={{ __html: msgText }} style={{ fontSize: user?.fontSize }} />
                                    :
                                    <p className="text-truncate mr-1 mb-0 in-one-line" style={{ fontSize: user?.fontSize }}>{CONST.TEMPLATE_MSG.UPDATE}</p>
                                }
                            </ChatTexts>
                            : <ChatTexts myChatDetails={myChatDetails}>
                                {item.sendBy === user.id && <>
                                    {lastMessage.lastMessageIsRead ? <CheckAll size={16} fill="#34b7f1" /> : <Check size={16} />}</>}
                                <p className="text-truncate mr-1 mb-0 in-one-line" style={{ fontSize: user?.fontSize }}>
                                    <span className="mr-1">{getMediaSVG(lastMessage?.mediaType.split("/")[0], user?.fontSize ? user.fontSize : 18)}</span>
                                    <>{lastMessage?.fileName}</>
                                </p>
                            </ChatTexts>}
                    </>
                        :
                        lastMessage?.isDeleted &&
                        <ChatTexts myChatDetails={myChatDetails}>
                            <p className="text-truncate" style={{ fontSize: user?.fontSize }}>{CONST.TEMPLATE_MSG.DELETE}</p>
                        </ChatTexts>
                }</> :
                    <ChatTexts myChatDetails={myChatDetails}>
                        <p className="text-truncate" style={{ fontSize: user?.fontSize }}>{CONST.TEMPLATE_MSG.START_CHAT}</p>
                    </ChatTexts>
                }
            </div>
        </ErrorBoundary>
    );
}

export const ChatTexts = (props) => {
    return (
        <div className="contacts-texts in-one-line">
            <div className="d-flex align-items-center flex-60 light-text-70">
                {props.children}
            </div>
            <NotificationBadge myChatDetails={props.myChatDetails} />
        </div>
    )
}
