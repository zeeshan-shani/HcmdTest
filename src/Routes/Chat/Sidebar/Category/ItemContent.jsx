import { useMemo } from "react";
import moment from "moment-timezone";
import { format_all } from "redux/common";
import { useSelector } from "react-redux";
import { getTimeLabel } from "../Chat";
import ErrorBoundary from "Components/ErrorBoundry";

export const ItemContent = ({ item }) => {
    const { user } = useSelector(state => state.user);
    const { name, colorCode } = item;

    const { lastMessage, chatUpdatedTime = moment().format(), unreadMentionCount } = useMemo(() => {
        let [{ message }] = !!item.messageTaskCategories?.length ? item.messageTaskCategories : [{}];
        let [{ unreadMentionCount = 0 }] = !!item.categoryChats?.length ? item.categoryChats : [{}];
        let chatUpdatedTime = message?.createdAt || "";
        let lastMessage = (message?.subject || message?.message) &&
            format_all(`${message.subject ? `Subject: ${message.subject}` : message.message}`);
        return { chatUpdatedTime, lastMessage, unreadMentionCount }
    }, [item?.messageTaskCategories, item?.categoryChats]);

    return (
        <ErrorBoundary>
            <div className='color-circle mr-1' style={colorCode ?
                { background: colorCode, minWidth: "18px" } : {}} />
            <div className="contacts-content">
                <div className="contacts-info">
                    <h6 className="chat-name text-truncate username-text" style={{ fontSize: user?.fontSize }}>{name}</h6>
                    {chatUpdatedTime &&
                        <p className="chat-time light-text-70 mb-0" style={{ fontSize: user?.fontSize }}>{getTimeLabel(chatUpdatedTime)}</p>}
                </div>
                <ChatTexts item={item} unreadMentionCount={unreadMentionCount}>
                    <p className="text-truncate" style={{ fontSize: user?.fontSize }}>
                        {lastMessage}
                    </p>
                </ChatTexts>
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
            {!!props.unreadMentionCount &&
                <div className="d-flex align-items-center badge bg-at-the-rate badge-rounded text-white position-relative badge-custom px-2">
                    {props.unreadMentionCount < 99 ?
                        <span>{`${props.unreadMentionCount}`}</span>
                        : <span>{99}<span className="badge-plus">+</span></span>}
                </div>}
        </div>
    )
}