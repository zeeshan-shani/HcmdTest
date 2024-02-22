import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment-timezone";
import classes from "Routes/TaskBoard/TasksPage.module.css";

import { CONST } from "utils/constants";
import { getTaskDetails } from "redux/actions/taskAction";
import { Chat, ChatDots, ClipboardCheck, InfoCircle, Paperclip, ThreeDots, XCircle } from "react-bootstrap-icons";
import { format_all, format_patient, getDueDateObj, getImageURL, getStatusColor } from "redux/common";
import { MuiTooltip } from "Components/components";
import { getTaskStatusSvg } from "../TaskPage";
import { getPrivateChatUser } from "services/helper";
import { MuiActionButton } from "Components/MuiDataGrid";
import messageService from "services/APIs/services/messageService";
import ErrorBoundary from "Components/ErrorBoundry";

export default function BoardTaskCard({
	task,
	taskDeleteHandler,
	Watchlist,
	removeFromWatchlist,
	routeToChatMessage,
	taskCategories,
	activeTaskChat
}) {
	const { user } = useSelector(state => state.user);
	const { chatList } = useSelector((state) => state.chat);
	try {
		const MAX_MEMBER = 5;
		const findStatus = task?.taskStatuses.find(item => item.userId === user.id);
		const taskStatus = task.status || "pending";
		const chatDetails = chatList.find(chat => chat.id === task.chatId) || (activeTaskChat?.name && { name: activeTaskChat.name });
		if (chatDetails?.type === CONST.CHAT_TYPE.PRIVATE)
			chatDetails.name = getPrivateChatUser(chatDetails)?.name;
		const isCreator = task.createdBy === user.id;
		const taskTitle = task?.subject ? task.subject : task?.name;
		const totalTaskMembers = task?.taskmembers?.length;
		const isAllowtoAccess = isCreator || findStatus;
		const completedBy = task?.completedBy;
		const dueDateObj = getDueDateObj(task?.dueDate) || {};
		const getTask = async (task) => getTaskDetails({ taskId: task.id, messageId: task.messageId, isDepartment: task?.isDepartment });
		const format_patient1 = task?.patient && format_patient(task.patient);

		return (
			<ErrorBoundary>
				<div className={`${classes["board-task-card"]}`}
					onClick={(e) => {
						if (e.target.id !== "task" && e.target.id !== "task-delete") getTask(task);
					}}
				>
					<div className={`${classes["task-title"]}`}>
						<div className="text-secondary">
							<div title={taskTitle} className={`${classes.title} line-clamp line-clamp-3`} dangerouslySetInnerHTML={{
								__html: taskTitle?.startsWith('\n') ? format_all(taskTitle.substring(1)) : format_all(taskTitle)
							}}>
							</div>
							{format_patient1 &&
								<div className="message-patient" dangerouslySetInnerHTML={{ __html: `Patient: ${format_patient1}` }} />}
						</div>
						<div className="more_icon">
							{((isAllowtoAccess || Watchlist) ?
								<div className="dropdown tasklist-dropdown" onClick={e => e.stopPropagation()}>
									<div className="z-index-1" data-bs-toggle="dropdown" aria-expanded="false" id={`task-${task.id}`} onClick={(e) => { e?.stopPropagation() }}>
										<ThreeDots />
									</div>
									<ul className={`dropdown-menu dropdown-menu-right text-light m-0`} aria-labelledby={`task-${task.id}`}>
										<li className="dropdown-item" onClick={(e) => getTask(task)}>
											View Task
										</li>
										{!Watchlist && isCreator && <li className="dropdown-item" id="task-delete" onClick={() => taskDeleteHandler(task.chatId, task.id, task.messageId)}>
											Delete Task
										</li>}
										{Watchlist &&
											<li className="dropdown-item" id="task-watch" onClick={() => removeFromWatchlist(task)}>
												Remove Watch
											</li>}
									</ul>
								</div> :
								<MuiTooltip title="You're not allowed to view this task">
									<XCircle fill="#ff0000" />
								</MuiTooltip>
							)}
						</div>
					</div>
					{task.label &&
						!!task.label.length &&
						<div className={`${classes["status-block"]} my-1`}>
							{task.label.map((label, index) => {
								const labelObj = taskCategories?.find((item) => Number(item.id) === Number(label));
								if (labelObj)
									return (
										<span className={`badge text-white p-1`} key={labelObj.id}
											style={{ backgroundColor: labelObj?.colorCode || '#000', margin: "4px 4px", padding: "2px" }}>
											{labelObj.name}
										</span>
									);
								return null;
							})}
						</div>}
					<div className={`${classes["card-task-member"]}`}>
						{task &&
							task.taskmembers &&
							task.taskmembers.map((member, index) => {
								if (index >= MAX_MEMBER) return null;
								const fStatus = task?.taskStatuses?.find(item => item.userId === member.userId);
								const taskStatus = fStatus ? fStatus.status : 'Undefined';
								return (
									<div
										key={index}
										id={`member-${member.userId}`}
										className={`${classes.member} position-relative task-profile-svg`}
										title={`${member.user?.name} ${taskStatus && `, Status: ${taskStatus}`}`}
									>
										<img src={getImageURL(member?.user?.profilePicture, '30x30')} alt="" />
										{(!completedBy || (completedBy && completedBy === member.userId)) && <div className="position-absolute svg-wrap bg-white">
											{getTaskStatusSvg(taskStatus)}
										</div>}
									</div>
								);
							})}
						{totalTaskMembers > MAX_MEMBER &&
							<MuiTooltip title={`more ${totalTaskMembers - MAX_MEMBER} members`}>
								<div
									key={-1}
									id={`member-${-1}`}
									className={`${classes.member} more-member-badge ml-2`}
									data-members={`+${totalTaskMembers - MAX_MEMBER}`}
								/>
							</MuiTooltip>}
					</div>
					<div className={`${classes["task-options"]}`}>
						{task.createdBy === user.id &&
							<div className={`task-status br-6 bg-success mr-auto`}>
								<p className="text-white fs-12 text-capitalize px-1 mb-0">
									{'creator'}
								</p>
							</div>}
						{!!task.comments && <>
							<div className={`${classes["icon-space"]} board-task-card-svg`}>
								<Chat />
							</div>
							<span className={`${classes["board-count-space"]}`}>
								{task.comments.length}
							</span></>}
						{!!task.attachments && <>
							<div className={`${classes["icon-space"]} board-task-card-svg`}>
								<Paperclip />
							</div>
							<div className={`${classes["board-count-space"]}`}>
								{task.attachments.length}
							</div></>}
						<div className={`${classes["icon-space"]} board-task-card-svg`}>
							<ClipboardCheck />
						</div>
						{!!task.subtasks &&
							<div className={`${classes["board-count-space"]} ${!!task.subtasks.length ? task.subtasks.filter((item) => item.status === "finished").length === task.subtasks.length && "text-success" : ''}`}>
								{`${task.subtasks.filter((item) => item.status === "finished").length}/${task.subtasks.length}`}
							</div>}
					</div>
					<div className={`${classes["task-options"]} justify-content-between mt-1 flex-wrap`}>
						<div className="d-flex gap-5" onClick={(e) => e.stopPropagation()}>
							{chatDetails?.name &&
								<p className="task display-tag my-1">
									{chatDetails?.name}
								</p>}
							<MuiActionButton Icon={ChatDots} size="small" tooltip="Move to message" onClick={() => {
								routeToChatMessage({ id: task.messageId, chatId: task.chatId })
							}} />
							<ReadByMembers task={task} />
						</div>
						{<div className="d-flex" style={{ gap: '.5rem' }}>
							<div className={`task-status br-6 bg-primary`}>
								<p className="text-white text-capitalize px-1 mb-0">
									{task?.isTeam ? 'Team' : 'Single'}
								</p>
							</div>
							{(findStatus || taskStatus) &&
								<div className={`task-status ${getStatusColor(taskStatus)} br-6`}>
									<p className="text-white text-capitalize px-1 mb-0">
										{taskStatus}
									</p>
								</div>}
							{/* {task?.status &&
								<div className={`task-status ${getStatusColor(task.status)} br-6`}>
									<p className="text-white fs-12 text-capitalize px-1 mb-0">
										{task.status}
									</p>
								</div>} */}
						</div>}
					</div>
					<div className={`${classes["task-options"]} justify-content-between`}>
						{/* <span className="fs-14 task display-tag">
									{chatDetails?.name}
								</span> */}
						<p className="mb-0">Created on {moment(task.createdAt).format('MM/DD/YY')}</p>
						{taskStatus !== "finished" && <div className="d-flex">
							{task?.dueDate &&
								<div className={`task-status ${dueDateObj.color} br-6`}>
									<p className="text-white text-capitalize px-1 mb-0">
										{dueDateObj.isOverDue ? 'Overdue' : 'Due'} {moment(task?.dueDate).format('MM/DD/YY')}
									</p>
								</div>}
						</div>}
					</div>
				</div>
			</ErrorBoundary>
			// )}
			// </Draggable>
		);
	} catch (error) {
		console.error(error)
	}
}

const ReadByMembers = ({ task }) => {
	const [state, setState] = useState({ isLoading: false });

	const onClickInfo = useCallback(async () => {
		const id = task?.messageId;
		if (!id || state.messageData) return;
		setState(prev => ({ ...prev, isLoading: true }));
		const data = await messageService.getRecipient({ payload: { id } });
		if (data?.status === 1)
			return setState(prev => ({ ...prev, messageData: data.data, isLoading: false }));
		setState(prev => ({ ...prev, messageData: null, isLoading: true }));
	}, [task?.messageId, state?.messageData]);

	const tooltip = useMemo(() => {
		const messageData = state?.messageData;
		if (!messageData) return "Click to view read users";
		const readByArr = messageData?.messagerecipients?.filter(item => item.isRead === true) || [];
		return (
			<div>
				<div>Read By:</div>
				<ul className="list-group">
					{readByArr.map((item, index) => {
						return (
							<div key={index}>
								{item.user.name || "Unknown user"}
							</div>);
					})}
				</ul>
			</div>
		);
	}, [state?.messageData]);

	return (<>
		<MuiActionButton Icon={InfoCircle} size="small" tooltip={state.isLoading ? "fetching data..." : <>{tooltip}</>} onClick={onClickInfo} />
	</>)
}