import { dispatch } from "redux/store";
import { MODEL_CONST } from "redux/constants/modelConstants";
export let pastedFiles = [];

// Set Model
export const changeModel = (modelName = "") => {
	dispatch({ type: MODEL_CONST.MODEL_CHANGE_START });
	dispatch({ type: MODEL_CONST.MODEL_CHANGE_END, payload: modelName });
};

export const onSetPasteFiles = (files) => (pastedFiles = files);

// Admin update data
export const updateUserData = (user) => dispatch({ type: MODEL_CONST.USER_UPDATE_DATA, payload: user });

// Set Task
export const changeTask = (taskName = "") => dispatch({ type: MODEL_CONST.TASK_CHANGE_END, payload: taskName });
