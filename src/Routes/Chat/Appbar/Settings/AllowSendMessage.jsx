import React, { useCallback, useState } from 'react'
import { useSelector } from 'react-redux';
import { toastPromise } from 'redux/common';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { dispatch } from 'redux/store';
import { SOCKET } from 'utils/constants';
import { SocketEmiter } from 'utils/wssConnection/Socket';

export const AllowSendMessage = ({ allowSendMessage, setState }) => {
    const { activeChat } = useSelector(state => state.chat);
    const [loading, setLoading] = useState(false);

    const onChangeAllowsendMessage = useCallback(async (e) => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    setLoading(true);
                    setState(prev => ({ ...prev, allowSendMessage: e.target.checked }));
                    SocketEmiter(SOCKET.REQUEST.ALLOW_SEND_MESSAGE, {
                        chatId: activeChat.id,
                        allowOnlyAdminMessage: !e.target.checked
                    }, (data) => {
                        setLoading(false);
                        dispatch({ type: CHAT_CONST.UPDATE_ACTIVE_CHAT, payload: { allowOnlyAdminMessage: !e.target.checked } });
                        resolve(data);
                    })
                } catch (error) {
                    console.error(error);
                    reject(error);
                    setLoading(false);
                }
            },
            loading: "Updating message permissions",
            success: "Updated message permissions",
            error: "Could not update permissions",
            options: { id: "update-message-permission" }
        });
    }, [setState, activeChat?.id]);

    return (
        <div className="mute-setting p-2">
            <div className="todo-title">
                <h6 className="">Participants can:</h6>
            </div>
            <ul className="list-group border list-group-flush">
                <li className="list-group-item py-2">
                    <div className="media align-items-center">
                        <div className="media-body">
                            <p className="mb-0">Send Messages</p>
                        </div>
                        <div className="custom-control custom-switch ml-2">
                            <input type="checkbox" className="custom-control-input" id="allowsendMessage"
                                checked={allowSendMessage}
                                onChange={onChangeAllowsendMessage}
                                disabled={loading}
                            />
                            <label className="custom-control-label" htmlFor="allowsendMessage">&nbsp;</label>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    )
}
