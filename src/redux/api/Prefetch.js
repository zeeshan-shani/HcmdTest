import { dispatch } from "redux/store";
import { TASK_CONST } from "redux/constants/taskConstants";
import { USER_CONST } from "redux/constants/userContants";
import designationService from "services/APIs/services/designationService";
import userService from "services/APIs/services/userService";
import KBCategoryService from "services/APIs/services/KBCategoryService";

// GET user role list
export const saveUserRoles = async () => {
    const data = await userService.getRoles();
    dispatch({ type: USER_CONST.SET_USER_ROLES, payload: (data?.status === 1) ? data.data : [] });
}

// GET category list
export const getCategories = async () => {
    dispatch({ type: TASK_CONST.REQ_TASK_LABEL });
    const data = await KBCategoryService.records({});
    dispatch({ type: TASK_CONST.READ_TASK_LABEL, payload: (data?.status === 1) ? data.data : [] });
}

// GET designation list
export const getDesignationList = async () => {
    const data = await designationService.list({});
    dispatch({ type: TASK_CONST.READ_DESIGNATIONS, payload: (data?.status === 1) ? data.data : [] });
}