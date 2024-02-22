import axios from "axios";
import { showError } from "utils/package_config/toast";
import { dispatch } from "redux/store";
import { TASK_CONST } from "redux/constants/taskConstants";
import { cancelToken } from "redux/actions/chatAction";
import { toastPromise } from "redux/common";
import taskService from "services/APIs/services/taskService";

// Get Task Details
export const getTaskDetails = async ({ messageId, taskId, isDepartment = false }) => {
	try {
		if (cancelToken?.getTaskDetails) cancelToken?.getTaskDetails.cancel("Operation cancel due to new request.");
		cancelToken.getTaskDetails = axios.CancelToken.source();
		const config = { cancelToken: cancelToken?.getTaskDetails.token };
		await toastPromise({
			func: async (myResolve, myReject) => {
				try {
					let payload = { isDepartment };
					if (taskId) payload.taskId = taskId;
					if (messageId) payload.messageId = messageId;
					dispatch({ type: TASK_CONST.REQ_GET_TASK_DETAILS });
					const data = await taskService.getTaskData({ payload, config });
					dispatch({ type: TASK_CONST.RES_GET_TASK_DETAILS, payload: data.data });
					myResolve("OK");
				} catch (error) {
					myReject("Error");
				}
			},
			loading: "Requesting for Task data",
			success: <b>Successfully get Task</b>,
			error: <b>Could not fetch task data.</b>,
			options: { id: "get-task-detail" }
		});
		// console.timeEnd();
	} catch (error) {
		showError(error?.response?.data?.message);
		console.error(error);
	}
};

// change subtask status
export const changeSubtaskStatus = async (payload) => {
	try {
		const data = await taskService.updateSubtask({ payload });
		return data;
	} catch (error) {
		showError(error?.response?.data?.message);
		console.error(error);
	}
};
