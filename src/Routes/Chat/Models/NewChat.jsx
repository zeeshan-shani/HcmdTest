import React, { useCallback, useEffect, useState } from 'react'
import useDebounce from 'services/hooks/useDebounce';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeModel } from 'redux/actions/modelAction';
import { generatePayload, getImageURL } from 'redux/common';
import { CreatePrivateChat, getUsersList } from 'redux/actions/chatAction';
import { ConnectInNewChat, notifyUsers } from 'utils/wssConnection/Socket';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { setUserHandler } from '../Sidebar/Chat';
import { useNavigate } from 'react-router-dom';

const defaultState = {
    userList: [],
    searchUser: '',
    desg: null,
}
export default function NewChat() {
    // const { name } = useSelector((state) => state.model);
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const { userDesignations, activeChat } = useSelector((state) => state.chat);
    const [state, setState] = useState(defaultState);
    const [isLoading, setLoading] = useState(false);
    const { userList, searchUser, desg } = state;
    const newUser = useDebounce(searchUser, 500);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const payload = await generatePayload({
                body: { designationId: desg?.id },
                keys: ["name", "firstName", "lastName"],
                rest: { isActive: true }, // includeOwn: false,
                value: newUser,
                options: {
                    sort: [["name", "ASC"]],
                    populate: ["designations", "users:own", "companyRoleData"],
                }
            });
            const res = await getUsersList(payload);
            if (res?.status === 1)
                setState(prev => ({ ...prev, userList: res.data }));
            setLoading(false);
        })();
    }, [newUser, desg]);

    const newPrivateChat = useCallback(async (id) => {
        const res = await CreatePrivateChat(id, user.id);
        if (res?.status === 1) {
            changeModel("");
            // loadUserChatList(user.id, false, true);
            notifyUsers(res.data.createdBy, res.data.id, res.data.users, res.data.type);
            setUserHandler({ chat: res.data, activeChatId: activeChat?.id, userId: user.id, navigate });
            ConnectInNewChat(res.data, user.id);
        } else if (res?.status === 2) {
            changeModel("");
            setUserHandler({ chat: res.data, activeChatId: activeChat?.id, userId: user.id, navigate });
        }
    }, [user.id, activeChat?.id, navigate]);

    const onUserClickHandler = (item) => newPrivateChat(item.id);

    try {
        return (<>
            <div className="modal modal-lg-fullscreen fade show d-block" data-toggle="modal" id="startConversation" tabIndex={-1} role="dialog" aria-labelledby="startConversationLabel" aria-modal="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="startConversationLabel">New Chat</h5>
                            <button type="button" className="close text-color" data-dismiss="modal" aria-label="Close" onClick={() => changeModel("")}>
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body p-0 hide-scrollbar">
                            <div className="row">
                                <div className="col-12">
                                    <form className="form-inline w-100 p-2 border-bottom">
                                        <div className="input-group w-100">
                                            <div className="input-group-append">
                                                <div className="input-group-text p-0" role="button">
                                                    <div className="dropdown">
                                                        <button
                                                            className="btn btn-outline-default px-1 dropdown-toggle text-capitalize text-truncate width-limit-200 dropdown-max-width"
                                                            id="desgDropdown"
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false"
                                                            type="button"
                                                        >
                                                            <p className='d-inline'>{desg ? desg.name : 'All User'}</p>
                                                        </button>
                                                        <ul className="dropdown-menu m-0" aria-labelledby="desgDropdown">
                                                            <li key={'all'} className="dropdown-item cursor-pointer text-capitalize" onClick={() => setState(prev => ({ ...prev, desg: null }))}>
                                                                {'All User'}
                                                            </li>
                                                            {userDesignations?.map((desg) => (
                                                                <li key={desg.id} className="dropdown-item cursor-pointer text-capitalize" onClick={() => setState(prev => ({ ...prev, desg }))}>
                                                                    {desg.name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <input type="text" className="form-control form-control-md search br-0" placeholder="Search User" value={searchUser} onChange={(e) => setState(prev => ({ ...prev, searchUser: e.target.value }))} />
                                        </div>
                                    </form>
                                </div>
                                <div className="col-12">
                                    <ul className="list-group list-group-flush">
                                        {isLoading &&
                                            <div><Loader height={'80px'} /></div>}
                                        {!!userList?.length &&
                                            userList.map((item) => {
                                                const subline = (item?.companyRoleData?.name && item?.companyName) ? `${item.companyRoleData.name} at ${item.companyName}` : item?.companyName;
                                                return (<li className="list-group-item" key={item.id}>
                                                    <div className="media">
                                                        <div className={`avatar avatar-${item.profileStatus} mr-2`}>
                                                            <img src={getImageURL(item?.profilePicture, '50x50')} alt="" />
                                                        </div>
                                                        <div className="media-body">
                                                            <h6 className="text-reset username-text text-truncate">
                                                                {item?.name}{item.id === user.id ? ' (You)' : ''}
                                                            </h6>
                                                            <p className="mb-0 text-truncate in-one-line">{subline}</p>
                                                        </div>
                                                        <div>
                                                            <button className='btn btn-outline-primary' onClick={(e) => {
                                                                e.target.disabled = true;
                                                                onUserClickHandler(item)
                                                            }}>
                                                                Start
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>);
                                            })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>);
    } catch (error) {
        console.error(error);
    }
}
