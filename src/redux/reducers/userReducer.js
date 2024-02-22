import { defaultLight } from "redux/common";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { USER_CONST } from "redux/constants/userContants";
import { chatBackgrounds } from "Routes/UserProfile/Settings/ApplicationSettings/ChatBackground";

const initialState = {
	user: {
		id: -1,
		themeMode: defaultLight ? "light" : "dark",
	},
	isAuthenticated: false,
	connected: true,
	roles: []
};

export const userReducer = (state = initialState, action) => {
	switch (action.type) {
		case USER_CONST.INIT_USER:
			return initialState;
		case USER_CONST.SET_THEME_MODE:
			return { ...state, user: { ...state.user, themeMode: action.payload } };
		case USER_CONST.LOGIN_REQUEST:
		case USER_CONST.REGISTER_USER_REQUEST:
			return {
				...state,
				loading: true,
				isAuthenticated: false,
			};
		case USER_CONST.LOGIN_SUCCESS:
			return {
				...state,
				loading: false,
				isAuthenticated: true,
				token: action.payload,
			};
		case USER_CONST.UPDATE_FIELDS:
		case USER_CONST.LOAD_USER_SUCCESS:
			return {
				...state,
				loading: false,
				isAuthenticated: true,
				user: { ...state.user, ...action.payload },
			};
		// case USER_CONST.LOGOUT_REQUEST:
		// 	return { ...state, loading: true };
		// case USER_CONST.LOGOUT_SUCCESS:
		// 	delete state.token;
		// 	return {
		// 		...state,
		// 		loading: false,
		// 		user: initialState.user,
		// 		isAuthenticated: false,
		// 	};
		case USER_CONST.LOGIN_FAIL:
		case USER_CONST.REGISTER_USER_FAIL:
			return {
				...state,
				loading: false,
				isAuthenticated: false,
				user: { ...state.user, ...initialState.user },
				error: action.payload,
			};
		case USER_CONST.TOKEN_REQUEST_FAIL:
			return {
				...state,
				loading: false,
				isAuthenticated: false,
				user: { ...state.user, ...initialState.user },
				error: action.payload,
			};
		// case USER_CONST.LOAD_USER_FAIL:
		// 	return {
		// 		...state,
		// 		loading: false,
		// 		isAuthenticated: false,
		// 		user: { ...state.user, ...initialState.user },
		// 		error: action.payload,
		// 	};
		// case USER_CONST.LOGOUT_FAIL:
		// 	return {
		// 		...state,
		// 		loading: false,
		// 		error: action.payload,
		// 		isAuthenticated: false,
		// 	};
		case CHAT_CONST.SET_MY_STATUS:
			return { ...state, user: { ...state.user, profileStatus: action.payload.profileStatus } };
		case USER_CONST.SET_MSG_FONT_SIZE:
			return { ...state, user: { ...state.user, fontSize: action.payload } };
		case USER_CONST.UPDATE_USER_DATA:
			if (action.payload.id === state.user.id) return { ...state, user: { ...state.user, ...action.payload } };
			return state;
		case USER_CONST.RECEIVED_USER_CLOCK_DATA:
			return {
				...state,
				user: {
					...state.user,
					clockTime: {
						clockin: action.payload?.filter((item) => item.type === USER_CONST.CLOCK_IN).reverse(),
						clockout: action.payload?.filter((item) => item.type === USER_CONST.CLOCK_OUT).reverse(),
					},
				},
			};
		case USER_CONST.RECEIVED_DATE_USER_CLOCK_DATA:
			return {
				...state,
				user: {
					...state.user,
					dateClockTime: {
						clockin: action.payload?.filter((item) => item.type === USER_CONST.CLOCK_IN).reverse(),
						clockout: action.payload?.filter((item) => item.type === USER_CONST.CLOCK_OUT).reverse(),
					},
				},
			};
		case USER_CONST.UPDATE_USER_PROFILE_PICTURE:
			return { ...state, user: { ...state.user, profilePicture: action.payload.url } };
		// case USER_CONST.SET_ERROR_MSG:
		// 	return { ...state, error: action.payload };
		case USER_CONST.SET_DASHBOARD_WORK_HOURS:
			return { ...state, user: { ...state.user, workHours: action.payload } };
		case USER_CONST.USER_CONNECTED_STATE:
			return { ...state, connected: action.payload };
		case CHAT_CONST.UPDATE_CHAT_BACKGROUND:
			const colorIndex = chatBackgrounds.findIndex((item) => item.colorCode === action.payload.colorCode);
			if (colorIndex !== -1) return { ...state, user: { ...state.user, chatWallpaper: chatBackgrounds[colorIndex].colorCode } };
			else if (action.payload.colorCode === "none") return { ...state, user: { ...state.user, chatWallpaper: "none" } };
			return state;
		case USER_CONST.SET_USER_ROLES:
			return { ...state, roles: action.payload };
		// case USER_CONST.SET_PROFILE_STATUS_COUNT:
		// 	if (action.payload.status === 1)
		// 		return { ...state, usersStatusCount: { ...state.usersStatusCount || {}, ...action.payload.data } };
		// 	if (action.payload.status === 2) {
		// 		if (state.usersStatusCount?.hasOwnProperty(action.payload.data.previousStatus))
		// 			state.usersStatusCount[action.payload.data.previousStatus]--;
		// 		if (state.usersStatusCount.hasOwnProperty(action.payload.data.profileStatus))
		// 			state.usersStatusCount[action.payload.data.profileStatus]++;
		// 		else state.usersStatusCount[action.payload.data.profileStatus] = 1;
		// 		return {
		// 			...state, usersStatusCount: {
		// 				...state.usersStatusCount || {},
		// 			}
		// 		};
		// 	}
		// 	return state;
		// case 'UPDATE_AVAILABLE':
		// 	if (!action?.payload?.checked) localStorage.setItem('update', JSON.stringify(action.payload))
		// 	else localStorage.removeItem('update')
		// 	return { ...state, update: action.payload };
		default:
			return state;
	}
};
