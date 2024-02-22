import { CONST, SOCKET } from "utils/constants";
import { showError, showSuccess } from "utils/package_config/toast";
import { getChatTaskList } from "Routes/TaskBoard/TaskPage";
import { SocketListener } from "utils/wssConnection/Socket";
import { showNotificationfunc } from "redux/common";
import { cmmtUpdateToast, customTaskAlertToast } from "utils/package_config/hot-toast";
import { TASK_CONST } from "redux/constants/taskConstants";
import { dispatch, getState } from "redux/store";

export const listenTaskActivities = (activeChatId) => {
	SocketListener("SOCKET_TASK", (response) => {
		const { data, id } = response;
		const taskDetails = getState().task?.taskDetails || { id: -1 };
		switch (id) {
			case SOCKET.RESPONSE.DELETE_TASK:
				if (activeChatId === data.chatId || activeChatId === 0)
					dispatch({ type: TASK_CONST.RECEIVE_TASK_DELETED, payload: data });
				break;
			case SOCKET.RESPONSE.UPDATE_TASK:
				if (data && data.status === 0 && data.message) return showError(data.message)
				if (data && data.status === 1 && getState().task?.taskDetails?.id === data?.data?.id) {
					dispatch({ type: TASK_CONST.UPDATE_TASK_DETAILS, payload: data.data });
					dispatch({ type: TASK_CONST.UPDATE_ACTIVITY_LOGS });
				}
				// for task alert list, if any task finishes and exist in alert list it will be removed
				if (data && data.status === 1 && data.data.status === CONST.TASK_STATUS[3].value) {
					dispatch({ type: TASK_CONST.FINISHED_TASK_ID_FOR_ALERTLIST, payload: data.data.id });
				}
				break;
			case SOCKET.RESPONSE.ADD_TASK_COMMENT:
				if (data.status === 1 && data.data.taskId === taskDetails?.id) {
					if (data.data?.subTaskId) {
						dispatch({
							type: TASK_CONST.ADD_NEW_SUBTASK_COMMENT,
							payload: {
								subTaskId: data.data?.subTaskId,
								taskId: taskDetails?.id,
								newComment: data.data,
							},
						});
					} else {
						if (data?.data?.replyCommentId) dispatch({ type: TASK_CONST.ADD_NEW_REPLY_COMMENT, payload: data.data });
						else dispatch({ type: TASK_CONST.ADD_NEW_TASK_COMMENT, payload: data.data });
					}
				}
				break;
			case SOCKET.RESPONSE.MENTION_TASK_COMMENT:
				showNotificationfunc({ msg: data.message });
				showSuccess(data.message);
				break;
			case SOCKET.RESPONSE.UPDATE_TASK_COMMENT:
				if (data.data.taskId === taskDetails?.id && data.status === 1)
					dispatch({ type: TASK_CONST.UPDATE_TASK_COMMENT, payload: data.data });
				break;
			case SOCKET.RESPONSE.DELETE_TASK_COMMENT:
				if (data?.data?.isSubTask)
					dispatch({ type: TASK_CONST.DELETE_SUBTASK_COMMENT, payload: data.data });
				else
					dispatch({ type: TASK_CONST.DELETE_TASK_COMMENT, payload: data.data });
				break;
			case SOCKET.RESPONSE.UPDATE_REVIEW_STATUS:
				if (taskDetails?.id !== -1 && taskDetails?.id === data.provider.taskId)
					dispatch({ type: TASK_CONST.UPDATE_REVIEW_STATUS, payload: data });
				break;
			case SOCKET.RESPONSE.UPDATE_TASK_DATA:
				if (data.data.id === taskDetails?.id) {
					dispatch({ type: TASK_CONST.UPDATE_TASK_DETAILS, payload: data.data });
					dispatch({ type: TASK_CONST.UPDATE_ACTIVITY_LOGS });
				}
				break;
			case SOCKET.RESPONSE.GET_TASK_NOTIFICATION:
				if (taskDetails && taskDetails.id === data.data.taskId)
					cmmtUpdateToast(data, taskDetails.userId, taskDetails.chatId, taskDetails.chatList);
				break;
			case "res-alert":
				customTaskAlertToast({ data });
				dispatch({ type: TASK_CONST.UPDATE_TASK_NOTIFICATION, payload: true });
				break;
			default:
				break;
		}
	});
}

export const ListenNewAssign = (filterObj, chatList, activeTaskChatId) => {
	SocketListener("update-task-list-data", () => {
		getChatTaskList(activeTaskChatId, chatList, filterObj);
	});
};
