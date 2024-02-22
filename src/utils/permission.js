import { CONST } from "utils/constants";

// Check is the user role is SuperAdmin 
export const getSuperAdminAccess = (user) =>
	user?.roleData?.name && user.roleData.name === CONST.USER_TYPE.SA;

// Check is the user role is SuperAdmin or Admin 
export const getAdminAccess = (user) =>
	user?.roleData?.name &&
	(user.roleData.name === CONST.USER_TYPE.SA ||
		user.roleData.name === CONST.USER_TYPE.ADMIN);

// Check is the user role is SuperAdmin, if true check user is ghost or not and has ghost active 
export const getGhostAccess = (user) =>
	getSuperAdminAccess(user) && user?.ghostUser && user?.isGhostActive;
