import { ISSUE_CONST } from "redux/constants/issuesConstants";

const initialState = {
	issueList: [],
};
export const issuesReducer = (state = initialState, action) => {
	switch (action.type) {
		case ISSUE_CONST.RES_LIST_ISSUES_CATEGORY:
			return {
				...state,
				issueList: action.payload,
			};
		case ISSUE_CONST.RES_ASSIGNED_ISSUE:
			// if (state.activeCard.id === action.payload.categoryId)
			return {
				...state,
				AssignedIssue: action.payload,
				// AssignedIssue: action.payload.data,
			};
		case ISSUE_CONST.RES_CREATE_ISSUE:
			return {
				...state,
				issueList: [action.payload, ...state.issueList],
			};
		case ISSUE_CONST.RES_DELETE_ISSUE:
			if (state.issueList.some((issue) => issue.id === action.payload?.id))
				return {
					...state,
					issueList: state.issueList.filter((issue) => issue.id !== action.payload?.id),
				};
			break;
		case ISSUE_CONST.RES_GET_REQUEST_DETAILS:
			if (state.issueDetails || action.request)
				return {
					...state,
					issueDetails: action.payload,
				};
			if (state.assignIssueDetails || action?.request === false)
				return {
					...state,
					assignIssueDetails: {
						...state.assignIssueDetails,
						...action.payload,
					},
				};
			return state;
		case ISSUE_CONST.RES_GET_ASSIGNED_REQUEST_DETAILS:
			return {
				...state,
				assignIssueDetails: action.payload,
			};
		case ISSUE_CONST.RES_UPDATE_ISSUE_SOLUTION:
			return {
				...state,
				assignIssueDetails: {
					...state.assignIssueDetails,
					...action.payload,
				},
			};
		case ISSUE_CONST.RES_UPDATE_REQUEST:
			if (state.issueDetails)
				return {
					...state,
					issueDetails: {
						...state.issueDetails,
						...action.payload,
					},
				};
			if (state.assignIssueDetails)
				return {
					...state,
					assignIssueDetails: {
						...state.assignIssueDetails,
						...action.payload,
					},
				};
			return state;
		case ISSUE_CONST.SET_ISSUES_ATTACHMENTS:
			return {
				...state,
				issueDetails: {
					...state.issueDetails,
					issuesAttachments: action.payload.data,
				},
			};
		case ISSUE_CONST.SET_ISSUE_CARD_ITEM:
			return {
				...state,
				activeCard: action.payload,
			};
		case ISSUE_CONST.UPDATE_ACTIVE_CARD:
			return {
				...state,
				activeCard: {
					...state.activecard,
					...action.payload,
				},
			};
		case ISSUE_CONST.DELETE_ISSUE_ATTACHMENT:
			const newIssuesList = state.issueList;
			const issueDeleteIndex = newIssuesList.findIndex((item) => item.id === action.payload.id);
			if (issueDeleteIndex !== -1) {
				newIssuesList[issueDeleteIndex] = {
					...newIssuesList[issueDeleteIndex],
					issuesAttachments: newIssuesList[issueDeleteIndex].issuesAttachments.filter((item) => item.id !== action.payload.attachmentId),
				};
				return {
					...state,
					issueList: newIssuesList,
				};
			}
			return state;
		case ISSUE_CONST.RES_CREATE_ISSUE_COMMENT:
			if (state.issueDetails)
				return {
					...state,
					issueDetails: {
						...state.issueDetails,
						issueComments: [action.payload, ...state.issueDetails.issueComments],
					},
				};
			else if (state.assignIssueDetails)
				return {
					...state,
					assignIssueDetails: {
						...state.assignIssueDetails,
						issueComments: [action.payload, ...state.assignIssueDetails.issueComments],
					},
				};
			return state;
		case ISSUE_CONST.UPDATE_ISSUE_COMMENT:
			const issue = state.issueDetails;
			if (issue) {
				const newComments = issue.issueComments;
				const updateCommentIn = newComments.findIndex((cmt) => cmt.id === action.payload.id);
				if (updateCommentIn !== -1) {
					newComments[updateCommentIn] = {
						...newComments[updateCommentIn],
						...action.payload,
					};
					return {
						...state,
						issueDetails: {
							...state.issueDetails,
							comments: newComments,
						},
					};
				}
			}
			return state;
		case ISSUE_CONST.RES_DELETE_ISSUE_COMMENT:
			if (state.issueDetails)
				return {
					...state,
					issueDetails: {
						...state.issueDetails,
						issueComments: state.issueDetails.issueComments.filter((cmmt) => cmmt.id !== action.payload),
					},
				};
			else if (state.assignIssueDetails)
				return {
					...state,
					assignIssueDetails: {
						...state.assignIssueDetails,
						issueComments: state.issueDetails.issueComments.filter((cmmt) => cmmt.id !== action.payload),
					},
				};
			return state;
		case ISSUE_CONST.CLEAR_ISSUE_STATE:
			return {
				issueList: [],
			};
		case ISSUE_CONST.RES_SET_SUB_CATEGORY:
			return {
				...state,
				subCategory: action.payload,
			};
		case ISSUE_CONST.SET_CARD_SUBCATEGORIES:
			return {
				...state,
				subCategories: action.payload,
			};
		default:
			return state;
	}
};
