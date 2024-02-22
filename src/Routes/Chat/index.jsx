import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { dispatch } from "redux/store";
import { useSelector } from "react-redux";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { setThreadMessage } from "redux/actions/chatAction";
import { changeModel, changeTask } from "redux/actions/modelAction";

import { Appbar } from "Routes/Chat/Appbar/Appbar";
import { ChatsContentSidebar } from "Routes/Chat/Sidebar";
import ErrorBoundary from "Components/ErrorBoundry";

export const defaultChatState = {
  editMessage: null,
  quoteMessage: null,
  threadMessage: null,
  infoMessage: null,
};
export default function ChatsPage() {
	const location = useLocation();
	const { name, taskName } = useSelector((state) => state.model);
	const { activeChat, activePatientChat, activeCategoryChat, taskList, threadMessage } = useSelector((state) => state.chat);
	const [chatState, setChatState] = useState(defaultChatState);

  useEffect(() => () => dispatch({ type: CHAT_CONST.DELETE_ACTIVE_CHAT }), []);

  const onBackdrop = useCallback(() => {
    if (name) changeModel();
    if (taskName) changeTask();
    if (threadMessage) setThreadMessage();
    if (!!taskList?.data?.length)
      dispatch({ type: CHAT_CONST.GET_TASKS_SUCCESS, payload: { data: [] } });
  }, [name, taskName, taskList?.data?.length, threadMessage]);

	const AppBar = useMemo(() => {
		if (activeChat?.id !== -1 || activePatientChat || activeCategoryChat)
			return <Appbar />
	}, [activeChat?.id, activePatientChat, activeCategoryChat]);

	const MainOutlet = useMemo(() => {
		const contentPaths = ["drafts", "threads","announcement"];
		const mainVisible =
			activeChat.id !== -1 ||
			activePatientChat ||
			activeCategoryChat ||
			!!contentPaths.filter(path => location.pathname.includes(path)).length
		return (
			<main className={`main ${mainVisible ? 'main-visible' : ''}`}>
				<Outlet context={[chatState, setChatState]} />
			</main>)
	}, [activeChat?.id, chatState, activePatientChat, activeCategoryChat, location.pathname]);

  return (
    <ErrorBoundary>
      {
        <aside className="sidebar">
          <div className="tab-content">
            <ChatsContentSidebar setChatState={setChatState} />
          </div>
        </aside>
      }
      {MainOutlet}
      {AppBar}
      {(taskName || name) && (
        <div className="backdrop backdrop-visible" onClick={onBackdrop} />
      )}
    </ErrorBoundary>
  );
}
