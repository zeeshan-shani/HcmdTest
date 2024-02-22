import axios from "axios";
import { dispatch, getState } from "redux/store";
import { CONST, SOCKET } from "utils/constants";
import { changeTask } from "redux/actions/modelAction";
import { showError, showSuccess } from "utils/package_config/toast";
import { LOADER, CHAT_CONST } from "redux/constants/chatConstants";
import {
  clearBadge,
  generatePayload,
  setBadge,
  toastPromise,
} from "redux/common";
import {
  ConnectInNewChat,
  notifyUsers,
  SocketEmiter,
} from "utils/wssConnection/Socket";

import { setUserHandler } from "Routes/Chat/Sidebar/Chat";
import {
  messageRef,
  ScrolltoOrigin,
} from "Routes/Chat/Main/UserChat/message/ChatMessages";
import { CHAT_MODELS } from "Routes/Chat/Models/models";
import announcementService from "services/APIs/services/announcementService";
import chatService from "services/APIs/services/chatService";
import userService from "services/APIs/services/userService";
import patientService from "services/APIs/services/patientService";
import messageService from "services/APIs/services/messageService";
import importantMessageService from "services/APIs/services/importantMessageService";
import watchlistService from "services/APIs/services/watchlistService";

export let cancelToken = {
  announceToChat: null,
};

export const announceToChat =
  (announcementData) => async (dispatch, getState) => {
    try {
      const cancelToken = {};
      // Cancel any previous requests
      if (cancelToken?.announceToChat) {
        cancelToken?.announceToChat.cancel(
          "Operation canceled due to new request."
        );
      }

      // Create a new cancel token for this request
      cancelToken.announceToChat = axios.CancelToken.source();

      const payload = announcementData;
      const config = { cancelToken: cancelToken?.announceToChat.token };

      dispatch({ type: LOADER.ANNOUNCE_LOADER, payload: true });

      const data = await announcementService.announce({ payload, config });

      dispatch({ type: CHAT_CONST.ANNOUNCE_SUCCESS, payload: data.data });
      dispatch({ type: LOADER.ANNOUNCE_LOADER, payload: false });
    } catch (error) {
      dispatch({ type: LOADER.ANNOUNCE_LOADER, payload: false });
      dispatch({ type: CHAT_CONST.ANNOUNCE_FAIL, payload: error });
    }
  };

export const addAnnouncement = (announcement) => ({
  type: CHAT_CONST.ADD_ANNOUNCEMENT,
  payload: announcement,
});

export const loadAnnouncementList = () => {
  return async (dispatch) => {
    try {
      if (cancelToken?.loadAnnouncementList) {
        cancelToken?.loadAnnouncementList.cancel(
          "Operation canceled due to new request."
        );
      }
      cancelToken.loadAnnouncementList = axios.CancelToken.source();

      const payload = {}; // You can include any necessary parameters here
      const config = { cancelToken: cancelToken?.loadAnnouncementList.token };

      dispatch({ type: LOADER.ANNOUNCEMENT_LOADER, payload: true });

      const { data } = await announcementService.getAnnouncementList({
        payload,
        config,
      });
      // console.log(data);

      dispatch({
        type: CHAT_CONST.LOAD_ANNOUNCEMENT_LIST_SUCCESS,
        payload: data,
      });
      dispatch({ type: LOADER.ANNOUNCEMENT_LOADER, payload: false });
    } catch (error) {
      dispatch({ type: LOADER.ANNOUNCEMENT_LOADER, payload: false });
      dispatch({
        type: CHAT_CONST.LOAD_ANNOUNCEMENT_LIST_FAIL,
        payload: error,
      });
    }
  };
};

export const loadUserDashboardList = async (userId, filterData) => {
  try {
    if (cancelToken?.loadUserDashboardList)
      cancelToken?.loadUserDashboardList.cancel(
        "Operation cancel due to new request."
      );
    cancelToken.loadUserDashboardList = axios.CancelToken.source();
    const payload = { userId, filterData };
    const config = { cancelToken: cancelToken?.loadUserDashboardList.token };
    dispatch({ type: LOADER.DASHBOARD_LOADER, payload: true });
    const data = await chatService.dashboardList({ payload, config });
    dispatch({
      type: CHAT_CONST.LOAD_DASHBOARD_LIST_SUCCESS,
      payload: data.data,
    });
    dispatch({ type: LOADER.DASHBOARD_LOADER, payload: false });
  } catch (error) {
    dispatch({ type: LOADER.DASHBOARD_LOADER, payload: false });
    dispatch({ type: CHAT_CONST.LOAD_CHAT_USER_LIST_FAIL, payload: error });
  }
};

export const loadUserChatList = async (payload) => {
  try {
    if (cancelToken?.loadUserChatList)
      cancelToken?.loadUserChatList.cancel(
        "Operation cancel due to new request."
      );
    cancelToken.loadUserChatList = axios.CancelToken.source();
    const config = { cancelToken: cancelToken?.loadUserChatList.token };
    !payload?.options?.pagination &&
      dispatch({ type: LOADER.CHATLIST_LOADER, payload: true });
    const data = await chatService.chatList({ payload, config });
    if (!payload?.options?.pagination) {
      dispatch({
        type: CHAT_CONST.LOAD_CHAT_LIST_SUCCESS,
        payload: data.data.rows,
      });
      dispatch({ type: LOADER.CHATLIST_LOADER, payload: false });
    }
    return data;
  } catch (error) {
    console.error(error);
    dispatch({ type: LOADER.CHATLIST_LOADER, payload: false });
    dispatch({ type: CHAT_CONST.LOAD_CHAT_USER_LIST_FAIL, payload: error });
    return { status: 0 };
  }
};

export const getChatUsers = async (chatId) => {
  try {
    if (cancelToken?.getChatUsers)
      cancelToken?.getChatUsers.cancel("Operation cancel due to new request.");
    cancelToken.getChatUsers = axios.CancelToken.source();
    const config = { cancelToken: cancelToken?.getChatUsers.token };
    const payload = {
      query: { chatId },
      options: { populate: ["roles:isActive"] },
    };
    const data = await chatService.chatuserList({ payload, config });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const setActiveChat = async (item, messageAt = null) => {
  try {
    window.history.pushState({ noBackExitsApp: true }, "");
    dispatch({ type: CHAT_CONST.SET_ACTIVE_CHAT_REQUEST });
    dispatch({
      type: CHAT_CONST.SET_ACTIVE_CHAT_SUCCESS,
      payload: item,
      messageAt,
    });
  } catch (error) {
    dispatch({ type: CHAT_CONST.SET_ACTIVE_CHAT_FAIL, payload: error });
  }
};

export const setPatientChat = async (item) => {
  try {
    window.history.pushState({ noBackExitsApp: true }, "");
    dispatch({ type: CHAT_CONST.SET_ACTIVE_PATIENT_CHAT, payload: item });
  } catch (error) {
    dispatch({ type: CHAT_CONST.SET_ACTIVE_CHAT_FAIL, payload: error });
  }
};
export const setCategoryChat = async (item) => {
  try {
    window.history.pushState({ noBackExitsApp: true }, "");
    dispatch({ type: CHAT_CONST.SET_ACTIVE_CATEGORY_CHAT, payload: item });
  } catch (error) {
    dispatch({ type: CHAT_CONST.SET_ACTIVE_CHAT_FAIL, payload: error });
  }
};

export const getMessages = async ({
  search = [],
  type = "",
  offset = 0,
  limit = CONST.MESSAGE_GET_LIMIT,
  filterMethod,
  taggedSearch,
}) => {
  try {
    const activeChat = getState().chat?.activeChat;
    const userId = getState().user?.user?.id;
    if (!taggedSearch && cancelToken?.getMessages)
      cancelToken?.getMessages.cancel("Operation cancel due to new request.");
    cancelToken.getMessages = axios.CancelToken.source();
    let config = {
      cancelToken: !taggedSearch && cancelToken?.getMessages.token,
      headers: {},
    };
    let payload = {
      search,
      type,
      filterMethod,
      chatId: activeChat.id,
      limit,
      offset,
    };
    if (activeChat?.id !== -1) {
      const chatuser = activeChat?.chatusers?.find(
        (usr) => usr.userId === userId
      );
      if (chatuser && chatuser.hasOwnProperty("initialMessage"))
        config.headers["initialMessage"] = chatuser?.initialMessage || false;
      if (chatuser && chatuser?.createdAt)
        payload.createdAt = chatuser?.createdAt;
    }
    let data = await messageService.messageList({ payload, config });
    if (data?.data?.rows)
      data.data.rows = data.data.rows.sort((a, b) => {
        if (a.id > b.id) return -1;
        if (a.id < b.id) return 1;
        return 0;
      });
    return data;
  } catch (error) {
    // showError(error?.response?.data?.message);
    console.error(error);
  }
};
export const getMessages2 = async ({
  messageId,
  search = [],
  type = "",
  offset = 0,
  limit = CONST.MESSAGE_GET_LIMIT,
  filterMethod,
  taggedSearch,
  includeMessage = false,
  pagitionFlow = "UP",
}) => {
  try {
    const activeChat = getState().chat?.activeChat;
    const userId = getState().user?.user?.id;
    if (!taggedSearch && cancelToken?.getMessages)
      cancelToken?.getMessages.cancel("Operation cancel due to new request.");
    cancelToken.getMessages = axios.CancelToken.source();
    let config = {
      cancelToken: !taggedSearch && cancelToken?.getMessages.token,
      headers: {},
    };
    let payload = {
      search,
      type,
      filterMethod,
      chatId: activeChat.id,
      limit,
      offset,
      messageId,
      pagitionFlow,
      includeMessage,
    };
    if (activeChat?.id !== -1) {
      const chatuser = activeChat?.chatusers?.find(
        (usr) => usr.userId === userId
      );
      if (chatuser && chatuser.hasOwnProperty("initialMessage"))
        config.headers["initialMessage"] = chatuser?.initialMessage || false;
      if (chatuser && chatuser?.createdAt)
        payload.createdAt = chatuser?.createdAt;
    }
    const data = await messageService.messageList({ payload, config });
    if (data?.data?.rows)
      data.data.rows = data.data.rows.sort((a, b) => {
        if (a.id > b.id) return -1;
        if (a.id < b.id) return 1;
        return 0;
      });
    return data;
  } catch (error) {
    // showError(error?.response?.data?.message);
    console.error(error);
  }
};

export const getLengthFromLastMessage = async (payload) => {
  try {
    const data = await messageService.getCountrange({ payload });
    return data;
  } catch (error) {
    showError(error?.response?.data?.message);
    console.error(error);
  }
};

// Create Private Chat
export const CreatePrivateChat = async (id, userId) => {
  try {
    const payload = { type: CONST.CHAT_TYPE.PRIVATE, users: [userId, id] };
    const data = await chatService.createChat({ payload });
    return data;
  } catch (error) {
    showError(error?.response?.data?.message);
    console.error(error);
  }
};

// Get Users List
export const getUsersList = async (payload) => {
  try {
    if (cancelToken?.getUsersList)
      cancelToken?.getUsersList.cancel("Operation cancel due to new request.");
    cancelToken.getUsersList = axios.CancelToken.source();
    const config = { cancelToken: cancelToken?.getUsersList.token };
    const data = await userService.list({ payload, config });
    return data;
  } catch (error) {
    console.error(error);
  }
};

// Set Current Message for Getting Thread Responses
export const setThreadMessage = async (message = null) => {
  dispatch({ type: CHAT_CONST.SET_THREAD_MESSAGE, payload: message });
};
export const setInfoMessage = async (messageId) => {
  dispatch({ type: CHAT_CONST.SET_INFO_MESSAGE, payload: messageId });
  changeTask(CHAT_MODELS.MESSAGE_INFO);
};

// Get Thread Message Responses
export const getResponseofThread = async (
  messageId,
  threadType = CONST.THREAD_TYPE.CHILD
) => {
  try {
    const payload = { messageId, threadType };
    const data = await messageService.getThreadList({ payload });
    return data;
  } catch (error) {
    showError(error?.response?.data?.message);
    console.error(error);
  }
};

// Get Media Files for ActiveChat
export const getFilesData = async (chatId, type, search) => {
  try {
    const payload = { chatId, type, search };
    const data = await messageService.getMediaList({ payload });
    return data;
  } catch (error) {
    console.error(error);
  }
};

// Set Mute Notification Setting
export const saveNotificationSettings = async ({
  chatId,
  isRoutineNotificationMute,
  isEmergencyNotificationMute,
  isUrgentNotificationMute,
  isImportantChat,
}) => {
  try {
    if (cancelToken?.saveNotificationSettings)
      cancelToken?.saveNotificationSettings.cancel(
        "Operation cancel due to new request."
      );
    cancelToken.saveNotificationSettings = axios.CancelToken.source();
    const config = { cancelToken: cancelToken?.saveNotificationSettings.token };
    const payload = {
      chatId,
      isRoutineNotificationMute,
      isEmergencyNotificationMute,
      isUrgentNotificationMute,
      isImportantChat,
    };
    const data = await chatService.muteNotification({ payload, config });
    return data;
  } catch (error) {
    showError(error?.response?.data?.message);
    console.error(error);
  }
};

// Add as Important Message
export const addImportantMessage = async (message, type) => {
  try {
    let payload = { type, chatId: message.chatId, messageId: message.id };
    const data = await importantMessageService.update({ payload });
    if (data.status === 1)
      dispatch({
        type: CHAT_CONST.ADD_IMPORTANT_MESSAGE_SUCCESS,
        payload: data.data,
      });
  } catch (error) {
    showError(error?.response?.data?.message);
    console.error(error);
  }
};

// Remove Important Tag from Message
export const removeImportantMessage = async (message, type) => {
  try {
    let payload = {
      type: type,
      importantMessageId: message.importantMessage.id,
      chatId: message.chatId,
      messageId: message.id,
    };
    const data = await importantMessageService.update({ payload });
    if (data.status === 1)
      dispatch({
        type: CHAT_CONST.REMOVE_IMPORTANT_MESSAGE_SUCCESS,
        payload: data.data,
      });
  } catch (error) {
    showError(error?.response?.data?.message);
    console.error(error);
  }
};

// Add as Watch Message
export const addWatchMessage = async (message, type) => {
  try {
    let payload = {
      messageId: message.id,
      taskId: message.task.id,
      chatId: message.chatId,
      type,
    };
    const data = await watchlistService.update({ payload });
    dispatch({
      type: CHAT_CONST.ADD_WATCH_MESSAGE_SUCCESS,
      payload: data.data,
    });
  } catch (error) {
    showError(error?.response?.data?.message);
    console.error(error);
  }
};

// Remove Watch from Message
export const removeWatchMessage = async (payload, type, watchListId) => {
  try {
    if (type === "remove") payload.id = watchListId || undefined;
    const data = await watchlistService.update({ payload });
    dispatch({
      type: CHAT_CONST.REMOVE_WATCH_MESSAGE_SUCCESS,
      payload: data.data,
    });
  } catch (error) {
    showError(error?.response?.data?.message);
    console.error(error);
  }
};

export const checkNotifications = async (dashboardList, chatList, userId) => {
  try {
    const getCounts = async () => {
      if (!dashboardList?.length && !chatList?.length) {
        clearBadge();
        return;
      }
      let list = window.location.pathname.includes("dashboard")
        ? dashboardList
        : chatList;
      // let list = dashboardList.length > chatList.length ? dashboardList : chatList;
      let chatCountArr = [];
      chatCountArr = list?.map((chat) => {
        const userData = chat?.chatusers?.find((usr) => usr.userId === userId);
        if (!userData) return null;
        const chatTotal = Number(
          // userData?.atTheRateMentionMessageCount +
          // 	userData?.hasMentionMessageCount +
          userData?.emergencyUnreadMessageCount +
            userData?.routineUnreadMessageCount +
            userData?.urgentUnreadMessageCount
        );
        return chatTotal;
      });
      return !!chatCountArr.length ? chatCountArr?.reduce((a, b) => a + b) : 0;
    };
    const count = await getCounts();
    const val = parseInt(count, 10);
    if (!val || isNaN(val)) {
      clearBadge();
      return;
    }
    setBadge(val);
  } catch (error) {
    console.error(error);
  }
};

export const setReplyPrivatelyMessage = async (item, user, navigate) => {
	const res = await CreatePrivateChat(item.sendBy, user.id);
	if (res?.status === 1) {
		const payload = await generatePayload({
			// rest: { includeChatUserDetails: false },
			options: { "populate": ["lastMessage", "chatUser"] },
			isCount: true,
		});
		loadUserChatList(payload);
		notifyUsers(res.data.createdBy, res.data.id, res.data.users, res.data.type);
		setUserHandler({ chat: res.data, activeChatId: item.chatId, userId: user.id, navigate });
		ConnectInNewChat(res.data, user.id);
		dispatch({ type: CHAT_CONST.SET_CHAT_QUOTE_MSG, payload: item });
	} else if (res?.status === 2) {
		setUserHandler({ chat: res.data, activeChatId: item.chatId, userId: user.id, navigate });
		dispatch({ type: CHAT_CONST.SET_CHAT_QUOTE_MSG, payload: item });
	}
};

export const moveChatandQMessage = async ({ chatList = [], activeChat = { id: -1 }, user, qMessage, navigate }) => {
	try {
		if (messageRef[qMessage.id]) return ScrolltoOrigin(qMessage, 25);
		let itemChat = qMessage?.chatDetails;
		itemChat = itemChat || chatList.find((chat) => chat.id === qMessage?.chatId);
		if (!itemChat) {
			const { data } = await chatService.getChatData({ payload: { id: qMessage.chatId } });
			itemChat = data;
		}
		if (qMessage && itemChat) {
			// const [lastMessage] = itemChat.messages;
			await toastPromise({
				func: async (myResolve, myReject) => {
					try {
						// const resLength = await getLengthFromLastMessage({
						// 	chatId: qMessage?.chatId,
						// 	rquestedMessageId: qMessage.id,
						// 	currentMessageId: lastMessage.id,
						// });
						// setUserHandler({ chat: itemChat, activeChatId: activeChat.id, userId: user.id, messageAt: resLength.data, navigate });
						setUserHandler({ chat: itemChat, activeChatId: activeChat.id, userId: user.id, messageAt: qMessage.id, navigate });
						// if (resLength > 100) {
						const res = await getMessages2({ messageId: qMessage.id, pagitionFlow: "DOWN", includeMessage: true });
						dispatch({ type: CHAT_CONST.GET_MESSAGES_SUCCESS, payload: { data: { count: res.data.count, rows: res.data.rows, down: true } } });
						// }
						// else {
						// 	const res = await getMessages({ limit: resLength.data > CONST.MESSAGE_GET_LIMIT ? resLength.data : CONST.MESSAGE_GET_LIMIT });
						// 	dispatch({ type: CHAT_CONST.GET_MESSAGES_SUCCESS, payload: { data: { count: res.data.count, rows: res.data.rows } } });
						// }
						dispatch({ type: CHAT_CONST.TOTAL_COUNT_DOWN, payload: res.data.count - CONST.MESSAGE_GET_LIMIT });
						dispatch({ type: "SET_MESSAGEAT", payload: null });
						ScrolltoOrigin(qMessage);
						myResolve("OK");
					} catch (error) {
						myReject("Error");
					}
				},
				loading: "Requesting for message...",
				success: <b>Successfully get message</b>,
				error: <b>Could not get message.</b>,
				options: { id: "get-reply-message" }
			})
		}
	} catch (error) {
		console.error(error);
	}
};

export const getPatientList = async (payload = {}) => {
  if (cancelToken?.getPatientList)
    cancelToken.getPatientList.cancel("Operation cancel due to new request.");
  cancelToken.getPatientList = axios.CancelToken.source();
  const config = { cancelToken: cancelToken.getPatientList.token };
  const data = await patientService.list({ payload, config });
  return data;
};

export const deletePatient = async (body = {}) => {
  try {
    const data = await patientService.delete({ payload: { id: body.id } });
    showSuccess("Patient deleted successfully.");
    return data;
  } catch (error) {
    showError("Could not delete patient.");
  }
};
export const updatePatient = async (payload = {}) => {
  try {
    if (cancelToken?.updatePatient)
      cancelToken.updatePatient.cancel("Operation cancel due to new request.");
    cancelToken.updatePatient = axios.CancelToken.source();
    const config = { cancelToken: cancelToken.updatePatient.token };
    const data = await patientService.update({ payload, config });
    showSuccess("Patient Updated successfully.");
    return data;
  } catch (error) {
    showError("Could not update patient.");
  }
};

export const getMediaFiles = async (
  activeChatId,
  type = "media",
  search = ""
) => {
  const res = await getFilesData(activeChatId, type, search);
  if (res?.status)
    dispatch({
      type:
        type === "media"
          ? CHAT_CONST.SET_MEDIA_FILES
          : CHAT_CONST.SET_DOCUMENT_FILES,
      payload: res?.data.rows,
    });
};

export const getSendToUsers = (userId, chatType, chatusers = []) => {
  if (chatusers[0] && isNaN(chatusers[0])) {
    if (chatType === CONST.CHAT_TYPE.GROUP)
      return chatusers
        .filter((x) => x.userId !== userId)
        .map((item) => item.userId);
    if (chatusers[0].userId === chatusers[1].userId) return chatusers[0].userId;
    return chatusers.find((x) => x.userId !== userId)?.userId;
  } else {
    if (chatType === CONST.CHAT_TYPE.PRIVATE) {
      if (chatusers[0] === chatusers[1]) return chatusers[0];
      return chatusers.find((x) => x !== userId);
    }
    return chatusers.filter((x) => x !== userId);
  }
};
export const setThreadMessageView = (message) => {
  if (!message) return;
  setThreadMessage(message);
  changeTask(CHAT_MODELS.THREAD_ITEM);
};
export const checkAudios = () => {
  // Get all <audio> elements.
  const audios = document.querySelectorAll("audio");
  // Pause all <audio> elements except for the one that started playing.
  function pauseOtherAudios({ target }) {
    for (const audio of audios) if (audio !== target) audio.pause();
  }
  // Listen for the 'play' event on all the <audio> elements.
  for (const audio of audios) audio.addEventListener("play", pauseOtherAudios);
};

export const changeChatBackground = (payload) =>
	SocketEmiter(SOCKET.REQUEST.UPDATE_CHAT_BACKGROUND, payload, (data) => {
		dispatch({ type: CHAT_CONST.UPDATE_CHAT_BACKGROUND, payload: data });
	})

export const getChatName = ({ chat, userId }) => {
	let chatname = chat?.name || 'Unknown group'
	if (chat && chat.type === CONST.CHAT_TYPE.PRIVATE) {
		const privUsrId = chat.users.find(item => item !== userId) || ((chat.users[0] === chat.users[1]) ? chat.chatusers[0].user.id : null);
		const privateUser = chat?.chatusers?.find(item => item.userId === privUsrId)?.user;
		chatname = (privateUser?.id === userId ? `${privateUser?.name} (You)` : privateUser?.name) || 'Unknown user';
	}
	return chatname;
}