import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import { setUserHandler } from 'Routes/Chat/Sidebar/Chat';
import { generatePayload, getImageURL, toastPromise } from 'redux/common';
import { MuiTooltip } from 'Components/components';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { CreatePrivateChat, loadUserChatList } from 'redux/actions/chatAction';
import { ConnectInNewChat, notifyUsers } from 'utils/wssConnection/Socket';
import { BuildingFillCheck, ChatDotsFill, Envelope, GeoAltFill, QuestionCircle, StarFill, TagFill, TelephoneFill } from 'react-bootstrap-icons';
import { dispatch } from 'redux/store';
import ModalReactstrap from './Modal';
import { useSelector } from 'react-redux';

export const getListdata = (insUser) => {
    return [
        { title: 'Email', content: insUser.email, icon: <Envelope className='text-muted' /> },
        { title: 'Company Name', content: insUser.companyName, icon: <BuildingFillCheck className='text-muted' /> },
        { title: 'Primary Designation', content: insUser?.companyRoleData?.name, icon: <TagFill className='text-muted' /> },
        { title: 'Extension', content: insUser.extension, icon: <StarFill className='text-muted' /> },
        { title: 'Phone', content: insUser.phone, icon: <TelephoneFill className='text-muted' /> },
        { title: 'Address', content: insUser.address, icon: <GeoAltFill className='text-muted' /> },
        { title: 'About', content: insUser.about, icon: <QuestionCircle className='text-muted' /> },
    ]
}

export default function UserInfoModal({ showModal, inspectUser }) {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.user);
    const { activeChat } = useSelector(state => state.chat);
    const onClose = useCallback(() => dispatch({ type: CHAT_CONST.SET_INSPECT_USER, payload: null }), []);
    const onClickUserChat = useCallback(async () => {
        await toastPromise({
            func: async (myResolve, myReject) => {
                try {
                    const res = await CreatePrivateChat(inspectUser?.id, user.id);
                    const payload = await generatePayload({
                        // rest: { includeChatUserDetails: false },
                        options: {
                            "populate": ["lastMessage", "chatUser"],
                        },
                        isCount: true
                    });
                    if (res?.status === 1) {
                        onClose();
                        loadUserChatList(payload);
                        notifyUsers(res.data.createdBy, res.data.id, res.data.users, res.data.type);
                        setUserHandler({ chat: res.data, activeChatId: activeChat?.id, userId: user.id, navigate });
                        ConnectInNewChat(res.data, user.id);
                    } else if (res?.status === 2) {
                        onClose();
                        loadUserChatList(payload);
                        setUserHandler({ chat: res.data, activeChatId: activeChat?.id, userId: user.id, navigate });
                    }
                    myResolve("OK");
                } catch (error) {
                    myReject("Error");
                }
            },
            loading: "Requesting Chat",
            success: <b>Successfully Get Chat</b>,
            error: <b>Could not load Chat.</b>,
            options: { id: "get-user-data" }
        })
    }, [activeChat?.id, navigate, onClose, inspectUser?.id, user?.id]);

    const userdataList = useMemo(() => inspectUser && getListdata(inspectUser), [inspectUser]);

    return (
        <ModalReactstrap
            show={showModal ? true : false}
            header="User Info"
            toggle={onClose}
            Modalprops={{ modalClassName: 'hide-scrollbar', className: 'user-info-modal' }}
            size="lg"
            body={<>
                {showModal &&
                    <div className="friends px-0 py-2 p-xxl-3">
                        <div className="container-xl">
                            <div className="row">
                                <div className="col">
                                    <div className="card card-body card-bg-1 mb-3">
                                        <div className="d-flex flex-column align-items-center">
                                            <div className="avatar avatar-lg mb-2">
                                                <img className="avatar-img" src={getImageURL(inspectUser?.profilePicture, '80x80')} alt="" />
                                            </div>
                                            <div className="d-flex flex-column align-items-center">
                                                <h5 className="mb-2">{inspectUser?.name}</h5>
                                                <div>
                                                    {inspectUser?.userDesignations?.map((desg) => (
                                                        <nobr key={desg?.designationId} className="desg-tag mr-1 p-1">
                                                            {desg?.designation?.name}
                                                        </nobr>
                                                    ))}
                                                </div>
                                                {inspectUser?.id !== user.id &&
                                                    <div className="d-flex mt-2">
                                                        <MuiTooltip title='Message'>
                                                            <div className="btn btn-primary btn-icon rounded-circle text-light mx-2" onClick={onClickUserChat}>
                                                                <ChatDotsFill size={20} />
                                                            </div>
                                                        </MuiTooltip>
                                                    </div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row friends-info">
                                <div className="col">
                                    <div className="card">
                                        <ul className="list-group list-group-flush">
                                            {userdataList && userdataList.map((item, index) => {
                                                return (
                                                    <li className="list-group-item" key={index}>
                                                        <div className="media align-items-center">
                                                            <div className="media-body">
                                                                <p className="small mb-0">{item.title}</p>
                                                                {item.content ?
                                                                    <p className="mb-0">{item.content}</p>
                                                                    : <p className="mb-0 text-muted">{'(Not added yet)'}</p>
                                                                }
                                                            </div>
                                                            {item.icon}
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
            </>}
        />);
}
