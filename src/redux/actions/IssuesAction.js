import { showError } from "utils/package_config/toast";
import { cancelToken } from "./chatAction";
import axios from "axios";
import { dispatch } from "redux/store";
import { ISSUE_CONST } from "redux/constants/issuesConstants";
import { generatePayload } from "redux/common";
import knowledgebaseService from "services/APIs/services/knowledgebaseService";
import { SocketEmiter } from "utils/wssConnection/Socket";
import { SOCKET } from "utils/constants";

// Delete Attachment Data
export const DeleteIssuesAttachment = async (body) => {
	try {
		const data = await knowledgebaseService.deleteAttachment({ payload: { id: body.attachmentId } });
		return data;
	} catch (error) {
		showError(error?.response?.data?.message);
		console.error(error);
	}
};
export const getIssueList = async (activeCardId, newSearch) => {
	try {
		if (newSearch.hasOwnProperty("subcategory") && cancelToken?.MyRequestslistsubcategory)
			cancelToken?.MyRequestslistsubcategory.cancel("Operation cancel due to new request.");
		else if (newSearch.hasOwnProperty("assignedIssue") && cancelToken?.MyRequestslistassignedIssue)
			cancelToken?.MyRequestslistassignedIssue.cancel("Operation cancel due to new request.");
		if (newSearch.hasOwnProperty("subcategory")) cancelToken.MyRequestslistsubcategory = axios.CancelToken.source();
		else if (newSearch.hasOwnProperty("assignedIssue")) cancelToken.MyRequestslistassignedIssue = axios.CancelToken.source();
		let config = {
			cancelToken: newSearch.hasOwnProperty("subcategory")
				? cancelToken?.MyRequestslistsubcategory.token
				: newSearch.hasOwnProperty("assignedIssue")
					? cancelToken.MyRequestslistassignedIssue.token
					: undefined,
		};
		let payload = await generatePayload({
			keys: ["subject", "description"],
			value: newSearch?.search,
			body: { ...newSearch },
			rest: { category: activeCardId },
		});
		if (newSearch.hasOwnProperty("subcategory")) payload.query.createdBy = true;
		const data = await knowledgebaseService.list({ payload, config });
		if (data?.status === 1 && newSearch.hasOwnProperty("subcategory")) dispatch({ type: ISSUE_CONST.RES_LIST_ISSUES_CATEGORY, payload: data.data });
		if (data?.status === 1 && newSearch.hasOwnProperty("assignedIssue")) dispatch({ type: ISSUE_CONST.RES_ASSIGNED_ISSUE, payload: data.data });
	} catch (error) {
		console.error(error);
	}
};

/**
 * Function to request issue update.
 * @param {object} data - The data for updating the issue.
 */
export const ReqUpdateIssue = (data) => SocketEmiter(SOCKET.REQUEST.UPDATE_ISSUE, data);
