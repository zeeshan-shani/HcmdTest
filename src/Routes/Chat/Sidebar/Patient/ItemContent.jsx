import { useMemo } from "react";
import { format_all, getImageURL } from "redux/common";
import ErrorBoundary from "Components/ErrorBoundry";
import { getPatientName } from "Components/Modals/PatientInfoModal";
import { getTimeLabel } from "../Chat";
import { useSelector } from "react-redux";

export const ItemContent = ({ item }) => {
    const { user } = useSelector(state => state.user);

    const { name, image, lastMessage, chatUpdatedTime } = useMemo(() => {
        let name = getPatientName(item?.lastName, item?.firstName)
        let image = item?.profilePicture;
        let [{ message }] = !!item.mentionusers.length ? item.mentionusers : [{}];
        let chatUpdatedTime = message?.createdAt || "";
        let lastMessage = (message?.subject || message?.message) &&
            format_all(`${message?.subject ? `Subject: ${message.subject}` : message?.message}`);
        return { chatUpdatedTime, lastMessage, name, image };
    }, [item]);

    return (
        <ErrorBoundary>
            <div className="avatar">
                <img src={getImageURL(image, '50x50')} alt="" />
            </div>
            <div className="contacts-content">
                <div className="contacts-info">
                    <h6 className="chat-name text-truncate username-text" style={{ fontSize: user?.fontSize }}>{name}</h6>
                    <p className="chat-time light-text-70 mb-0" style={{ fontSize: user?.fontSize }}>{chatUpdatedTime ? getTimeLabel(chatUpdatedTime) : ''}</p>
                </div>
                <ChatTexts item={item} userId={user.id}>
                    <p className="text-truncate" style={{ fontSize: user?.fontSize }}>
                        {lastMessage}
                    </p>
                </ChatTexts>
            </div>
        </ErrorBoundary>
    );
}

export const ChatTexts = (props) => {
    const patientAssign = props?.item?.patientAssigns && props?.item?.patientAssigns.find(i => i.userId === props.userId);
    return (
        <div className="contacts-texts in-one-line">
            <div className="d-flex align-items-center flex-60 light-text-70">
                {props.children}
            </div>
            {patientAssign && patientAssign.userId === props.userId && !!patientAssign.unreadMentionCount &&
                <div className="d-flex align-items-center badge bg-at-the-rate badge-rounded text-white position-relative badge-custom px-2">
                    {patientAssign.unreadMentionCount < 99 ?
                        <span>{`${patientAssign.unreadMentionCount}`}</span>
                        : <span>{99}<span className="badge-plus">+</span></span>}
                </div>}
        </div>
    )
}
