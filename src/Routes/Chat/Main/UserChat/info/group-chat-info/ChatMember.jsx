import { SocketEmiter } from 'utils/wssConnection/Socket';
import { SOCKET } from 'utils/constants';
import { getImageURL } from 'redux/common';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { MuiTooltip } from 'Components/components';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import { dispatch } from 'redux/store';
import { showError } from 'utils/package_config/toast';
import ErrorBoundary from 'Components/ErrorBoundry';

export const ChatMember = (props) => {
    const chatuser = props.item?.user;
    const onClickRemoveUser = () =>
        SocketEmiter(SOCKET.REQUEST.REMOVE_MEMBER, { chatId: props.item.chatId, userId: props.item.userId });
    const makeUserAdmin = () =>
        SocketEmiter(SOCKET.REQUEST.MAKE_GROUP_ADMIN, { chatId: props.item.chatId, userId: props.item.userId });
    const removeUserAdmin = () =>
        SocketEmiter(SOCKET.REQUEST.REMOVE_GROUP_ADMIN, { chatId: props.item.chatId, userId: props.item.userId });

    const setInspectUser = () => {
        chatuser ?
            dispatch({ type: CHAT_CONST.SET_INSPECT_USER, payload: chatuser }) :
            showError("User is not available");
    }
    return (
        <ErrorBoundary>
            <li className="list-group-item">
                <div className="media align-items-center">
                    <div className="avatar mr-2">
                        <img src={getImageURL(chatuser.profilePicture, '50x50')} alt="" />
                    </div>
                    <MuiTooltip title={`Click to view ${chatuser.name}'s info`}>
                        <div className="media-body" onClick={setInspectUser}>
                            <h6 className="text-truncate">
                                <div className="text-reset text-capitalize">{chatuser.name}</div>
                            </h6>
                            <p className="mb-0">{props.item?.isAdmin && <span className='desg-tag mr-1 text-success'>Admin</span>}
                                {chatuser?.hasOwnProperty('isActive') && !chatuser.isActive && <span className='desg-tag text-danger'>Disabled</span>}</p>
                        </div>
                    </MuiTooltip>
                    {props.isUserAdmin &&
                        <div className="media-options ml-1">
                            <div className="dropdown mr-2">
                                <button className="btn btn-secondary btn-icon btn-minimal btn-sm text-muted" id={`group-member-${props.item.userId}`} data-bs-toggle="dropdown">
                                    <ThreeDotsVertical />
                                </button>
                                <ul className="dropdown-menu m-0" aria-labelledby={`group-member-${props.item.userId}`}>
                                    {!props.item?.isAdmin ?
                                        <li className="dropdown-item" onClick={makeUserAdmin}>Make admin</li>
                                        : <li className="dropdown-item" onClick={removeUserAdmin}>Remove as admin</li>}
                                    <li className="dropdown-item" onClick={onClickRemoveUser}>Remove from group</li>
                                </ul>
                            </div>
                        </div>}
                </div>
            </li>
        </ErrorBoundary>);
}