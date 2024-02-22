import axios from "axios";
import moment from "moment-timezone";
import { compareByName } from "Routes/Chat/Main/UserChat/info/group-chat-info/GroupChatInfo";
import { CONST } from "utils/constants";
import { LOADER, CHAT_CONST } from "redux/constants/chatConstants";
import { cancelToken } from "redux/actions/chatAction";
import { MarkReadChat } from "utils/wssConnection/Socket";
import { dispatch } from "redux/store";
import { USER_CONST } from "redux/constants/userContants";
import { MODEL_CONST } from "redux/constants/modelConstants";
import { TASK_CONST } from "redux/constants/taskConstants";
import { makeUniqueObjects } from "redux/common";
import messageService from "services/APIs/services/messageService";

const initialState = {
	activeChat: {
		id: -1,
	},
	activePatientChat: null,
	activeCategoryChat: null,
	taskList: {
		data: [],
	},
	chatList: [],
	patientList: [],
	categoryList: [],
	dashboardList: [],
	chatListData: {
		chats: [],
		messages: [],
	},
	usersList: {
		count: 0,
		users: [],
	},
	threadMessage: null,
	infoMessage: { id: -1 },
	mediaFiles: [],
	documentFiles: [],
	offset: 0,
	totalCount: 1,
	loaders: {
		chatList: false,
		dashboardList: false,
	},
	messages: {
		data: {
			count: 0,
			rows: [],
		},
	},
	dashboardUpdate: moment().format(),
	isDeletedChange: moment().format(),
	hiddenChatNotiCount: true,
	hiddenChats: false
};

export const chatReducer = (state = initialState, action) => {
	try {
		switch (action.type) {
			case CHAT_CONST.INIT_CHAT:
				return initialState;
			case CHAT_CONST.LOAD_CHAT_USER_LIST_REQUEST:
				return {
					...state,
					loading: true,
				};
			case CHAT_CONST.SET_INSPECT_USER:
				return {
					...state,
					inspectUser: action.payload,
				};
			case CHAT_CONST.SET_INSPECT_PATIENT:
				return {
					...state,
					inspectPatient: action.payload,
				};
			case CHAT_CONST.SET_QUOTE_MESSAGE:
				return {
					...state,
					quoteFileId: action.payload,
				};
			case CHAT_CONST.SET_POPUP_FILE:
				return {
					...state,
					popupFileId: action.payload,
				};
			case CHAT_CONST.SET_SEARCH_TAGGED:
				return {
					...state,
					taggedSearch: action.payload
				};
			case LOADER.CHATLIST_LOADER:
				return {
					...state,
					loaders: {
						...state.loaders,
						chatList: action.payload,
					},
				};
			case LOADER.PATIENT_LIST_LOADER:
				return {
					...state,
					loaders: {
						...state.loaders,
						patientList: action.payload,
					},
				};
			case LOADER.CATEGORY_LIST_LOADER:
				return {
					...state,
					loaders: {
						...state.loaders,
						categoryList: action.payload,
					},
				};
			case LOADER.DASHBOARD_LOADER:
				return {
					...state,
					loaders: {
						...state.loaders,
						dashboardList: action.payload,
					},
				};
			case "SET_STATE":
				return {
					...state,
					...action.payload,
				};
			case "SOCKET_RECONNECTED":
				if (action.payload.connectionLostTime && state?.activeChat?.id !== -1) {
					const getData = async () => {
						if (cancelToken?.socket_reconnected) cancelToken?.socket_reconnected.cancel("Operation cancel due to new request.");
						cancelToken.socket_reconnected = axios.CancelToken.source();
						const payload = { lastConnectedTime: action.payload.connectionLostTime, chatId: state.activeChat.id };
						const config = { cancelToken: cancelToken?.socket_reconnected.token };
						const data = await messageService.getLastMessage({ payload, config });
						if (data?.status) {
							if (data.rows) {
								const [messageData] = data.rows;
								if (messageData && state.activeChat.id === messageData.chatId) {
									const tempbody = {
										messages: {
											data: {
												count: state.messages.count + data.count,
												rows: [...data.rows, ...state.messages.data.rows],
											},
										},
									};
									dispatch({ type: "SET_STATE", payload: tempbody });
									MarkReadChat(messageData?.chatId);
								}
							}
						}
					};
					getData();
				}
				return state;
			case CHAT_CONST.SET_HIDDEN_CHATS:
				return {
					...state,
					hiddenChats: action.payload,
				};
			case CHAT_CONST.LOAD_CHAT_LIST_SUCCESS:
				const loadChatList = makeUniqueObjects(action.payload);
				loadChatList.sort(compareDateTime);
				return {
					...state,
					loading: false,
					chatList: loadChatList,
				};
			case CHAT_CONST.LOAD_DASHBOARD_LIST_SUCCESS:
				const loaddashboardList = action.payload;
				return {
					...state,
					loading: false,
					dashboardList: loaddashboardList,
				};
			case TASK_CONST.READ_DESIGNATIONS:
				if (action.payload && !!action.payload?.length)
					return {
						...state,
						userDesignations: action.payload.sort(compareByName),
					};
				return state;
			case CHAT_CONST.SET_USER_NOTIFICATION:
				const newChatList = state.chatList;
				const NotificationIndex = newChatList.findIndex((item) => item.id === action.payload.chatId);
				const lastMessageNotified = { ...action.payload.messageDetail };
				const newChatUsers = newChatList[NotificationIndex]?.chatusers.filter((x) => x.userId !== action.userId);
				let newChatUsersFiltered = newChatList[NotificationIndex]?.chatusers.find((x) => x.userId === action.userId);
				newChatUsersFiltered = {
					...newChatUsersFiltered,
					...action.payload.notification,
				};
				if (NotificationIndex !== -1) {
					newChatList[NotificationIndex] = {
						...newChatList[NotificationIndex],
						messages: [lastMessageNotified],
						updatedAt: action.payload.messageDetail.createdAt,
						chatusers: [...newChatUsers, newChatUsersFiltered],
					};
				}
				newChatList.sort(compareDateTime);
				return {
					...state,
					chatList: newChatList,
				};
			case CHAT_CONST.SET_NOTIFICATION_STATUS:
				const newNotificationChatList = state.chatList;
				const chatNotificationIndex = newNotificationChatList.findIndex((item) => item.id === action.payload.chatId);
				const newChatNotifyUserIndex = newNotificationChatList[chatNotificationIndex]?.chatusers.findIndex((x) => x.userId === action.payload.userId);
				if (chatNotificationIndex !== -1 && newChatNotifyUserIndex !== -1) {
					newNotificationChatList[chatNotificationIndex].chatusers[newChatNotifyUserIndex] = {
						...newNotificationChatList[chatNotificationIndex].chatusers[newChatNotifyUserIndex],
						isRoutineNotificationMute: action.payload?.isRoutineNotificationMute,
						isEmergencyNotificationMute: action.payload?.isEmergencyNotificationMute,
						isUrgentNotificationMute: action.payload?.isUrgentNotificationMute,
						isImportantChat: action.payload?.isImportantChat,
					};
				}
				const chatuserIndex = state.activeChat.chatusers.findIndex((user) => user.userId === action.payload.userId);
				if (chatuserIndex !== -1) {
					const modiChatusers = state.activeChat.chatusers;
					modiChatusers[chatuserIndex] = {
						...modiChatusers[chatuserIndex],
						isRoutineNotificationMute: action.payload?.isRoutineNotificationMute,
						isEmergencyNotificationMute: action.payload?.isEmergencyNotificationMute,
						isUrgentNotificationMute: action.payload?.isUrgentNotificationMute,
						isImportantChat: action.payload?.isImportantChat,
					};
					return {
						...state,
						activeChat: {
							...state.activeChat,
							chatusers: modiChatusers,
						},
						chatList: newNotificationChatList,
					};
				}
				return state;
			case CHAT_CONST.CLEAR_USER_NOTIFICATION:
				const ClearChatNotificationList = state.chatList;
				const ClearNotificationIndex = ClearChatNotificationList.findIndex((item) => item.id === action.payload.chatId);
				const oldChatUsersClear = ClearChatNotificationList[ClearNotificationIndex]?.chatusers.filter((x) => x.userId !== action.payload.userId);
				const newChatUsersFilteredClear = ClearChatNotificationList[ClearNotificationIndex]?.chatusers.filter((x) => x.userId === action.payload.userId)[0];
				if (newChatUsersFilteredClear !== undefined) {
					newChatUsersFilteredClear.routineUnreadMessageCount = 0;
					newChatUsersFilteredClear.emergencyUnreadMessageCount = 0;
					newChatUsersFilteredClear.urgentUnreadMessageCount = 0;
					newChatUsersFilteredClear.atTheRateMentionMessageCount = 0;
					newChatUsersFilteredClear.hasMentionMessageCount = 0;
					newChatUsersFilteredClear.hasPatientMentionCount = 0;
					if (ClearNotificationIndex !== -1) {
						ClearChatNotificationList[ClearNotificationIndex] = {
							...ClearChatNotificationList[ClearNotificationIndex],
							chatusers: [...oldChatUsersClear, newChatUsersFilteredClear],
						};
					}
					ClearChatNotificationList.sort(compareDateTime);
					return {
						...state,
						chatList: ClearChatNotificationList,
					};
				}
				return {
					...state,
				};
			case CHAT_CONST.CLEAR_PATIENT_NOTIFICATION:
			case CHAT_CONST.CLEAR_CATEGORY_NOTIFICATION:
				if (action.payload.categoryId) {
					return {
						...state,
						categoryList: state.categoryList.map(item => {
							if (item.id === action.payload.categoryId)
								return { ...item, categoryChats: [] }
							return item;
						})
					}
				}
				if (action.payload.patientId) {
					return {
						...state,
						patientList: state.patientList.map(item => {
							if (item.id === action.payload.patientId)
								return { ...item, patientAssigns: [] }
							return item;
						})
					}
				}
				return state;
			case CHAT_CONST.RECEIVED_NEW_MESSAGE:
				const lastMessage = {
					id: action.payload.id,
					message: action.payload.message,
					subject: action.payload.subject,
					createdAt: action.payload.createdAt,
					chatId: action.payload.chatId,
					mediaType: action.payload.mediaType,
					fileName: action.payload.fileName,
					isMessage: action.payload.isMessage,
					sendByDetail: action.payload.sendByDetail,
				};
				const chatListForLastList = state.chatList;
				const chatListForLastMsgIndex = chatListForLastList.findIndex((item) => item.id === action.payload.chatId);
				if (chatListForLastMsgIndex !== -1) {
					chatListForLastList[chatListForLastMsgIndex] = {
						...chatListForLastList[chatListForLastMsgIndex],
						messages: [lastMessage],
					};
				}
				chatListForLastList.sort(compareDateTime);
				if (action.payload?.messagerecipients && !!action.payload?.messagerecipients.length) {
					action.payload.messagerecipients = action.payload.messagerecipients.map((item) => {
						if (item.recipientId === action.userId) item.isRead = true;
						return item;
					});
				}
				return {
					...state,
					chatList: chatListForLastList,
					messages: {
						data: {
							count: state.messages.data.count + 1,
							rows: [action.payload].concat(state.messages.data.rows),
						},
					},
				};
			case CHAT_CONST.RECIVE_MESSAGE_UPDATE:
				const newMessageList = state.messages.data.rows;
				if (!!newMessageList.length) {
					const MsgIndex = newMessageList.findIndex((msg) => msg.id === action.payload.messageId);
					if (MsgIndex !== -1) {
						if (newMessageList[MsgIndex].task && action.payload.updatedData.task) {
							newMessageList[MsgIndex].task = {
								...newMessageList[MsgIndex].task,
								...action.payload.updatedData.task,
							}
							delete action.payload.updatedData.task
						}
						newMessageList[MsgIndex] = {
							...newMessageList[MsgIndex],
							...action.payload.updatedData,
						};
						return {
							...state,
							messages: {
								...state.messages,
								data: {
									...state.messages.data,
									rows: newMessageList,
								},
							},
						};
					}
				}
				return state;
			case CHAT_CONST.LOAD_CHAT_USER_LIST_FAIL:
				return {
					...state,
					loading: false,
					error: action.payload,
				};
			case CHAT_CONST.SET_ACTIVE_CHAT_REQUEST:
				return {
					...state,
					loading: true,
				};
			case "SET_MESSAGEAT":
				return {
					...state,
					messageAt: action.payload,
				};
			case CHAT_CONST.SET_ACTIVE_CHAT_SUCCESS:
				return {
					...state,
					loading: false,
					messages: {
						data: {
							count: 0,
							rows: [],
						},
					},
					messageAt: action.messageAt,
					activeChat: action.payload,
					activePatientChat: null,
					activeCategoryChat: null,
				};
			case CHAT_CONST.SET_ACTIVE_CHAT_FAIL:
				return {
					...state,
					loading: false,
					activeChat: { id: -1, },
					activePatientChat: null,
					activeCategoryChat: null
				};
			case CHAT_CONST.SET_CHAT_QUOTE_MSG:
				return {
					...state,
					activeChat: {
						...state.activeChat,
						quoteMessage: action.payload,
					},
				};
			case CHAT_CONST.GET_MESSAGES_SUCCESS:
				return {
					...state,
					loading: false,
					messages: action.payload,
				};
			case CHAT_CONST.APPEND_MESSAGES:
				if (action.payload?.data.rows) {
					const [messageData] = action.payload.data.rows;
					if (messageData && state.activeChat.id === messageData.chatId) {
						return {
							...state,
							messages: {
								data: {
									count: action.payload.data.count,
									rows: action?.down ?
										[...action.payload.data.rows.concat(...state.messages.data.rows)] :
										[...state.messages.data.rows.concat(...action.payload.data.rows)],
								},
							},
						};
					}
				}
				return state;
			case CHAT_CONST.GET_MESSAGES_FAIL:
				return {
					...state,
					loading: false,
					messages: {
						data: {
							count: 0,
							rows: [],
						},
					},
				};
			case CHAT_CONST.CREATE_TASK_FAIL:
				return {
					...state,
					loading: false,
					error: "There is something wrong",
				};
			case CHAT_CONST.NEW_CHAT_RECEIVED:
				if (action.payload.id) {
					let newChatListCreated = state.chatList;
					const alreadyAvailable = state.chatList.find(i => i.id === action.payload.id);
					if (!alreadyAvailable)
						newChatListCreated = [action.payload, ...state.chatList];
					newChatListCreated.sort(compareDateTime);
					return {
						...state,
						chatList: newChatListCreated,
					};
				}
				return state;
			case CHAT_CONST.SET_MESSAGE_REACTIONS:
				return {
					...state,
					messageReactions: action.payload,
				};
			case CHAT_CONST.GET_TASKS_SUCCESS:
				return {
					...state,
					loading: false,
					taskList: action.payload,
				};
			case CHAT_CONST.DELETE_ACTIVE_CHAT:
				const nextChatState = { ...state };
				delete nextChatState.activeChat;
				return {
					...nextChatState,
					activeChat: { id: -1 },
				};
			case CHAT_CONST.SET_USER_ONLINE:
				const newChatListOnline = state.chatList;
				const userChatIndexOnline = newChatListOnline.findIndex((item) => item.users?.includes(action.payload.userId) && item.type === CONST.CHAT_TYPE.PRIVATE);
				if (userChatIndexOnline !== -1) {
					const chatUsersOnline = newChatListOnline[userChatIndexOnline]?.chatusers.filter((x) => x.userId !== action.payload.userId);
					const chatUsersFilteredOnline = newChatListOnline[userChatIndexOnline]?.chatusers.filter((x) => x.userId === action.payload.userId)[0];
					if (chatUsersFilteredOnline?.user?.profileStatus) chatUsersFilteredOnline.user.profileStatus = "online";
					newChatListOnline[userChatIndexOnline] = {
						...newChatListOnline[userChatIndexOnline],
						chatusers: [...chatUsersOnline, chatUsersFilteredOnline],
					};
					return {
						...state,
						chatList: newChatListOnline,
					};
				}
				return state;
			case CHAT_CONST.SET_USER_OFFLINE:
				const newChatListOffline = state.chatList;
				const userChatIndexOffline = newChatListOffline.findIndex(
					(item) => item.users.includes(action.payload.userId) && item.type === CONST.CHAT_TYPE.PRIVATE
				);
				if (userChatIndexOffline !== -1) {
					const chatUsersOffline = newChatListOffline[userChatIndexOffline]?.chatusers.filter((x) => x.userId !== action.payload.userId);
					const chatUsersFilteredOffline = newChatListOffline[userChatIndexOffline]?.chatusers.filter((x) => x.userId === action.payload.userId)[0];
					if (chatUsersFilteredOffline?.user?.profileStatus) {
						chatUsersFilteredOffline.user.profileStatus = "offline";
						chatUsersFilteredOffline.user.lastSeen = action.payload.lastSeen;
					}
					newChatListOffline[userChatIndexOffline] = {
						...newChatListOffline[userChatIndexOffline],
						chatusers: [...chatUsersOffline, chatUsersFilteredOffline],
					};
					return {
						...state,
						chatList: newChatListOffline,
					};
				}
				return state;
			case CHAT_CONST.SET_USER_STATUS:
				const newChatListStatus = state.chatList;
				const userChatIndexStatus = newChatListStatus.findIndex((item) => item.users.includes(action.payload.userId) && item.type === CONST.CHAT_TYPE.PRIVATE);
				if (userChatIndexStatus !== -1) {
					const chatUsersStatus = newChatListStatus[userChatIndexStatus]?.chatusers.filter((x) => x.userId !== action.payload.userId);
					const chatUsersFilteredStatus = newChatListStatus[userChatIndexStatus]?.chatusers.filter((x) => x.userId === action.payload.userId)[0];
					if (chatUsersFilteredStatus?.user?.profileStatus) {
						chatUsersFilteredStatus.user.profileStatus = action.payload.profileStatus;
						chatUsersFilteredStatus.user.lastSeen = action.payload.lastSeen;
					}
					newChatListStatus[userChatIndexStatus] = {
						...newChatListStatus[userChatIndexStatus],
						chatusers: [...chatUsersStatus, chatUsersFilteredStatus],
					};
					return {
						...state,
						chatList: newChatListStatus,
					};
				}
				return state;
			case CHAT_CONST.UPDATE_USERLIST_STATUS:
				const newUsersList = state.usersList.users;
				const userIndex = newUsersList?.findIndex((item) => item.id === action.payload.userId);
				if (userIndex !== -1) {
					return {
						...state,
						usersList: {
							...state.usersList,
							users: newUsersList.map((item, index) => {
								if (index === userIndex) return { ...item, profileStatus: action.payload.profileStatus };
								return item;
							}),
						},
					};
				}
				return state;
			case CHAT_CONST.SET_PDF_URL:
				return {
					...state,
					pdfData: {
						url: action?.payload,
						filename: action?.fileName,
						id: action?.id,
					},
				};
			case CHAT_CONST.IMAGE_INDEX:
				return { ...state, imageId: action.payload };
			case CHAT_CONST.UPDATE_TASK_ATTACHMENTS:
				return { ...state, taskAttachments: action.payload };
			case CHAT_CONST.SET_THREAD_MESSAGE:
				return { ...state, threadMessage: action.payload };
			case CHAT_CONST.SET_INFO_MESSAGE:
				return { ...state, infoMessage: action.payload };
			case CHAT_CONST.SET_FILES:
				return { ...state, files: action.payload };
			case CHAT_CONST.SET_MEDIA_FILE_TYPE:
				return { ...state, filesType: action.payload };
			case CHAT_CONST.SET_MEDIA_FILES:
				return { ...state, mediaFiles: action.payload };
			case CHAT_CONST.SET_DOCUMENT_FILES:
				return { ...state, documentFiles: action.payload };
			case CHAT_CONST.SET_OFFSET:
				return { ...state, offset: action.payload };
			case CHAT_CONST.SET_COUNT:
				return { ...state, totalCount: action.payload };
			case CHAT_CONST.TOTAL_COUNT_DOWN:
				return { ...state, activeChat: { ...state.activeChat, totalCountDown: action.payload } };
			case "DO_DASHBOARD_UPDATE":
				return { ...state, dashboardUpdate: moment().format() };
			case CHAT_CONST.CLEAR_ERRORS:
				return { ...state, error: null };
			case CHAT_CONST.NEW_MESSAGE_COUNT:
				return {
					...state,
					activeChat: {
						...state.activeChat,
						newMessageCount: action.payload ?? (state.activeChat?.newMessageCount || 0) + 1
					}
				};
			case CHAT_CONST.SET_CHAT_USERS_LIST:
				if (!!action.payload?.length) {
					const chatId = action.payload[0].chatId;
					let obj = {};
					if (state.activeChat.id === chatId)
						obj.activeChat = {
							...state.activeChat,
							users: action.payload
								.filter(i => !i?.isGhostChat && i?.user?.isActive) // && !i?.user?.isDeleted // TODO
								.map(i => i.userId),
							chatusers: action.payload,
						};
					obj.chatList = state.chatList.map((item, index) => {
						if (item.id === chatId) {
							item.chatusers = action.payload;
							return item;
						}
						return item;
					});
					return { ...state, ...obj };
				}
				return state;
			case CHAT_CONST.READ_BY_RECEIPIENT:
				// action.payload.recipientId !==  &&
				if (action.payload.chatId === state.activeChat.id) {
					const messagesList = state.messages.data.rows;
					const newMessagesList = messagesList.map((msg) => ({
						...msg,
						messageIsRead: true,
					}));
					return {
						...state,
						messages: {
							data: {
								...state.messages.data,
								rows: newMessagesList,
							},
						},
					};
				}
				return state;
			case CHAT_CONST.UPDATE_ISMESSAGE:
				let updateIsMessage = state.messages.data.rows;
				const indexIsMsg = updateIsMessage.findIndex((item) => item.id === action.payload.messageId);
				if (indexIsMsg !== -1) {
					return {
						...state,
						messages: {
							data: {
								count: state.messages.data.count,
								rows: updateIsMessage.map((item, index) => {
									if (index === indexIsMsg) return { ...item, ...action.payload };
									return item;
								}),
							},
						},
					};
				}
				return state;
			case "UPDATE_ISMESSAGE_GlobalSearch":
				const searchListIsMsg = state?.chatListData?.messages?.findIndex((item) => item.id === action.payload.messageId);
				if (searchListIsMsg !== -1) {
					return {
						...state,
						chatListData: {
							messages: state?.chatListData?.messages?.map((item, index) => {
								if (index === searchListIsMsg) return { ...item, isMessage: action.payload.isMessage };
								return item;
							}),
						},
					};
				}
				return state;
			case CHAT_CONST.UPDATE_ACTIVE_CHAT:
				return {
					...state,
					activeChat: {
						...state.activeChat,
						...action.payload
					},
				};
			case CHAT_CONST.ADD_REMOVE_CHAT_USER_GROUP:
				if (state.activeChat.id === action.payload.chatId) {
					if (action.payload.type === "remove-member")
						return {
							...state,
							activeChat: {
								...state.activeChat,
								chatusers: state.activeChat.chatusers.filter(i => i.userId !== action.payload.userId),
								users: state.activeChat.users.filter(userId => userId !== action.payload.userId),
							},
						};
					if (action.payload.type === "add-members")
						return {
							...state,
							activeChat: {
								...state.activeChat,
								chatusers: state.activeChat.chatusers.concat(action.payload.users),
								users: state.activeChat.users.concat(action.payload.users.map(i => i.id)),
							},
						};
				}
				return state;
			case CHAT_CONST.REMOVE_CHAT:
				if (action.payload === state.activeChat.id) {
					delete state.activeChat;
					return {
						...state,
						activeChat: { id: -1 },
						chatList: [...state.chatList.filter((item) => item.id !== action.payload)],
					};
				}
				return {
					...state,
					chatList: [...state.chatList.filter((item) => item.id !== action.payload)],
				};
			case CHAT_CONST.ADD_TO_MEDIA_FILES:
				return {
					...state,
					mediaFiles: [...state.mediaFiles, { ...action.payload }],
				};
			case CHAT_CONST.ADD_GROUP_ADMIN:
				let newaddChatusers = state.activeChat.chatusers;
				const indexAdd = newaddChatusers.findIndex((item) => item.userId === action.payload.userId);
				if (indexAdd !== -1)
					newaddChatusers[indexAdd] = {
						...newaddChatusers[indexAdd],
						isAdmin: true,
					};
				let newchatlistAdd = state.chatList;
				const chatlistAddIndex = newchatlistAdd.findIndex((item) => item.id === action.payload.chatId);
				if (chatlistAddIndex !== -1) {
					const chatuserIndex = newchatlistAdd[chatlistAddIndex].chatusers.findIndex((item) => item.userId === action.payload.userId);
					newchatlistAdd[chatlistAddIndex].chatusers[chatuserIndex] = {
						...newchatlistAdd[chatlistAddIndex].chatusers[chatuserIndex],
						isAdmin: true,
					};
				}
				return {
					...state,
					activeChat: {
						...state.activeChat,
						chatusers: newaddChatusers,
					},
					chatList: newchatlistAdd,
				};
			case CHAT_CONST.REMOVE_GROUP_ADMIN:
				let newremoveChatusers = state.activeChat.chatusers;
				const indexRemove = newremoveChatusers.findIndex((item) => item.userId === action.payload.userId);
				if (indexRemove !== -1)
					newremoveChatusers[indexRemove] = {
						...newremoveChatusers[indexRemove],
						isAdmin: false,
					};
				let newchatlistRemove = state.chatList;
				const chatlistRemoveIndex = newchatlistRemove.findIndex((item) => item.id === action.payload.chatId);
				if (chatlistRemoveIndex !== -1) {
					const chatuserIndex = newchatlistRemove[chatlistRemoveIndex].chatusers.findIndex((item) => item.userId === action.payload.userId);
					newchatlistRemove[chatlistRemoveIndex].chatusers[chatuserIndex] = {
						...newchatlistRemove[chatlistRemoveIndex].chatusers[chatuserIndex],
						isAdmin: false,
					};
				}
				return {
					...state,
					activeChat: {
						...state.activeChat,
						chatusers: newremoveChatusers,
					},
					chatList: newchatlistRemove,
				};
			case CHAT_CONST.UPDATE_EDITED_MESSAGE:
				let updateMessages = state.messages.data.rows;
				const indexEditMsg = updateMessages.findIndex((item) => item.id === action.payload.messageId);
				const chatListdataEditMsg = state?.chatListData?.messages?.map((item) => {
					if (item.id === action.payload.messageId) return { ...item, isEdited: true, ...action.payload.messageData };
					return item;
				});
				if (indexEditMsg !== -1) {
					updateMessages[indexEditMsg] = {
						...updateMessages[indexEditMsg],
						mentionusers: action.payload.messageData.updatedMentionUsers,
						isEdited: true,
						...action.payload.messageData,
					};
					return {
						...state,
						chatListData: { messages: chatListdataEditMsg },
						messages: {
							data: {
								count: state.messages.data.count,
								rows: updateMessages,
							},
						},
					};
				}
				return state;
			case CHAT_CONST.UPDATE_DELETE_MESSAGE:
				let updateDeletedMessages = state.messages.data.rows;
				const indexDeleteMessage = updateDeletedMessages.findIndex((item) => item.id === action.payload.id);
				if (indexDeleteMessage !== -1) {
					updateDeletedMessages[indexDeleteMessage] = {
						...updateDeletedMessages[indexDeleteMessage],
						...action.payload,
						isDeleted: true,
						isViewable: true,
					};
					return {
						...state,
						messages: {
							data: {
								count: state.messages.data.count,
								rows: updateDeletedMessages,
							},
						},
					};
				}
				return state;
			case CHAT_CONST.ADD_IMPORTANT_MESSAGE_SUCCESS:
				let messageList = state.messages.data.rows;
				const updatedMessageList = messageList.map((item, index) => {
					if (item.id === action.payload.messageId) item.importantMessage = action.payload;
					return item;
				});
				const chatListMessageList = state?.chatListData?.messages?.map((item, index) => {
					if (item.id === action.payload.messageId) item.importantMessage = action.payload;
					return item;
				});
				return {
					...state,
					loading: false,
					chatListData: { messages: chatListMessageList },
					messages: {
						data: {
							...state.messages.data.count,
							rows: updatedMessageList,
						},
					},
				};
			case CHAT_CONST.REMOVE_IMPORTANT_MESSAGE_SUCCESS:
				let currentMessageList = state.messages.data.rows;
				const updatedNewMessageList = currentMessageList.map((item, index) => {
					if (item.id === action.payload.messageId) item.importantMessage = null;
					return item;
				});
				const updatechatListMessageList = state?.chatListData?.messages?.map((item, index) => {
					if (item.id === action.payload.messageId) item.importantMessage = null;
					return item;
				});
				return {
					...state,
					loading: false,
					chatListData: { messages: updatechatListMessageList },
					messages: {
						data: {
							...state.messages.data.count,
							rows: updatedNewMessageList,
						},
					},
				};
			case CHAT_CONST.ADD_WATCH_MESSAGE_SUCCESS:
				let messageWatchList = state.messages.data.rows;
				const updatedWatchMessageList = messageWatchList.map((item, index) => {
					if (item.id === action.payload.messageId) item.task = { ...item.task, watchList: action.payload };
					return item;
				});
				const addWatchchatListMessageList = state?.chatListData?.messages?.map((item, index) => {
					if (item.id === action.payload.messageId) item.task = { ...item.task, watchList: action.payload };
					return item;
				});
				return {
					...state,
					loading: false,
					chatListData: { messages: addWatchchatListMessageList },
					messages: {
						data: {
							...state.messages.data.count,
							rows: updatedWatchMessageList,
						},
					},
				};
			case CHAT_CONST.REMOVE_WATCH_MESSAGE_SUCCESS:
				let removeWatchCurrentMessageList = state.messages.data.rows;
				const removeWatchUpdatedMessageList = removeWatchCurrentMessageList.map((item, index) => {
					if (item.id === action.payload.messageId) item.task = { ...item.task, watchList: null };
					return item;
				});
				const removeWatchchatListMessageList = state?.chatListData?.messages?.map((item, index) => {
					if (item.id === action.payload.messageId) item.task = { ...item.task, watchList: null };
					return item;
				});
				return {
					...state,
					loading: false,
					chatListData: { messages: removeWatchchatListMessageList },
					messages: {
						data: {
							...state.messages.data.count,
							rows: removeWatchUpdatedMessageList,
						},
					},
				};
			case CHAT_CONST.DELETE_MESSAGE:
				let updateMessagesDeleted = state.messages.data.rows;
				const indexDeleteMsg = updateMessagesDeleted.findIndex((item) => item.id === action.payload.messageId);
				const updateBody = {
					message: "",
					patient: "",
					subject: "",
					mentionusers: [],
					mediaUrl: "",
					fileName: "",
					mediaType: "",
					isDeleted: true,
					task: null,
				};
				if (indexDeleteMsg !== -1) {
					updateMessagesDeleted[indexDeleteMsg] = {
						...updateMessagesDeleted[indexDeleteMsg],
						...updateBody,
					};
					return {
						...state,
						messages: {
							data: {
								count: state.messages.data.count,
								rows: updateMessagesDeleted,
							},
						},
					};
				}
				return state;
			case CHAT_CONST.DELETE_GLOBAL_MESSAGE:
				const updateObjBody = {
					message: "",
					patient: "",
					subject: "",
					mentionusers: [],
					mediaUrl: "",
					fileName: "",
					mediaType: "",
					isDeleted: true,
				};
				return {
					...state,
					chatListData: {
						messages: state.chatListData.messages.map((item, index) => {
							if (item.id === action.payload.deletedMessageId) return { ...item, ...updateObjBody };
							return item;
						}),
					},
				};
			case CHAT_CONST.UPDATE_CHAT_LIST:
				const newUpdateChatList = state.chatList;
				const chatUpdateIndex = newUpdateChatList.findIndex((item) => item.id === action.payload.id);
				if (chatUpdateIndex !== -1) {
					newUpdateChatList[chatUpdateIndex] = {
						...newUpdateChatList[chatUpdateIndex],
						...action.payload,
					};
					return {
						...state,
						chatList: newUpdateChatList,
					};
				}
				return state;
			case CHAT_CONST.UPDATE_SINGLE_CHAT_LIST:
				const UpdateSingleChatList = state.chatList;
				const UpdateSingleDashboardList = state.dashboardList;
				const chatSingleUpdateIndex = UpdateSingleChatList.findIndex((item) => item.id === action.payload?.id);
				const dahsboardSingleUpdateIndex = UpdateSingleDashboardList.findIndex((item) => item.id === action.payload?.id);
				if (chatSingleUpdateIndex !== -1 || dahsboardSingleUpdateIndex !== -1) {
					if (chatSingleUpdateIndex !== -1) {
						UpdateSingleChatList[chatSingleUpdateIndex] = {
							...UpdateSingleChatList[chatSingleUpdateIndex],
							...action.payload,
						};
					}
					if (dahsboardSingleUpdateIndex !== -1) {
						UpdateSingleDashboardList[dahsboardSingleUpdateIndex] = {
							...UpdateSingleDashboardList[dahsboardSingleUpdateIndex],
							...action.payload,
						};
					}
					return {
						...state,
						chatList: UpdateSingleChatList.sort(compareDateTime),
						dashboardList: UpdateSingleDashboardList,
					};
				} else {
					let hiddenChatNotiCount = false;
					// when the chat is not available in chat list, should be there when notification appear
					if (chatSingleUpdateIndex === -1) {
						const chatuserData = action.payload.chatusers.find(i => i.userId === action.userId);
						if (chatuserData && (
							((!chatuserData.isEmergencyNotificationMute && chatuserData.emergencyUnreadMessageCount) ||
								(!chatuserData.isUrgentNotificationMute && chatuserData.urgentUnreadMessageCount) ||
								(!chatuserData.isRoutineNotificationMute && chatuserData.routineUnreadMessageCount)) ||
							(chatuserData.atTheRateMentionMessageCount ||
								chatuserData.hasMentionMessageCount ||
								chatuserData.hasPatientMentionCount))) {
							if (!chatuserData?.isImportantChat) hiddenChatNotiCount = true;
							if ((state.hiddenChats && !chatuserData?.isImportantChat) ||
								(!state.hiddenChats && chatuserData?.isImportantChat) ||
								(!state.hiddenChats && !chatuserData?.isImportantChat && chatuserData.atTheRateMentionMessageCount)) {
								UpdateSingleChatList.push(action.payload);
							}
						}
					}
					return {
						...state,
						chatList: makeUniqueObjects(UpdateSingleChatList.sort(compareDateTime)),
						dashboardList: UpdateSingleDashboardList,
						hiddenChatNotiCount
					};
				}
			case USER_CONST.CREATED_NEW_SUPER_ADMIN:
				const newadminUsersList = state.usersList.users;
				const usersUpdateIndex = newadminUsersList.findIndex((item) => item.id === action.payload.userId);
				if (usersUpdateIndex !== -1) {
					return {
						...state,
						usersList: {
							...state.usersList,
							users: newadminUsersList.map((item, index) => {
								if (index === usersUpdateIndex) return { ...item, roleData: action.payload.roleData };
								return item;
							}),
						},
					};
				}
				return state;
			case CHAT_CONST.SET_USERS_LIST:
				return {
					...state,
					usersList: { ...state.usersList, ...action.payload },
				};
			case CHAT_CONST.SET_ACCOUNT_STATUS:
				const newAccUsersList = state.usersList.users;
				const userAccUpdateIndex = newAccUsersList.findIndex((item) => item.id === action.payload.userId);
				if (userAccUpdateIndex !== -1) {
					return {
						...state,
						usersList: {
							...state.usersList,
							users: newAccUsersList.map((item, index) => {
								if (index === userAccUpdateIndex) return { ...item, isActive: action.payload.isActive };
								return item;
							}),
						},
					};
				}
				return state;
			case CHAT_CONST.SET_USER_ROLE_LIST_ADD:
				const addAccUsersList = state.usersList.users;
				return {
					...state,
					usersList: {
						...state.usersList,
						count: action.payload.count,
						users: [action.payload.user, ...addAccUsersList],
					},
				};
			case MODEL_CONST.SET_USER_ROLE_LIST_UPDATE:
				const updateAccUsersList = state.usersList.users;
				const userUpdateIndex = updateAccUsersList.findIndex((item) => item.id === action.payload.id);
				if (userUpdateIndex !== -1) {
					return {
						...state,
						usersList: {
							...state.usersList,
							users: updateAccUsersList.map((item, index) => {
								if (index === userUpdateIndex) return { ...item, ...action.payload };
								return item;
							}),
						},
					};
				}
				return state;
			case CHAT_CONST.SET_USER_ROLE_LIST_DELETE:
				const deleteAccUsersList = state.usersList.users;
				const userdeleteIndex = deleteAccUsersList.findIndex((item) => item.id === action.payload.userId);
				if (userdeleteIndex !== -1) {
					return {
						...state,
						isDeletedChange: moment().format(),
					};
				}
				return state;
			case CHAT_CONST.SET_CHAT_TIMER_SETTINGS:
				let newactiveChatTimer = state.activeChat;
				let newChatlistTimer = state.chatList;
				let chatlistTimerIndex = newChatlistTimer.findIndex((item) => item.id === action.payload.chatId);
				if (newactiveChatTimer.id === action.payload.chatId) {
					newactiveChatTimer = {
						...newactiveChatTimer,
						...action.payload.data,
					};
				}
				if (chatlistTimerIndex !== -1) {
					newChatlistTimer[chatlistTimerIndex] = {
						...newChatlistTimer[chatlistTimerIndex],
						...action.payload.data,
					};
				}
				return {
					...state,
					activeChat: newactiveChatTimer,
					chatList: newChatlistTimer,
				};
			case CHAT_CONST.SET_UNREAD_USERS_ADMIN:
				let newactiveChatUnreadUser = state.activeChat;
				let newChatlistUnreadUser = state.chatList;
				let chatlistUnreadUserIndex = newChatlistUnreadUser.findIndex((item) => item.id === action.payload.chatId);
				if (newactiveChatUnreadUser.id === action.payload.chatId) {
					newactiveChatUnreadUser = {
						...newactiveChatUnreadUser,
						unreadUsersArr: action.payload.chatUserArray,
					};
				}
				if (chatlistUnreadUserIndex !== -1) {
					newChatlistUnreadUser[chatlistUnreadUserIndex] = {
						...newChatlistUnreadUser[chatlistUnreadUserIndex],
						unreadUsersArr: action.payload.chatUserArray,
					};
				}
				return {
					...state,
					activeChat: newactiveChatUnreadUser,
					chatList: newChatlistUnreadUser,
				};
			case USER_CONST.UPDATE_GROUP_DATA:
				let updateChatList = state.chatList;
				let updateactivechat = {};
				let updateChatListIndex = updateChatList.findIndex((item) => item.id === action.payload.chatId);
				if (updateChatListIndex !== -1) {
					if (state.activeChat.id === action.payload.chatId) {
						updateactivechat = {
							...action.payload.data,
						};
					}
					updateChatList[updateChatListIndex] = {
						...updateChatList[updateChatListIndex],
						...action.payload.data,
					};
					return {
						...state,
						chatList: updateChatList,
						activeChat: {
							...state.activeChat,
							...updateactivechat,
						},
					};
				}
				return state;
			case CHAT_CONST.RES_SEARCH_CHATLIST_DATA:
				if (action.payload) {
					return {
						...state,
						chatListData: {
							...state.chatListData,
							...action.payload.data,
						},
					};
				}
				return state;
			case CHAT_CONST.CLEAR_CHAT_LIST_DATA:
				return {
					...state,
					chatList: [],
					chatListData: initialState.chatListData,
				};
			case CHAT_CONST.CLEAR_PATIENT_LIST_DATA:
				return {
					...state,
					patientList: [],
				};
			case CHAT_CONST.CLEAR_CATEGORY_LIST_DATA:
				return {
					...state,
					categoryList: [],
				};
			case CHAT_CONST.APPEND_SEARCH_CHAT_CHATLIST_DATA:
				if (action.payload) {
					return {
						...state,
						chatList: makeUniqueObjects([...state.chatList, ...action.payload]),
					};
				}
				return state;
			case CHAT_CONST.APPEND_SEARCH_CHAT_PATIENTLIST_DATA:
				if (action.payload) {
					let updatePatient = action.payload;
					if (action?.initial && state.activePatientChat && updatePatient[0].id === state.activePatientChat.id)
						updatePatient[0].patientAssigns = []
					return {
						...state,
						patientList: makeUniqueObjects(
							action?.initial ? [...updatePatient, ...state.patientList] : state.patientList.concat(action.payload))
						// .sort((a, b) => {
						// 	let aTime, bTime;
						// 	if (a?.mentionusers && !!a?.mentionusers.length) aTime = a?.mentionusers[0]?.message?.createdAt;
						// 	else aTime = a.updatedAt;
						// 	if (b?.mentionusers && !!b?.mentionusers.length) bTime = b?.mentionusers[0]?.message?.createdAt;
						// 	else bTime = b.updatedAt;
						// 	if (aTime && bTime) {
						// 		if (new Date(aTime) < new Date(bTime)) return 1;
						// 		if (new Date(aTime) > new Date(bTime)) return -1;
						// 	}
						// 	return 0;
						// }),
					};
				}
				return state;
			case CHAT_CONST.APPEND_SEARCH_CHAT_CATEGORYLIST_DATA:
				if (action.payload) {
					let updateCategory = action.payload;
					if (action?.initial && state.activeCategoryChat && updateCategory[0].id === state.activeCategoryChat.id)
						updateCategory[0].categoryChats = []
					return {
						...state,
						categoryList: makeUniqueObjects(
							action?.initial ? [...updateCategory, ...state.categoryList] : state.categoryList.concat(action.payload))
					};
				}
				return state;
			case CHAT_CONST.APPEND_SEARCH_CHATLIST_DATA:
				if (action.payload) {
					return {
						...state,
						chatListData: {
							...state.chatListData,
							messages: [...state.chatListData.messages, ...action.payload],
						},
					};
				}
				return state;
			case CHAT_CONST.SET_GLOBAL_SEARCH:
				return {
					...state,
					globalSearch: action.payload ? [action.payload] : null,
				};
			case CHAT_CONST.SET_FORWARD_MSG:
				return {
					...state,
					activeChat: {
						...state.activeChat,
						forwardMsg: action.payload,
					},
				};
			case CHAT_CONST.RES_CREATE_DESIGNATION:
				return {
					...state,
					userDesignations: [action.payload, ...state.userDesignations].sort(compareByName),
				};
			case CHAT_CONST.RES_DELETE_DESIGNATION:
				return {
					...state,
					userDesignations: state.userDesignations.filter((item) => item.id !== parseInt(action.payload)).sort(compareByName),
				};
			case CHAT_CONST.RES_UPDATE_DESIGNATION:
				let newUsersDesg = state.userDesignations;
				const desgIndex = newUsersDesg.findIndex((item) => item.id === action.payload.id);
				if (desgIndex !== -1) {
					return {
						...state,
						userDesignations: newUsersDesg
							.map((item, index) => {
								if (index === desgIndex) return { ...item, ...action.payload };
								return item;
							})
							.sort(compareByName),
					};
				}
				return state;
			case CHAT_CONST.VERIFY_HIDDEN_CHAT_MENTION:
				const counts = state.chatList.map((item) => {
					const chatuserData = item.chatusers.find(i => i.userId === action.userId);
					if (chatuserData && (chatuserData.atTheRateMentionMessageCount)) {
						if (!chatuserData?.isImportantChat && chatuserData.atTheRateMentionMessageCount) return chatuserData.atTheRateMentionMessageCount;
					}
					return 0;
				});
				return { ...state, hiddenChatNotiCount: counts.reduce((a, b) => a + b, 0) };
			case CHAT_CONST.SET_HIDDEN_NOTI_COUNT:
				return { ...state, hiddenChatNotiCount: action.payload };
			// **************************************
			// **************************************
			// **************************************
			// >>>>>> Patient Chat
			// **************************************
			// **************************************
			// **************************************
			case CHAT_CONST.SET_ACTIVE_PATIENT_CHAT:
				return {
					...state,
					loading: false,
					activePatientChat: action.payload,
					activeCategoryChat: null,
					activeChat: { id: -1 },
				};
			// **************************************
			// **************************************
			// **************************************
			// >>>>>> Category Chat
			// **************************************
			// **************************************
			// **************************************
			case CHAT_CONST.SET_ACTIVE_CATEGORY_CHAT:
				return {
					...state,
					loading: false,
					activeCategoryChat: action.payload,
					activePatientChat: null,
					activeChat: { id: -1 },
				};
			case "RECONNECTED_REFRESH_CHATS":
				// const chatIds = state.chatList.map((item) => item.id);
				// updateChats(state, chatIds)
				return { ...state, refreshChats: action.payload };
			default:
				return state;
		}
	} catch (error) {
		console.error(error);
	}
};

export const compareDateTime = (a, b) => {
	let aTime, bTime;
	if (a?.messages && !!a?.messages.length) aTime = a?.messages[0]?.createdAt;
	else aTime = a.updatedAt;
	if (b?.messages && !!b?.messages.length) bTime = b?.messages[0]?.createdAt;
	else bTime = b.updatedAt;
	if (aTime && bTime) {
		if (new Date(aTime) < new Date(bTime)) return 1;
		if (new Date(aTime) > new Date(bTime)) return -1;
	}
	return 0;
};
