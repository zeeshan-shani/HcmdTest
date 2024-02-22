import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeModel } from 'redux/actions/modelAction';
import useDebounce from 'services/hooks/useDebounce';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { CONST, SOCKET } from 'utils/constants';
import { generatePayload, getImageURL } from 'redux/common';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { dispatch } from 'redux/store';
import { getSendToUsers } from 'redux/actions/chatAction';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { getPrivateChatUser } from 'services/helper';
import chatService from 'services/APIs/services/chatService';
import { showSuccess } from 'utils/package_config/toast';

export default function ForwardMessage() {
    const { user } = useSelector((state) => state.user);
    const { activeChat } = useSelector((state) => state.chat);
    const [isLoading, setLoading] = useState(false);
    const [chatsList, setChatsList] = useState([]);
    const [searchUser, setSearchUser] = useState("");
    const newUser = useDebounce(searchUser, 500);
    const [checked, setChecked] = useState(
        (activeChat?.id && activeChat?.forwardMsg?.isFollowupTask)
            ? [activeChat.id] : []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            let payload = await generatePayload({
                // rest: { includeChatUserDetails: false },
                options: { populate: ["chatUser"] },
                isCount: true
            });
            if (newUser) payload.query.search = [newUser];
            const data = await chatService.chatList({ payload });
            if (data?.status === 1)
                setChatsList(data.data.rows)
            setLoading(false);
        })();
    }, [newUser]);

    // Add / Remove checked item from list
    const handleCheck = useCallback((event) => {
        let updatedList = [...checked];
        if (event.target.checked)
            updatedList = [...checked, Number(event.target.value)];
        else {
            const index = updatedList.findIndex((itemId) => itemId === Number(event.target.value));
            updatedList.splice(index, 1);
        }
        setChecked(updatedList);
    }, [checked]);

    const onCloseHandler = useCallback(() => {
        changeModel("");
        dispatch({ type: CHAT_CONST.SET_FORWARD_MSG, payload: null });
    }, []);

    const onSendForward = useCallback(() => {
        const chats = [];
        for (let index = 0; index < checked.length; index++) {
            const chat = chatsList.find((item) => item.id === checked[index]);
            if (chat) {
                const chatData = chat;
                chats.push({
                    chatId: chatData.id,
                    type: chatData.type,
                    sendTo: getSendToUsers(user.id, chatData.type, chatData.users),
                })
            }
        }
        const payload = {
            messageData: activeChat.forwardMsg,
            isFollowupTask: activeChat?.forwardMsg?.isFollowupTask || false,
            chats,
        }
        SocketEmiter(SOCKET.REQUEST.FORWARD_MESSAGE, payload);
        showSuccess(activeChat?.forwardMsg?.isFollowupTask ? "Followup send Successfully." : `Message Forwarded Successfully.`);
        onCloseHandler();
    }, [activeChat.forwardMsg, checked, onCloseHandler, chatsList, user.id]);

    if (activeChat.forwardMsg)
        return (<>
            <div className="modal modal-lg-fullscreen fade show d-block" data-toggle="modal" id="startConversation" tabIndex={-1} role="dialog" aria-labelledby="startConversationLabel" aria-modal="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="startConversationLabel">
                                {activeChat?.forwardMsg?.isFollowupTask ? "Send Followup To..." : "Forward To..."}
                            </h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onCloseHandler}>
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body p-0 hide-scrollbar">
                            <div className="row">
                                <div className="col-12">
                                    <div className="form-inline w-100 p-2 border-bottom">
                                        <div className="input-group w-100 bg-light">
                                            <input type="text" className="form-control form-control-md search border-right-0 pr-0" placeholder="Search" value={searchUser} onChange={(e) => setSearchUser(e.target.value)} />
                                            <div className="input-group-append">
                                                <div className="input-group-text border-left-0" role="button">
                                                    <svg className="hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    {isLoading &&
                                        <div><Loader height={'80px'} /></div>}
                                    <ul className="list-group list-group-flush">
                                        {!!chatsList?.length && <>
                                            {chatsList.map((item) => {
                                                if (item.type === CONST.CHAT_TYPE.GROUP) {
                                                    const { name, image } = item;
                                                    return (
                                                        <li className={`list-group-item ${item.allowOnlyAdminMessage ? 'opacity-50' : ''}`} key={item.id}>
                                                            <div className="media">
                                                                <div className={`avatar avatar-${item.profileStatus} mr-2`}>
                                                                    <img src={getImageURL(image, '50x50')} alt="" />
                                                                </div>
                                                                <div className="media-body">
                                                                    <h6 className="text-truncate">
                                                                        <div className="text-reset username-text">{name}</div>
                                                                    </h6>
                                                                    <p className="text-muted mb-0">
                                                                        {item.allowOnlyAdminMessage && 'Only Admin can send messages'}
                                                                    </p>
                                                                </div>
                                                                {!item.allowOnlyAdminMessage &&
                                                                    <div className="media-options">
                                                                        <div className="custom-control custom-checkbox">
                                                                            <input
                                                                                className="custom-control-input"
                                                                                id={`chx-user-${item.id}`}
                                                                                name={`chx-users`}
                                                                                type="checkbox"
                                                                                value={item.id}
                                                                                checked={checked.includes(item.id)}
                                                                                onChange={handleCheck}
                                                                            />
                                                                            <label className="custom-control-label" htmlFor={`chx-user-${item.id}`} />
                                                                        </div>
                                                                    </div>}
                                                            </div>
                                                            <label className="media-label" htmlFor={`chx-user-${item.id}`} />
                                                        </li>);
                                                } else if (item.type === CONST.CHAT_TYPE.PRIVATE) {
                                                    const { name = "", profilePicture = "" } = getPrivateChatUser(item);
                                                    if (!name) return;
                                                    return (
                                                        <li className="list-group-item" key={item.id}>
                                                            <div className="media">
                                                                <div className={`avatar mr-2`}>
                                                                    <img src={getImageURL(profilePicture, '50x50')} alt="" />
                                                                </div>
                                                                <div className="media-body">
                                                                    <h6 className="text-truncate">
                                                                        <div className="text-reset username-text">{name}</div>
                                                                    </h6>
                                                                </div>
                                                                <div className="media-options">
                                                                    <div className="custom-control custom-checkbox">
                                                                        <input
                                                                            className="custom-control-input"
                                                                            id={`chx-user-${item.id}`}
                                                                            name={`chx-users`}
                                                                            type="checkbox"
                                                                            value={item.id}
                                                                            checked={checked.includes(item.id)}
                                                                            onChange={handleCheck}
                                                                        />
                                                                        <label className="custom-control-label" htmlFor={`chx-user-${item.id}`} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <label className="media-label" htmlFor={`chx-user-${item.id}`} />
                                                        </li>);
                                                }
                                                return null;
                                            })}
                                        </>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {!!checked.length &&
                            <div className="modal-footer text-right">
                                <button className="btn btn-primary send-icon text-light p-4_8" onClick={onSendForward}>
                                    Send
                                </button>
                            </div>}
                    </div>
                </div>
            </div>
        </>);
}
