import { dispatch, getState } from "redux/store";
import { ISSUE_CONST } from "redux/constants/issuesConstants";
import { SOCKET } from "utils/constants";
import { SocketListener } from "utils/wssConnection/Socket";
import { getIssueList } from "redux/actions/IssuesAction";

export const listenKBEvents = async () => {
	SocketListener("SOCKET_KB", (response) => {
		const { issueDetails, assignIssueDetails } = getState().issues;
		const { data, id } = response;
		// const userId = getState().user.user?.id;
		const requestId = issueDetails?.id || assignIssueDetails?.id;
		switch (id) {
			case SOCKET.RESPONSE.ISSUE_DELETE:
				dispatch({ type: ISSUE_CONST.RES_DELETE_ISSUE, payload: data.data });
				break;
			case SOCKET.RESPONSE.ISSUE_ADD_SOLUTION:
				dispatch({ type: ISSUE_CONST.RES_ADD_ISSUE_SOLUTION, payload: data });
				break;
			case SOCKET.RESPONSE.ISSUE_UPDATE_SOLUTION:
				dispatch({ type: ISSUE_CONST.RES_UPDATE_ISSUE_SOLUTION, payload: data.data });
				break;
			case SOCKET.RESPONSE.UPDATE_ISSUE:
				if (requestId === data?.data?.id)
					dispatch({ type: ISSUE_CONST.RES_UPDATE_REQUEST, payload: data.data });
				break;
			case SOCKET.RESPONSE.ISSUE_UPDATE_COMMENT:
				if (requestId === data?.data?.issueId)
					dispatch({ type: ISSUE_CONST.UPDATE_ISSUE_COMMENT, payload: data.data });
				break;
			case SOCKET.RESPONSE.ISSUE_DELETE_COMMENT:
				dispatch({ type: ISSUE_CONST.RES_DELETE_ISSUE_COMMENT, payload: data.data });
				break;
			default:
				break;
		}
	})
}

export const ListenNewRequest = (activeCardId, body) => {
	SocketListener(SOCKET.RESPONSE.UPDATE_NEW_ISSUE, () => {
		if (activeCardId) getIssueList(activeCardId, body);
	});
};
