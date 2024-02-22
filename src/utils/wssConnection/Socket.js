
/**
 * Socket.js is a module that handles the WebSocket connection with the server and provides functions 
 * for emitting and listening to socket events.
 */

import { io } from "socket.io-client";
import { base } from "utils/config";
import moment from "moment";
import { dispatch, getState } from "redux/store";
import { toastPromise } from "redux/common";
import { USER_CONST } from "redux/constants/userContants";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { TASK_CONST } from "redux/constants/taskConstants";
import { getCategories, getDesignationList } from "redux/api/Prefetch";
import { listenChatActivities } from "utils/wssConnection/Listeners/chatListener";
import { CONST, SOCKET } from "utils/constants";
import { listenClockEvents } from "utils/wssConnection/Listeners/ClockListener";
import { listenTaskActivities } from "utils/wssConnection/Listeners/Tasklistener";
import { showConnectInternet, showDisconnectInternet } from "utils/package_config/hot-toast";
import taskService from "services/APIs/services/taskService";

export let socket;

/**
 * Function to emit a socket event.
 * @param {string} socketId - The ID of the socket event.
 * @param {object} body - The data to be sent with the event.
 * @param {function} options - The callback function for the event.
 */
export const SocketEmiter = (socketId = "", body = {}, options = () => { }) =>
	socket?.emit(socketId, body, options);

/**
 * Function to listen for a socket event.
 * @param {string} socketId - The ID of the socket event.
 * @param {function} operation - The function to be executed when the event occurs.
 */
export const SocketListener = (socketId = "", operation = () => { }) => {
	socket?.removeAllListeners(socketId);
	socket?.on(socketId, operation);
};

/**
 * Function to initialize the WebSocket connection with the server.
 * @param {string} token - The authenticuation token for the ser.
 */
export const initWebSocket = (token) => {
	// Establish Socket Connection with server
	socket = io.connect(base.URL, {
		transports: ["websocket"],
		query: `token=${token}`,
		reconnection: true,
		reconnectionDelay: 500,
		reconnectionDelayMax: 3000,
		reconnectionAttempts: 1000,
		forceNew: true,
	});
};

/**
 * Function to connect the socket listener.
 * @param {string} userId - The ID of the user.
 */
export const connectSocketListener = (userId) => {
	SocketListener(SOCKET.CONNECT, () => {
		console.log("connected with server");
		SocketEmiter(SOCKET.JOIN_DEVICE, { userId });
		if (sessionStorage.getItem("lastconnected")) {
			console.log("Reconnected!");
			showConnectInternet();
			if (window.location.pathname === CONST.APP_ROUTES.DASHBOARD)
				dispatch({ type: "DO_DASHBOARD_UPDATE", payload: null });
			else if (window.location.pathname === CONST.APP_ROUTES.CHAT)
				dispatch({ type: "RECONNECTED_REFRESH_CHATS", payload: true });
			dispatch({ type: "SOCKET_RECONNECTED", payload: { connectionLostTime: sessionStorage.getItem("lastconnected") } });
			sessionStorage.removeItem("lastconnected");
			ListenersOnReconnect();
		}
		DefaultListeners();
		DefaultRequests(userId);
		dispatch({ type: USER_CONST.USER_CONNECTED_STATE, payload: true });
		JoinAllChat();
	});
};

/**
 * Function to make default requests when the user connects to the server.
 * @param {string} userId - The ID of the user.
 */
export const DefaultRequests = () => {
	getDesignationList();
	SocketEmiter(SOCKET.REQUEST.WORK_HOURS, {});
	SocketEmiter(SOCKET.REQUEST.USER_LOGS);
	getCategories();
};

/**
 * Function to add listeners when the user reconnects to the server.
 */
export const ListenersOnReconnect = () => {
	// ListenNewChat();
};

/**
 * Function to add default listeners.
 */
export const DefaultListeners = () => {
	listenTaskActivities();
	listenClockEvents();
	SocketListener(SOCKET.RESPONSE.WORK_HOURS, (data) => {
		dispatch({ type: USER_CONST.SET_DASHBOARD_WORK_HOURS, payload: data });
	});
};

/**
 * Function to connect the user with the socket.
 * @param {string} userId - The ID of the user.
 */
export const connectUserWithSocket = (userId) => {
	SocketEmiter(SOCKET.JOIN_DEVICE, { userId });
	connectSocketListener(userId);
	SocketListener(SOCKET.DISCONNECT, () => {
		console.log("disconnected");
		console.log("You're offline! Please try to reconnect");
		dispatch({ type: USER_CONST.USER_CONNECTED_STATE, payload: false });
		sessionStorage.setItem("lastconnected", moment().toLocaleString());
	});
	listenChatActivities();
};

/**
 * Function to connect to a new chat.
 * @param {object} data - The chat data.
 */
export const ConnectInNewChat = (data) => {
	SocketEmiter(SOCKET.JOIN_CHAT, { chatId: [data.id] });
};

/**
 * Function to join all available chats.
 */
export const JoinAllChat = () => SocketEmiter(SOCKET.JOIN_CHAT, {});

/**
 * Function to send a message.
 * @param {object} messageObject - The message object.
 * @param {function} cb - The callback function.
 */
export const sendMessage = (messageObject, cb = () => { }) => SocketEmiter(SOCKET.MESSAGE, messageObject, cb);

/**
 * Function to mark all messages as read in a chat.
 * @param {string} chatId - The ID of the chat.
 * @param {string} userId - The ID of the user.
 */
export const readAllMessages = (chatId, userId) => {
	MarkReadChat(chatId);
	dispatch({ type: CHAT_CONST.CLEAR_USER_NOTIFICATION, payload: { chatId, userId } });
};

/**
 * Function to mark a chat as read.
 * @param {string} chatId - The ID of the chat.
 */
export const MarkReadChat = (chatId) => {
	SocketEmiter(SOCKET.REQUEST.MARK_READ_CHAT, { chatId }, () => {
		dispatch({ type: "SET_STATE", payload: { hiddenCountTime: Date.now() } })
	});
}

/**
 * Function to receive new messages.
 * @param {string} activeChatId - The ID of the active chat.
 * @param {string} userId - The ID of the user.
 * @param {array} chatList - The list of chats.
 */
export const receiveMessage = (activeChatId, userId) => {
	try {
		SocketListener(SOCKET.NEW_MESSAGE, async (data) => {
			if (data && data.chatId && activeChatId === data.chatId) {
				if (
					(data.chatType === CONST.CHAT_TYPE.GROUP && data.sendTo.includes(userId)) ||
					(data.chatType === CONST.CHAT_TYPE.PRIVATE && data.sendTo === userId)
				)
					SocketEmiter(SOCKET.REQUEST.MARK_READ_CHAT, { chatId: activeChatId });
				if (data.sendBy === userId) {
					SocketEmiter(SOCKET.UPDATE_NOTIFICATION, {
						chatId: data.chatId,
						chatType: data.chatType,
						messageType: data.type,
						messageId: data.id,
						userId: data.sendTo,
						mentionusers: data.mentionusers,
					});
				}
				const countDown = getState().chat.activeChat.totalCountDown;
				if (!countDown || countDown <= 0) dispatch({ type: CHAT_CONST.RECEIVED_NEW_MESSAGE, payload: data, userId });
				else dispatch({ type: CHAT_CONST.NEW_MESSAGE_COUNT });
				if (data.mediaType)
					if (["image", "video"].includes(data.mediaType.split("/").shift()))
						dispatch({ type: CHAT_CONST.ADD_TO_MEDIA_FILES, payload: data });
			} else if (data?.isForwarded && data.sendBy === userId) {
				SocketEmiter(SOCKET.UPDATE_NOTIFICATION, {
					chatId: data.chatId,
					chatType: data.chatType,
					messageType: data.type,
					messageId: data.id,
					userId: data.sendTo,
					mentionusers: data.mentionusers,
				});
			}
			// if (
			// 	userId !== data.sendBy &&
			// 	(document.visibilityState !== "visible" || activeChatId !== data.chatId)
			// ) {
			// 	// Code Block for notification
			// 	let chat = null;
			// 	if (chatList) chat = chatList?.find((chat) => chat.id === data.chatId);
			// 	if (chat) {
			// 		const filterChatUser = chat.chatusers.find(
			// 			(user) => user.userId === userId
			// 		);
			// 		const chatName =
			// 			chat.type === CONST.CHAT_TYPE.GROUP
			// 				? { name: chat.name, photo: chat.image }
			// 				: {
			// 					name: chat.chatusers.find((user) => user.userId !== userId)
			// 						?.user.name,
			// 					photo: chat.chatusers.find((user) => user.userId !== userId)
			// 						?.user.profilePicture,
			// 				};
			// 		if (filterChatUser) {
			// 			const {
			// 				isRoutineNotificationMute,
			// 				isEmergencyNotificationMute,
			// 				isUrgentNotificationMute,
			// 			} = filterChatUser;
			// 			const pushNotification = () => {
			// 				if (
			// 					document.hidden ||
			// 					(data && data.chatId && activeChatId !== data.chatId)
			// 				)
			// 					showNotificationfunc({
			// 						msg: data.message,
			// 						title: chatName.name,
			// 						photo: chatName.image,
			// 					});
			// 			};
			// 			if (
			// 				data.type === CONST.MSG_TYPE.ROUTINE &&
			// 				!isRoutineNotificationMute
			// 			) {
			// 				playNotificationSound();
			// 				pushNotification();
			// 			} else if (
			// 				data.type === CONST.MSG_TYPE.EMERGENCY &&
			// 				!isEmergencyNotificationMute
			// 			) {
			// 				playNotificationSound();
			// 				pushNotification();
			// 			} else if (
			// 				data.type === CONST.MSG_TYPE.URGENT &&
			// 				!isUrgentNotificationMute
			// 			) {
			// 				playNotificationSound();
			// 				pushNotification();
			// 			}
			// 		}
			// 	}
			// }
		});
	} catch (error) {
		console.error(error);
	}
};

/**
 * Function to notify users about a new chat.
 * @param {string} userId - The ID of the user.
 * @param {string} chatId - The ID of the chat.
 * @param {array} users - The list of users to be notified.
 * @param {string} type - The type of the chat.
 */
export const notifyUsers = (userId, chatId, users, type) => {
	const payload = { createdBy: userId, chatId, users, type };
	SocketEmiter(SOCKET.NEW_CHAT_REQUEST, payload);
};

/**
 * Function to get filtered tasks data.
 * @param {object} payload - The payload for filtering tasks.
 */
export const getFilterTasksData = async (payload) => {
	await toastPromise({
		func: async (myResolve, myReject) => {
			try {
				const data = await taskService.taskFilterList({ payload });
				dispatch({ type: TASK_CONST.RES_GET_TASKLIST, payload: data.data });
				myResolve("OK");
			} catch (error) {
				myReject("Error");
			}
		},
		loading: "Fetching tasks",
		success: <b>Successfully get Task</b>,
		error: <b>Could not fetch task data.</b>,
		options: { id: "task-filter-data" }
	});
};

/**
 * Function to receive new tasks based on filters.
 * @param {object} newFilters - The new filters for tasks.
 */
export const receiveNewTask = (newFilters) => {
	SocketListener(SOCKET.NEW_MESSAGE, (data) => {
		if (data && !data.isMessage && data.chatId && newFilters.chatId?.includes(data.chatId))
			getFilterTasksData(newFilters);
	});
};

/**
 * Function to change the profile status.
 * @param {string} status - The new profile status.
 */
export const changeProfileStatus = (status) => SocketEmiter(SOCKET.CHANGE_PROFILE_STATUS, { profileStatus: status });

// Event listener for offline event
window.addEventListener('offline', () => {
	console.log("You're offline! Please try to reconnect");
	showDisconnectInternet({});
	dispatch({ type: USER_CONST.USER_CONNECTED_STATE, payload: false });
	sessionStorage.setItem("lastconnected", moment().toLocaleString());
});