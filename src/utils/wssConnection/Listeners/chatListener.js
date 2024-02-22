import { CHAT_CONST } from "redux/constants/chatConstants";
import { USER_CONST } from "redux/constants/userContants";
import { dispatch, getState } from "redux/store";
import { CONST, SOCKET } from "utils/constants";
import { SocketEmiter, SocketListener } from "utils/wssConnection/Socket";

// Below approach of socket is for optimization purpose only
// Dont remove
export const listenChatActivities = async () => {
	SocketListener("SOCKET_MESSAGE", (response) => {
		const { data, id } = response;
		const activeChatId = getState().chat?.activeChat?.id;
		const userId = getState().user.user?.id;
		switch (id) {
			case SOCKET.RESPONSE.ALLOW_SEND_MESSAGE:
				if (activeChatId === data.id) dispatch({ type: CHAT_CONST.UPDATE_ACTIVE_CHAT, payload: data });
				break;
			case SOCKET.RESPONSE.UPDATE_GROUP_MEMBER:
				if (activeChatId === data.chatId) dispatch({ type: CHAT_CONST.ADD_REMOVE_CHAT_USER_GROUP, payload: data });
				break;
			case SOCKET.RESPONSE.MAKE_GROUP_ADMIN:
				if (activeChatId === data.chatId) dispatch({ type: CHAT_CONST.ADD_GROUP_ADMIN, payload: data });
				break;
			case SOCKET.RESPONSE.REMOVE_GROUP_ADMIN:
				if (activeChatId === data.chatId) dispatch({ type: CHAT_CONST.REMOVE_GROUP_ADMIN, payload: data });
				break;
			case SOCKET.RESPONSE.EDIT_CHAT_MESSAGE:
				if (activeChatId === data.chatId) dispatch({ type: CHAT_CONST.UPDATE_EDITED_MESSAGE, payload: data });
				break;
			case SOCKET.RESPONSE.DELETE_CHAT_MESSAGE:
				dispatch({ type: CHAT_CONST.DELETE_GLOBAL_MESSAGE, payload: data });
				if (activeChatId === data.chatId) dispatch({ type: CHAT_CONST.DELETE_MESSAGE, payload: data });
				break;
			case SOCKET.RESPONSE.VIEW_DELETED_MESSAGE:
				if (activeChatId === data.chatId) dispatch({ type: CHAT_CONST.UPDATE_DELETE_MESSAGE, payload: data });
				break;
			case SOCKET.RESPONSE.UPDATE_CHATLIST:
				dispatch({ type: CHAT_CONST.UPDATE_CHAT_LIST, payload: data });
				break;
			case SOCKET.RESPONSE.UPDATE_CHAT_BACKGROUND:
				dispatch({ type: CHAT_CONST.UPDATE_CHAT_BACKGROUND, payload: data });
				break;
			case SOCKET.RESPONSE.ADD_TO_TASK:
				if (data.data.messageId) {
					dispatch({ type: CHAT_CONST.UPDATE_ISMESSAGE, payload: { messageId: data.data.messageId, isMessage: data.data?.isMessage, task: data.data } });
					dispatch({ type: "UPDATE_ISMESSAGE_GlobalSearch", payload: { messageId: data.data.messageId, isMessage: data.data?.isMessage } });
				}
				break;
			case SOCKET.RESPONSE.MARK_READ_CHAT:
				if (activeChatId === data.messageRead.chatId) dispatch({ type: CHAT_CONST.READ_BY_RECEIPIENT, payload: data.messageRead });
				break;
			case SOCKET.RESPONSE.NEW_CHAT_RECIEVED:
				SocketEmiter(SOCKET.JOIN_CHAT, { chatId: [data.id] });
				dispatch({ type: CHAT_CONST.NEW_CHAT_RECEIVED, payload: data });
				break;
			case SOCKET.USER_ONLINE:
				if (data.userId === userId) dispatch({ type: CHAT_CONST.SET_MY_STATUS, payload: data });
				else if (data.userId !== userId) {
					dispatch({ type: CHAT_CONST.SET_USER_ONLINE, payload: data });
					dispatch({ type: CHAT_CONST.UPDATE_USERLIST_STATUS, payload: data });
				}
				break;
			case SOCKET.USER_OFFLINE:
				if (data.userId === userId) dispatch({ type: CHAT_CONST.SET_MY_STATUS, payload: data });
				else if (data.userId !== userId) {
					dispatch({ type: CHAT_CONST.SET_USER_OFFLINE, payload: data });
					dispatch({ type: CHAT_CONST.UPDATE_USERLIST_STATUS, payload: data });
				}
				break;
			case SOCKET.USER_STATUS_CHANGED:
				if (data.userId === userId) dispatch({ type: CHAT_CONST.SET_MY_STATUS, payload: data });
				else dispatch({ type: CHAT_CONST.SET_USER_STATUS, payload: data });
				dispatch({ type: CHAT_CONST.UPDATE_USERLIST_STATUS, payload: data });
				break;
			case SOCKET.RESPONSE.REMOVE_MEMBER:
				dispatch({ type: CHAT_CONST.REMOVE_CHAT, payload: data.chatId });
				SocketEmiter(SOCKET.REQUEST.DISCONNECT_CHAT, { chatId: data.chatId });
				break;
			case SOCKET.RESPONSE.UPDATE_PROFILE_PIC:
				dispatch({ type: USER_CONST.UPDATE_USER_PROFILE_PICTURE, payload: data });
				break;
			case SOCKET.RESPONSE.UPDATE_GROUP_DATA:
				dispatch({ type: USER_CONST.UPDATE_GROUP_DATA, payload: data });
				break;
			case SOCKET.RESPONSE.UPDATE_MESSAGE:
				if (activeChatId === data.chatId) dispatch({ type: CHAT_CONST.RECIVE_MESSAGE_UPDATE, payload: data });
				if (data?.assignedUsers?.includes(userId) && window.location.pathname === CONST.APP_ROUTES.DASHBOARD)
					dispatch({ type: "DO_DASHBOARD_UPDATE", payload: null });
				break;
			default:
				break;
		}

	})
}