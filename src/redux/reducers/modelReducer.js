import { MODEL_CONST } from "redux/constants/modelConstants";

const initialState = {
	name: "",
	taskName: "",
	userImageData: null
};

export const modelReducer = (state = initialState, action) => {
	switch (action.type) {
		case MODEL_CONST.INIT_MODEL:
			return initialState;
		case MODEL_CONST.MODEL_CHANGE_START:
			return { ...state, loading: true };
		case MODEL_CONST.MODEL_CHANGE_END:
			return { ...state, loading: false, name: action.payload };
		case MODEL_CONST.CLEAR_ERRORS:
			return { ...state, error: null };
		case MODEL_CONST.TASK_CHANGE_END:
			return { ...state, error: null, taskName: action.payload };
		case MODEL_CONST.USER_UPDATE_DATA:
			return { ...state, userData: action.payload };
		case MODEL_CONST.USER_IMAGE_DATA:
			return { ...state, userImageData: action.payload };
		case MODEL_CONST.TABLE_UPDATE:
			return { ...state, updateTable: action.payload };
		case MODEL_CONST.FORM_BUILDER_CLIPBOARD_FIELD:
			return { ...state, ...action.payload };
		default:
			return state;
	}
};
