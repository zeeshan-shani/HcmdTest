import { CHAT_CONST } from "redux/constants/chatConstants";
import { TASK_CONST } from "redux/constants/taskConstants";
import { USER_CONST } from "redux/constants/userContants";
import { dispatch, getState } from "redux/store";
import { SOCKET } from "utils/constants";
import { SocketListener } from "utils/wssConnection/Socket";

export const listenClockEvents = async () => {
	SocketListener("SOCKET_APP", (response) => {
		const { data, id } = response;
		const activeChatId = getState().chat?.activeChat?.id;
		const userId = getState().user.user?.id;
		switch (id) {
			case SOCKET.RESPONSE.SINGLE_CHATLIST:
				dispatch({ type: "DO_DASHBOARD_UPDATE", payload: null });
				if (data && (activeChatId !== data.id || !activeChatId || activeChatId === -1)) {
					// if (data.chatusers.find(i => i.userId === userId)?.isImportantChat) // Done at redux state "single-chat-list"
					dispatch({ type: CHAT_CONST.UPDATE_SINGLE_CHAT_LIST, payload: data, userId });
				}
				break;
			case SOCKET.RESPONSE.USER_LOGS:
				if (data?.isToday) {
					dispatch({ type: USER_CONST.RECEIVED_USER_CLOCK_DATA, payload: data.data });
					dispatch({ type: USER_CONST.RECEIVED_DATE_USER_CLOCK_DATA, payload: data.data });
				} else {
					if (!data.isDate) dispatch({ type: USER_CONST.RECEIVED_USER_CLOCK_DATA, payload: data.data });
					else dispatch({ type: USER_CONST.RECEIVED_DATE_USER_CLOCK_DATA, payload: data.data });
				}
				break;
			case SOCKET.RESPONSE.CREATE_TASK_LOG:
				dispatch({ type: TASK_CONST.RECEIVED_TASK_CLOCK_DATA, payload: data.data });
				break;
			case SOCKET.RESPONSE.CHANGE_USER_ROLE:
				dispatch({ type: USER_CONST.CREATED_NEW_SUPER_ADMIN, payload: data });
				dispatch({
					type: USER_CONST.UPDATE_USER_DATA, payload: {
						id: data.userId,
						roleData: data.roleData,
						ghostUser: false,
						isGhostActive: false
					}
				});
				break;
			case SOCKET.RESPONSE.DEACTIVATE_ACCOUNT:
				dispatch({ type: CHAT_CONST.SET_ACCOUNT_STATUS, payload: data });
				break;
			case SOCKET.RESPONSE.DELETE_USER:
				dispatch({ type: CHAT_CONST.SET_USER_ROLE_LIST_DELETE, payload: data });
				break;
			case "res-get-chat-users":
				dispatch({ type: USER_CONST.SET_ALL_USERS_DATA, payload: data.users });
				break;
			default:
				break;
		}
	})
}