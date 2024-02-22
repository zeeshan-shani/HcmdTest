import axios from "axios";
import { showError, showSuccess } from "utils/package_config/toast";
import { connectUserWithSocket, initWebSocket, JoinAllChat, socket, SocketEmiter } from "utils/wssConnection/Socket";
import { browserName, isMobile, osName } from "react-device-detect";
import { dispatch } from "redux/store";
import { clearBadge, toastPromise } from "redux/common";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { USER_CONST } from "redux/constants/userContants";
import { MODEL_CONST } from "redux/constants/modelConstants";
import { TASK_CONST } from "redux/constants/taskConstants";
import { cancelToken } from "redux/actions/chatAction";
import { changeModel } from "redux/actions/modelAction";

import authService from "services/APIs/services/authService";
import fcmTokenService from "services/APIs/services/FCMService";
import userService from "services/APIs/services/userService";
import userLogService from "services/APIs/services/userLogService";

// Login Request
export const login = async ({ email, password, rememberMe }) => {
	try {
		const payload = { email, password }
		const data = await authService.login({ payload });
		if (!data.status) return data;
		if (!rememberMe) window.onbeforeunload = () => localStorage.removeItem("token");
		onLoginGranted({ data, token: data.token });
		return data;
	} catch (error) {
		console.error(error);
		return {
			status: 0,
			message: error.response.data ? error.response.data?.message : error.message,
		};
	}
};

// Verify token and get user data
export const verifyToken = async (token = localStorage.getItem("token")) => {
	try {
		dispatch({ type: USER_CONST.LOGIN_REQUEST });
		// Check if Token valid
		const data = await authService.verifyToken();
		onLoginGranted({ data, token });
	} catch (error) {
		showError(error?.response?.data?.message);
		localStorage.removeItem("token");
		clearBadge();
		dispatch({ type: USER_CONST.TOKEN_REQUEST_FAIL, payload: error.response?.data?.message });
	}
};

const onLoginGranted = ({ data, token }) => {
	// once login success, initialize socket
	initWebSocket(token);
	localStorage.setItem("token", token);
	dispatch({ type: USER_CONST.LOGIN_SUCCESS, payload: token });
	dispatch({ type: USER_CONST.LOAD_USER_SUCCESS, payload: data.user });
	// Emit required sockets and fetch data
	connectUserWithSocket(data.user.id);
	// Join in chats for getting notifications
	JoinAllChat();
}

// Logout user
export const onLogout = async () => {
	try {
		SocketEmiter("log-out-user", { fcmToken: localStorage.getItem("fcmtoken"), });
		// disconnect current session
		socket?.disconnect(() => console.log('Socket disconnected'));
		localStorage.removeItem("token");
		// Set default redux states
		setInitState();
		showSuccess("User logged out")
	} catch (error) {
		showError(error?.response?.data?.message);
		dispatch({ type: USER_CONST.TOKEN_REQUEST_FAIL, payload: error });
	}
};

// Logout user
export const setInitState = async () => {
	dispatch({ type: USER_CONST.INIT_USER });
	dispatch({ type: CHAT_CONST.INIT_CHAT });
	dispatch({ type: MODEL_CONST.INIT_MODEL });
	dispatch({ type: TASK_CONST.INIT_TASK });
};

// Send Push Token
export const sendPushNotiToken = async (FCMtoken = localStorage.getItem("fcmtoken")) => {
	try {
		// After Login, if token and fcm token, 
		// then register curr device id to db to get firebase notification
		if (!localStorage.getItem("fcmtoken") || !localStorage.getItem("token")) return;
		const payload = {
			deviceType: isMobile ? "mobile" : "desktop",
			deviceOS: `${osName}`,
			browserType: browserName,
			deviceKey: FCMtoken,
		}
		const data = await fcmTokenService.create({ payload })
		return data;
	} catch (error) { }
};

export const getUserAttendanceLogs = async (payload) => {
	try {
		if (cancelToken?.getUserAttendanceLogs) cancelToken?.getUserAttendanceLogs.cancel("Operation cancel due to new request.");
		cancelToken.getUserAttendanceLogs = axios.CancelToken.source();
		const config = { cancelToken: cancelToken?.getUserAttendanceLogs.token };
		const data = await userLogService.list({ payload, config });
		return data;
	} catch (error) {
		console.error(error);
	}
};

// update user
export const updateUserAPI = async (payload, callBack = () => { }) => {
	await toastPromise({
		func: async (resolve, reject) => {
			try {
				// Update user data
				const data = await userService.update({ payload });
				if (data?.status === 2) {
					showError(data?.message, { id: "error" });
					reject(data?.message);
				} else if (data?.status === 1) {
					dispatch({ type: MODEL_CONST.SET_USER_ROLE_LIST_UPDATE, payload: data.user });
					dispatch({ type: USER_CONST.UPDATE_USER_DATA, payload: data.user });
					changeModel("");
					callBack();
				}
				resolve(data);
			} catch (error) {
				reject(error);
				console.error(error);
			}
		},
		loading: "Updating user data",
		success: <b>Successfully Updated</b>,
		error: <b>Could not update</b>,
		options: { id: "user-update" }
	});
};
