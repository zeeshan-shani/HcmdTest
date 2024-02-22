import { getDateXDaysAgoEndOf, getDateXDaysAgoStartOf } from "redux/common";
import { CONST } from "utils/constants";
import { TASK_STATUS } from "Routes/TaskBoard/config";
import { USER_CONST } from "redux/constants/userContants";
import { TASK_CONST } from "redux/constants/taskConstants";

export const TASK_CARDS = [
	{ id: CONST.MSG_TYPE.EMERGENCY, title: "Emergency", type: CONST.MSG_TYPE.EMERGENCY },
	{ id: CONST.MSG_TYPE.URGENT, title: "Urgent", type: CONST.MSG_TYPE.URGENT },
	{ id: CONST.MSG_TYPE.ROUTINE, title: "Routine", type: CONST.MSG_TYPE.ROUTINE },
];

const initialState = {
	activeTaskChat: null,
	activeTaskList: [],
	taskCards: TASK_CARDS,
	templateTasksCards: [{ id: "TASK", title: "Task Templates", type: "TASK" }],
	templateTaskList: [],
	templateTaskDetail: null,
	taskDetails: null,
	filterTaskData: {
		dateFrom: getDateXDaysAgoStartOf(7).toLocaleString(),
		dateTo: getDateXDaysAgoEndOf(0).toLocaleString(),
		status: TASK_STATUS[0].value,
	},
	taskLabels: [],
	loading: false,
	activityLogs: 0,
	hasNotification: false,
	loadingTasklabel: false
};

export const taskReducer = (state = initialState, action) => {
	switch (action.type) {
		case TASK_CONST.INIT_TASK:
			return initialState;
		case TASK_CONST.NEW_CHAT_SELECTED:
			return {
				...state,
				activeTaskChat: action.payload,
			};
		case TASK_CONST.SET_NEW_TASK_LIST:
			return {
				...state,
				activeTaskList: action.payload,
			};
		case TASK_CONST.RES_GET_TASKLIST:
			return {
				...state,
				activeTaskList: action?.append ? [...state.activeTaskList, ...action.payload] : action.payload,
			};
		case TASK_CONST.RECEIVED_TASK_ADDED:
			return {
				...state,
				activeTaskList: [
					...state.activeTaskList,
					{
						...action.payload.taskInfo.taskCreated,
						comments: [],
						label: [],
						attachments: [],
						subtasks: [],
						taskmembers: [],
					},
				],
			};
		case TASK_CONST.RECEIVE_TASK_DELETED:
			return {
				...state,
				activeTaskList: state.activeTaskList.filter((item) => item.id !== action.payload.taskId),
			};
		case TASK_CONST.REQ_GET_TASK_DETAILS:
			return {
				...state,
				loading: true,
			};
		case TASK_CONST.RES_GET_TASK_DETAILS:
			if (action.payload && state.taskDetails)
				return {
					...state,
					loading: false,
					taskDetails: {
						...action.payload,
						clockTime: {
							started: action.payload.taskLogs?.filter((item) => item.type === TASK_CONST.STARTED).reverse(),
							ended: action.payload.taskLogs?.filter((item) => item.type === TASK_CONST.ENDED).reverse(),
						},
					},
				};
			return { ...state, taskDetails: action.payload };
		case TASK_CONST.UPDATE_TASK_DATA:
			return {
				...state,
				taskDetails: { ...state.taskDetails, ...action.payload },
			};
		case TASK_CONST.UPDATE_TASK_COMMENT:
			if (action.payload?.subTaskId) {
				const newSubtasks = state?.taskDetails?.subtasks;
				const newSubTaskIn = newSubtasks.findIndex((st) => st.id === action.payload.subTaskId);
				if (newSubTaskIn !== -1) {
					const subtaskUp = newSubtasks[newSubTaskIn];
					const updateCommentIn = subtaskUp?.comments?.findIndex((cmt) => cmt.id === action.payload.id);
					if (updateCommentIn !== -1) {
						subtaskUp.comments[updateCommentIn] = { ...subtaskUp.comments[updateCommentIn], ...action.payload };
						return {
							...state,
							taskDetails: { ...state.taskDetails, subtasks: newSubtasks },
						};
					}
				}
			} else {
				const newComments = state.taskDetails.comments;
				const updateCommentIn = newComments.findIndex((cmt) => cmt.id === action.payload.id);
				if (updateCommentIn !== -1) {
					newComments[updateCommentIn] = { ...newComments[updateCommentIn], ...action.payload };
					return {
						...state,
						taskDetails: { ...state.taskDetails, comments: newComments },
					};
				}
			}
			return state;
		case TASK_CONST.SET_TASKS_ATTACHMENTS:
			if (action.payload?.isTemplate) {
				return {
					...state,
					templateTaskDetail: { ...state.templateTaskDetail, templateAttachments: action.payload.data },
				};
			} else {
				return {
					...state,
					taskDetails: { ...state.taskDetails, attachments: action.payload.data },
				};
			}
		case TASK_CONST.UPDATE_TASK_DETAILS:
			if (state.taskDetails)
				return {
					...state,
					taskDetails: { ...state.taskDetails, ...action.payload },
				};
			return state;
		case TASK_CONST.UPDATE_TASK_MEMBERS:
			if (state.taskDetails)
				return {
					...state,
					taskDetails: {
						...state.taskDetails,
						taskmembers: action.payload.taskMembers || [],
						taskDepartments: action.payload.taskDepartments || [],
					},
				};
			return state;
		case TASK_CONST.UPDATE_REVIEW_STATUS:
			if (state.taskDetails)
				return {
					...state,
					taskDetails: {
						...state.taskDetails,
						taskStatuses: state.taskDetails.taskStatuses.map((mem) => {
							if (mem.userId === action.payload?.provider?.userId)
								return { ...mem, ...action.payload.provider }
							else if (mem.userId === action.payload?.member?.userId)
								return { ...mem, ...action.payload.member }
							return mem;
						}),
					},
				};
			return state;
		case TASK_CONST.ADD_SUBTASK_COMMENTS:
			let newSubtasks = state.taskDetails.subtasks;
			const cmtIndex = newSubtasks.findIndex((item) => item.id === action.payload.subTaskId);
			if (cmtIndex !== -1) {
				newSubtasks[cmtIndex] = {
					...newSubtasks[cmtIndex],
					comments: action.payload.comments,
				};
				return {
					...state,
					taskDetails: {
						...state.taskDetails,
						subtasks: newSubtasks,
					},
				};
			}
			return state;
		case TASK_CONST.DELETE_TASK_COMMENT:
			let newCommentList = state.taskDetails?.comments;
			if (newCommentList) {
				return {
					...state,
					taskDetails: {
						...state.taskDetails,
						comments: state.taskDetails.comments.filter((cmmt) => cmmt.id !== action.payload.commentId),
					},
				};
			}
			return state;
		case TASK_CONST.ADD_NEW_SUBTASK:
			if (action.payload?.isTemplate) {
				let addSubtasks = state.templateTaskDetail.subTemplates;
				addSubtasks.push(action.payload);
				return {
					...state,
					templateTaskDetail: {
						...state.templateTaskDetail,
						subTemplates: addSubtasks,
					},
				};
			} else {
				let addSubtasks = state.taskDetails.subtasks;
				addSubtasks.push(action.payload);
				return {
					...state,
					taskDetails: {
						...state.taskDetails,
						subtasks: addSubtasks,
					},
				};
			}
		case TASK_CONST.ADD_NEW_SUBTASK_COMMENT:
			let newSubtasksComment = state.taskDetails.subtasks;
			const commentIndex = newSubtasksComment.findIndex((item) => item.id === action.payload.subTaskId);
			if (commentIndex !== -1) {
				newSubtasksComment[commentIndex].comments.push(action.payload.newComment);
				newSubtasksComment[commentIndex].totalComments++;
				return {
					...state,
					taskDetails: {
						...state.taskDetails,
						subtasks: newSubtasksComment,
					},
				};
			}
			return state;
		case TASK_CONST.DELETE_SUBTASK_COMMENT:
			let newSubtasksCommentList = state.taskDetails.subtasks;
			const subtaskIndex = newSubtasksCommentList.findIndex((item) => item.id === action.payload.subtaskId);
			if (subtaskIndex !== -1) {
				newSubtasksCommentList[subtaskIndex].comments = newSubtasksCommentList[subtaskIndex].comments.filter((cmmt) => cmmt.id !== action.payload.commentId);
				newSubtasksCommentList[subtaskIndex].totalComments--;
				return {
					...state,
					taskDetails: {
						...state.taskDetails,
						subtasks: newSubtasksCommentList,
					},
				};
			}
			return state;
		case TASK_CONST.ADD_NEW_TASK_COMMENT:
			return {
				...state,
				taskDetails: {
					...state.taskDetails,
					comments: [...state.taskDetails.comments, action.payload],
				},
			};
		case TASK_CONST.ADD_NEW_REPLY_COMMENT:
			let commentList = state.taskDetails.comments;
			const commentListIndex = commentList.findIndex((cmmt) => cmmt.id === action.payload.replyCommentId);
			if (commentListIndex !== -1) {
				commentList[commentListIndex] = {
					...commentList[commentListIndex],
					replyComment: commentList[commentListIndex]?.replyComment ? [...commentList[commentListIndex]?.replyComment, action.payload] : [action.payload],
				};
				return {
					...state,
					taskDetails: {
						...state.taskDetails,
						comments: commentList,
					},
				};
			}
			return state;
		case TASK_CONST.UPDATE_TEMPLATE_SUBTASK_DATA:
			let templateSubtasks = state.templateTaskDetail.subTemplates;
			const templateStatusIndex = templateSubtasks.findIndex((item) => item.id === action.payload.id);
			if (templateStatusIndex !== -1) {
				templateSubtasks[templateStatusIndex] = {
					...templateSubtasks[templateStatusIndex],
					...action.payload,
				};
				return {
					...state,
					templateTaskDetail: {
						...state.templateTaskDetail,
						subTemplates: templateSubtasks,
					},
				};
			}
			return state;
		case TASK_CONST.UPDATE_SUBTASK_DATA:
		case TASK_CONST.CHANGE_SUBTASK_STATUS:
			let subtaskStatus = state.taskDetails.subtasks;
			const statusIndex = subtaskStatus.findIndex((item) => item.id === action.payload.id);
			if (statusIndex !== -1) {
				subtaskStatus[statusIndex] = { ...subtaskStatus[statusIndex], ...action.payload };
				return {
					...state,
					taskDetails: { ...state.taskDetails, subtasks: subtaskStatus },
				};
			}
			return state;
		case TASK_CONST.DELETE_SUBTASK:
			if (action.payload?.isTemplate) {
				return {
					...state,
					templateTaskDetail: {
						...state.templateTaskDetail,
						subTemplates: state.templateTaskDetail.subTemplates.filter((subTemplate) => subTemplate.id !== action.payload.subTemplateId),
					},
				};
			} else {
				return {
					...state,
					taskDetails: {
						...state.taskDetails,
						subtasks: state.taskDetails.subtasks.filter((subtask) => subtask.id !== action.payload.subTaskId),
					},
				};
			}
		case TASK_CONST.RECEIVED_TASK_CLOCK_DATA:
			if (state.taskDetails) {
				return {
					...state,
					taskDetails: {
						...state.taskDetails,
						clockTime: {
							started: action.payload?.filter((item) => item.type === TASK_CONST.STARTED).reverse(),
							ended: action.payload?.filter((item) => item.type === TASK_CONST.ENDED).reverse(),
						},
					},
				};
			}
			return state;
		case TASK_CONST.SET_TASK_FILTER_DATA:
			return {
				...state,
				filterTaskData: { ...state.filterTaskData, ...action.payload },
			};
		// case TASK_CONST.RECEIVED_TEMPLATE_TASKS:
		// 	return {
		// 		...state,
		// 		templateTaskList: action.payload.data,
		// 	};
		case TASK_CONST.SET_UPLOADING_ATTACHMENT:
			return {
				...state,
				uploadingAttachment: action.payload,
			};
		// case TASK_CONST.RECEIVED_TEMPLATE_TASK_ADDED:
		// 	return {
		// 		...state,
		// 		templateTaskList: [action.payload.data, ...state.templateTaskList],
		// 	};
		// case TASK_CONST.RES_DELETE_TEMPLATE_TASK:
		// 	return {
		// 		...state,
		// 		templateTaskList: state.templateTaskList.filter((template) => template.id !== action.payload),
		// 	};
		case TASK_CONST.GET_TEMPLATE_TASK_DETAIL:
			return {
				...state,
				templateTaskDetail: action.payload,
			};
		case TASK_CONST.UPDATE_TEMPLATE_DATA:
			if (state.templateTaskDetail) {
				const templateList = state.templateTaskList;
				const taskIn = templateList.findIndex((tem) => tem.id === action.payload.id);
				if (taskIn !== -1) {
					templateList[taskIn] = { ...templateList[taskIn], ...action.payload };
				}
				return {
					...state,
					templateTaskList: templateList,
					templateTaskDetail: { ...state.templateTaskDetail, ...action.payload },
				};
			} else {
				const templateList = state.templateTaskList;
				const taskIn = templateList.findIndex((tem) => tem.id === action.payload.id);
				if (taskIn !== -1) {
					templateList[taskIn] = { ...templateList[taskIn], ...action.payload };
					return { ...state, templateTaskList: templateList };
				}
			}
			return state;
		case TASK_CONST.REQ_TASK_LABEL:
			return { ...state, loadingTasklabel: true };
		case TASK_CONST.READ_TASK_LABEL:
			return { ...state, taskLabels: action.payload, loadingTasklabel: false };
		case TASK_CONST.CREATE_TASK_LABEL:
			return { ...state, taskLabels: [...state.taskLabels, action.payload] };
		case TASK_CONST.UPDATE_TASK_LABEL:
			let newtaskLabels = state.taskLabels;
			const taskLabelIndex = newtaskLabels.findIndex((item) => item.id === action.payload.id);
			if (taskLabelIndex !== -1) {
				return {
					...state,
					taskLabels: newtaskLabels.map((item, index) => (index === taskLabelIndex ? { ...item, ...action.payload } : item)),
				};
			}
			return state;
		case TASK_CONST.DELETE_TASK_LABEL:
			return {
				...state,
				taskLabels: state.taskLabels.filter((item) => item.id !== parseInt(action.payload)),
			};
		case USER_CONST.SET_SEARCH_USER_TASK_LOGS:
			return {
				...state,
				taskDetails: { ...state.taskDetails, searchTaskLogs: action.payload },
			};
		case TASK_CONST.UPDATE_ACTIVITY_LOGS:
			return {
				...state,
				activityLogs: Date.now(),
			};
		case TASK_CONST.UPDATE_WATCH_LIST:
			return {
				...state,
				removeWatchListId: action.payload.removeWatchListId
			};
		case TASK_CONST.UPDATE_TASK_NOTIFICATION:
			return {
				...state,
				hasNotification: action.payload
			};
		case TASK_CONST.FINISHED_TASK_ID_FOR_ALERTLIST:
			return {
				...state,
				finishedTaskId: action.payload
			};
		default:
			return state;
	}
};
