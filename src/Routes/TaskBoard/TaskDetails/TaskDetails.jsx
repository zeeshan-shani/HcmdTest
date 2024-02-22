import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactImageVideoLightbox from "react-image-video-lightbox";
import moment from "moment-timezone";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Mention, MentionsInput } from "react-mentions";
import useClickAway from 'react-use/lib/useClickAway';

import { getTaskMembers, getTaskReviewer, TaskMembers } from "./Members/TaskMembers";
import { TaskLabels } from "./Labels/TaskLabels";
import { AttachmentInput } from "./Attachments/AttachmentInput";
import { TaskAttachment } from "./Attachments/TaskAttachment";
import { TimeTracker } from "./Tracker/TimeTracker";
import { TaskLogs } from "./TaskLogs";
import { TaskComments } from "./Comments/TaskComments";

import { CONST, SOCKET } from "utils/constants";
import { showError } from "utils/package_config/toast";
import { getAdminAccess } from "utils/permission";
import { changeProfileStatus, SocketEmiter } from "utils/wssConnection/Socket";
import { format_all, format_patient } from "redux/common";
import { moveChatandQMessage } from "redux/actions/chatAction";
import { CHAT_CONST } from "redux/constants/chatConstants";
import { TASK_STATUS } from "../config";
import { SubTask } from "./Subtask/Subtask";
import { MuiTooltip, TakeConfirmation } from "Components/components";
import { ChatDots, PencilFill, Save2Fill } from "react-bootstrap-icons";

import classes from "Routes/TaskBoard/TaskDetails/TaskDetails.module.css";
import { menuStyle } from "Routes/Chat/Main/UserChat/footer/css/defaultStyle";
import { getPatientData } from "Routes/Chat/Main/UserChat/footer/ChatFooter";
import { dispatch } from "redux/store";
import ModalReactstrap from "Components/Modals/Modal";
import ClockInFirst from "./ClockInFirst";
import TaskReplies from "./TaskReplies";
import TaskActivity from "./Activity";
import { TASK_CONST } from "redux/constants/taskConstants";
import ConfettiComp from "./Confetti";
import { ToggleSwitch } from "Routes/Chat/Main/UserChat/footer/TaskType/ToggleSwitch";
import { toast } from "react-hot-toast";
import TaskCategorySelect from "./Labels/TaskCategorySelect";
import ErrorBoundary from "Components/ErrorBoundry";
import { MuiActionButton } from "Components/MuiDataGrid";
import { Close } from "@mui/icons-material";
import taskService from "services/APIs/services/taskService";
// import chatService from "services/APIs/services/chatService";

const STATUS_ARR = TASK_STATUS.filter((status) => status.id !== 0);

const TABS = [
	{ id: 1, label: "", value: "info" },
	{ id: 2, label: "", value: "tracker" },
	{ id: 3, label: "", value: "logs" },
	{ id: 4, label: "", value: "reply" },
	{ id: 5, label: "", value: "activity" },
];

export default function TaskDetails({ onClose, task }) {
	const navigate = useNavigate();
	const { user } = useSelector((state) => state.user);
	const { imageId, chatList, activeChat } = useSelector((state) => state.chat);
	const { taskDetails: taskDetail } = useSelector((state) => state.task);
	const [state, setState] = useState({
		clockInFirstModel: false,
		activeTab: TABS[0],
		isImageShow: false,
		labelMenu: false,
		isEditMode: false,
		isDisable: false,
		// showConfetti: false
	});
	const [taskDetails, setTaskDetails] = useState(taskDetail);
	const [updateInput, setUpdateInput] = useState();
	const {
		isImageShow = false,
		labelMenu = false,
		isEditMode = false,
		isDisable = false,
		isTrackerRunning = false,
		showStatusDD = false
	} = state;
	const patientRef = useRef(null);
	const labelRef = useRef();
	const statusDDRef = useRef();

	useClickAway(labelRef, () => {
		labelMenu && setState(prev => ({ ...prev, labelMenu: false }));
	});
	useClickAway(statusDDRef, () => {
		showStatusDD && setState(prev => ({ ...prev, showStatusDD: false }));
	});

	const updateLabel = (labelDropdown) => {
		if (!labelDropdown && taskDetails && taskDetail.messageTaskCategories !== taskDetails.messageTaskCategories)
			onTaskDetailsChanged(taskDetails.id, { label: taskDetails.messageTaskCategories.map(i => i.categoryId) });
	}
	const onCloseTask = () => {
		updateLabel(!labelMenu);
		onClose();
	}
	useEffect(() => {
		updateLabel(labelMenu);
		//eslint-disable-next-line
	}, [labelMenu]);

	useEffect(() => {
		if (taskDetail && taskDetail?.id)
			setTaskDetails(taskDetail);
		//eslint-disable-next-line
	}, [taskDetail]);

	useEffect(() => {
		// (async () => {
		// 	if (taskDetail?.chatId) {
		// 		const res = await getChatUsers(taskDetail?.chatId);
		// 		if (res?.status) dispatch({ type: CHAT_CONST.SET_CHAT_USERS_LIST, payload: filterChatUsers(res?.data) });
		// 	}
		// })();
		// listenTaskActivities();
		if (taskDetail && taskDetail.id) {
			if (taskDetail) setTaskDetails(taskDetail);

			// ListenTaskDetailUpdate(taskDetail.id);
			// ListenTaskCommentAdd(taskDetail.id);
			// ListenTaskCommentUpdate(taskDetail.id);
			// ListenTaskCommentDelete(taskDetail.id);
			// ListenTaskNotification({ taskId: taskDetail.id, userId: user.id, chatId: activeChat.id, chatList });
			// ListenTaskReviewUpdate(taskDetail.id);
		}
		return () => {
			// ListenTaskReviewUpdate(-1);
			// ListenTaskDetailUpdate(-1);
			// ListenTaskCommentAdd(-1);
			// ListenTaskCommentUpdate(-1);
			// ListenTaskCommentDelete(-1);
			// ListenTaskNotification(-1);
		}
		//eslint-disable-next-line
	}, [taskDetail?.id]);

	// useEffect(() => {
	// 	(async () => {
	// 		if (state.activeTab.id === 1) return;
	// 		const isTaskMember = taskDetails?.taskmembers?.map((item) => item.userId)?.includes(user.id);
	// 		const isCreator = taskDetails.createdBy === user.id;
	// 		const isAdmin = getAdminAccess(user);
	// 		if (taskDetails.id && (isTaskMember || isAdmin || isCreator)) {
	// 			const data = await taskService.tasklog({ payload: { taskId: taskDetails.id } });
	// 			if (data?.status === 1) dispatch({ type: USER_CONST.SET_SEARCH_USER_TASK_LOGS, payload: data });
	// 		}
	// 	})();
	// 	//eslint-disable-next-line
	// }, [taskDetails.id, taskDetails?.clockTime, user.id, taskDetails?.taskmembers]);

	const userDesgIds = useMemo(() => {
		return taskDetails?.taskmembers?.find(mem => mem.userId === user.id)?.user?.userDesignations?.map(i => i.designationId) || [];
	}, [taskDetails.taskmembers, user.id]);

	// save updated data 
	const onTaskDetailsChanged = useCallback(async (taskId, body) => {
		const data = {
			taskId,
			chatId: taskDetails.chatId,
			messageId: taskDetails.messageId,
			...body,
			useDesignationIds: userDesgIds
		}
		if (data.hasOwnProperty("status") && data.status !== CONST.TASK_STATUS[3].value && getTaskReviewer(taskDetails?.taskmembers)) {
			dispatch({
				type: TASK_CONST.UPDATE_TASK_DETAILS, payload: {
					taskmembers: getTaskMembers(taskDetails?.taskmembers)
				}
			});
		}
		SocketEmiter(SOCKET.REQUEST.UPDATE_TASK, data);
	}, [taskDetails.chatId, taskDetails.messageId, userDesgIds, taskDetails?.taskmembers]);

	const statusChangeHandler = useCallback((stat) => {
		const status = taskDetail?.taskStatuses?.find(item => item.userId === user.id)?.status;
		if (stat.value !== status) {
			setState(prev => ({ ...prev, showStatusDD: false }));
			setTaskDetails((prev) => ({ ...prev, status: stat.value }));
			const taskMembers = taskDetails?.taskmembers?.map((user) => user.userId);
			onTaskDetailsChanged(taskDetails.id, { status: stat.value, users: taskMembers });
			if (stat.value === CONST.TASK_STATUS[3].value) {
				setTimeout(() => setState(prev => ({ ...prev, showConfetti: true })), 1000);
				dispatch({ type: TASK_CONST.UPDATE_WATCH_LIST, payload: { removeWatchListId: taskDetails?.id } });
			}
		}
	}, [onTaskDetailsChanged, taskDetail?.taskStatuses, taskDetails.id, taskDetails?.taskmembers, user.id]);

	const attchmentDeleteHandler = useCallback(async (id) => {
		try {
			await taskService.deleteAttachment({ payload: { attachmentId: id } });
			setTaskDetails((prev) => ({ ...prev, attachments: prev.attachments.filter((att) => att.id !== id) }));
			dispatch({ type: TASK_CONST.UPDATE_ACTIVITY_LOGS });
		} catch (error) { }
	}, []);

	const onCloseImageHandler = useCallback(() => {
		setState(prev => ({ ...prev, isImageShow: false }))
		dispatch({ type: CHAT_CONST.IMAGE_INDEX, payload: 0 });
	}, []);

	const reqTaskClockIn = useCallback((taskDetails) => {
		SocketEmiter(SOCKET.REQUEST.CREATE_TASK_LOG, { clockin: true, taskId: taskDetails.id }, (data) => {
			dispatch({ type: TASK_CONST.RECEIVED_TASK_CLOCK_DATA, payload: data.data });
		});
		changeProfileStatus(CONST.PROFILE.BUSY);
		setState(prev => ({ ...prev, isDisable: true }));
		setTimeout(() => setState(prev => ({ ...prev, isDisable: false })), 2000);
	}, []);

	const reqTaskClockOut = useCallback((taskDetails) => {
		SocketEmiter(SOCKET.REQUEST.CREATE_TASK_LOG, { clockout: true, taskId: taskDetails.id }, (data) => {
			dispatch({ type: TASK_CONST.RECEIVED_TASK_CLOCK_DATA, payload: data.data });
		});
		changeProfileStatus(CONST.PROFILE.AVAILABLE);
		setState(prev => ({ ...prev, isDisable: true }));
		setTimeout(() => setState(prev => ({ ...prev, isDisable: false })), 2000);
	}, []);

	const onTaskToggler = useCallback((taskDetails) => {
		setState(prev => ({ ...prev, isTrackerRunning: !prev.isTrackerRunning }))
		if (!isTrackerRunning) reqTaskClockIn(taskDetails);
		else reqTaskClockOut(taskDetails);
	}, [isTrackerRunning, reqTaskClockIn, reqTaskClockOut]);

	const OnClickTaskChat = useCallback(() => {
		// navigateTo(CONST.APP_ROUTES.CHAT);
		moveChatandQMessage({
			chatList,
			activeChat,
			user,
			qMessage: {
				id: taskDetails.messageId,
				chatId: taskDetails.chatId,
				chatDetails: taskDetails.chatDetails
			},
			navigate
		});
		onClose();
	}, [activeChat, chatList, navigate, onClose, taskDetails?.chatDetails, taskDetails.chatId, taskDetails.messageId, user]);

	const onSaveData = useCallback(() => {
		setState(prev => ({ ...prev, isEditMode: false }));
		let body = { taskId: taskDetails.id, messageId: taskDetail.messageId, ...updateInput };
		SocketEmiter(SOCKET.REQUEST.UPDATE_TASK_DATA, body);
		setUpdateInput();
	}, [taskDetails.id, taskDetail.messageId, updateInput]);

	const setInspectUser = useCallback((puserId) => {
		const privateUser = taskDetails.chatDetails.chatusers.find(usr => usr.userId === puserId)?.user;
		privateUser ?
			dispatch({ type: CHAT_CONST.SET_INSPECT_USER, payload: privateUser }) :
			showError("User is not available");
	}, [taskDetails?.chatDetails?.chatusers]);

	const onChangeTaskType = useCallback((value) => {
		// if (!value && !taskDetail?.isTeam) return;
		const oldVal = (taskDetail.isDepartment ? CONST.TASK_TYPE[2] : (taskDetail.isTeam ? CONST.TASK_TYPE[1] : CONST.TASK_TYPE[0]))
		if (oldVal === value) return;
		if ((oldVal !== CONST.TASK_TYPE[0]) && value === CONST.TASK_TYPE[0]) {
			TakeConfirmation({
				title: `Are you sure to change it to the single task?`,
				content: `Switch the task to single task will make all member status to "Pending".`,
				onDone: () => {
					setTimeout(() => {
						SocketEmiter(SOCKET.REQUEST.UPDATE_TASK_DATA, {
							taskId: taskDetails.id,
							messageId: taskDetail.messageId,
							isTeam: false, isDepartment: false, taskType: value
						});
					}, 500);
				}
			})
			// const ans = window.confirm('Are you sure to change it to the single task?\nNote: Switch the team task to single task will make all member status to "Pending".');
			// if (!ans) return;
		} else {
			let body = {
				taskId: taskDetails.id,
				messageId: taskDetail.messageId,
				taskType: value
			}
			if (value === CONST.TASK_TYPE[2]) body = { ...body, isTeam: false, isDepartment: true }
			else if (value === CONST.TASK_TYPE[1]) body = { ...body, isTeam: true, isDepartment: false }
			else if (value === CONST.TASK_TYPE[0]) body = { ...body, isTeam: false, isDepartment: false }
			SocketEmiter(SOCKET.REQUEST.UPDATE_TASK_DATA, body);
		}
	}, [taskDetail?.isTeam, taskDetail.messageId, taskDetails.id, taskDetail?.isDepartment]);

	const patientChangehandler = (event, newValue, newPlainTextValue, mentions) => {
		setUpdateInput((prev) => ({ ...prev, patient: newValue }));
	}

	const preCheckStatus = useCallback(({ isUserClockOut, isTaskFinished }) => {
		if (isUserClockOut)
			setState(prev => ({ ...prev, clockInFirstModel: true })) // Auto ClockIn to perform task
		else if (isTaskFinished) showError("Task is already marked as Finished")
		else setState(prev => ({ ...prev, showStatusDD: true }))
	}, []);

	const { isTaskMember, taskStatus, taskCreatedBy, taskCreatedAt, isTaskFinished, format_description, isCreator, memberType } = useMemo(() => {
		const isTaskMember = taskDetails?.taskmembers?.map((item) => item.userId).includes(user.id);
		const memberType = taskDetails?.taskmembers?.find(i => i.userId === user.id)?.type;
		const findStatus = taskDetails?.taskStatuses?.find(item => item.userId === user.id);
		const taskStatus = findStatus ? findStatus.status : STATUS_ARR[0].value;
		const taskCreatedBy = taskDetails?.createdByUser;
		const taskCreatedAt = taskDetails?.createdAt;
		const isTaskFinished = taskDetails.status === CONST.TASK_STATUS[3].value;
		const isCstmMsg = taskDetails.name?.startsWith('\n');
		const format_description = isCstmMsg ? format_all(taskDetails.name?.substring(1)) : format_all(taskDetails.name);
		const isCreator = taskDetails.createdBy === user.id;
		return { isTaskMember, findStatus, taskStatus, taskCreatedBy, taskCreatedAt, isTaskFinished, format_description, isCreator, memberType };
	}, [taskDetails, user.id]);

	const { isUserClockOut, isAdmin } = useMemo(() => {
		const isUserClockOut = user?.clockTime?.clockin?.length === user?.clockTime?.clockout?.length;
		const isAdmin = getAdminAccess(user);
		return { isUserClockOut, isAdmin };
	}, [user]);

	if (isImageShow)
		return (<div className="modal modal-lg-fullscreen fade show d-block task-image-gallery" id="imageGallery" tabIndex={-1} role="dialog" aria-labelledby="dropZoneLabel" aria-modal="true">
			<ReactImageVideoLightbox
				data={taskDetails.attachments
					.filter((item) => ["image", "video"].includes(item.mediaType.split("/").shift()))
					.map((item) => {
						const itemType = item.mediaType.split("/").shift();
						if (itemType === "video")
							return {
								...item,
								url: item.mediaUrl,
								type: "video",
								title: 'video title'
							}
						return {
							...item,
							url: item.mediaUrl,
							type: "photo",
							altTag: 'Alt Photo'
						}
					})}
				startIndex={taskDetails?.attachments
					.filter((item) => ["image", "video"].includes(item.mediaType.split("/").shift()))
					.findIndex((item) => item.id === imageId)}
				showResourceCount={true}
				onCloseCallback={onCloseImageHandler}
			/>
		</div>);

	if (taskDetails) {
		return (<>
			<ModalReactstrap
				size="lg"
				show={true}
				toggle={onCloseTask}
				modalClassName={state.showConfetti ? "visibility-hidden" : ""}
				backdrop={state.showConfetti ? false : undefined}
				closeBtns={<>
					<div className={`icons d-flex align-items-center gap-10 text-color`}>
						<MuiActionButton size="small" tooltip='View Message' Icon={ChatDots} onClick={OnClickTaskChat} />
						<TaskCategorySelect
							ref={labelRef}
							labelMenu={labelMenu}
							taskDetails={taskDetails}
							setLabelMenu={data => setState(prev => ({ ...prev, labelMenu: data }))}
							setTaskDetails={setTaskDetails}
						/>
						<MuiTooltip title='Attachment file'>
							<div className="icon">
								<AttachmentInput taskId={task.id} />
							</div>
						</MuiTooltip>
						{taskDetails.createdBy === user.id &&
							<MuiActionButton
								size="small"
								tooltip={taskDetails.createdBy === user.id ? `Edit task` : 'Contact creator for edit task'}
								onClick={() => setState(prev => ({ ...prev, isEditMode: !prev.isEditMode }))}
								className={`icon ${isEditMode ? "text-success" : "text-color"} ${taskDetails.createdBy !== user.id ? 'disabled' : ''}`}
								Icon={PencilFill}
							/>
						}
						{isEditMode && (updateInput?.name !== taskDetails.name || updateInput?.patient !== taskDetails.patient || updateInput?.subject !== taskDetails.subject) &&
							<MuiActionButton size="small" tooltip='Save' className={`text-success`} Icon={Save2Fill} onClick={onSaveData} />
						}
						<MuiActionButton size="small" Icon={Close} className="text-black" tooltip="Close" onClick={onCloseTask} />
					</div>
				</>}
				header={
					<span className="text-truncate">
						{taskDetails?.chatDetails?.name ? (taskDetails.chatDetails.type === CONST.CHAT_TYPE.PRIVATE ? `${taskDetails.chatDetails.name}'s Chat` : `${taskDetails.chatDetails.name}`)
							: 'Task Details'}
					</span>
				}
				body={
					<ErrorBoundary>
						<nav className='task-nav mb-2'>
							<div className="nav nav-tabs" id="nav-tab" role="tablist">
								<button className={`nav-link ${state.activeTab.id === 1 ? 'active' : ''}`} onClick={() => setState(prev => ({ ...prev, activeTab: TABS[0] }))}>Task Info</button>
								{(isTaskMember) &&
									<button className={`nav-link ${state.activeTab.id === 2 ? 'active' : ''}`} onClick={() => setState(prev => ({ ...prev, activeTab: TABS[1] }))}>Tracker</button>}
								{(isAdmin || isCreator) &&
									<button className={`nav-link ${state.activeTab.id === 3 ? 'active' : ''}`} onClick={() => setState(prev => ({ ...prev, activeTab: TABS[2] }))}>Time logs</button>}
								<button className={`nav-link ${state.activeTab.id === 5 ? 'active' : ''}`} onClick={() => setState(prev => ({ ...prev, activeTab: TABS[4] }))}>Activity logs</button>
								<button className={`nav-link ${state.activeTab.id === 4 ? 'active' : ''}`} onClick={() => setState(prev => ({ ...prev, activeTab: TABS[3] }))}>Replies</button>
							</div>
						</nav>
						<div className="tab-content" id="nav-tabContent">
							{state.activeTab.id === 1 &&
								<div className="tab-pane text-color fade show active">
									<div className="d-flex mb-1 justify-content-between flex-wrap">
										<div className="d-flex align-items-end">
											<p className="font-weight-semibold mr-1 mb-0">Created by: </p>
											{taskCreatedBy &&
												<p className="mb-0">
													<span className="light-text">
														{taskCreatedBy.name}
													</span>
													<span className="light-text ml-1">
														{`(on ${moment(taskCreatedAt).format('MM/DD/YYYY')})`}
													</span>
												</p>}
										</div>
										<div title={!isCreator ? 'Only creator can edit' : ''}
											onClick={() => {
												if (!isCreator && !isAdmin) {
													toast.dismiss("task-creator");
													showError('Only task creator or admin is allowed to edit this field', "task-creator")
												}
											}}>
											<ToggleSwitch
												values={CONST.TASK_TYPE}
												isCreator={isCreator || isAdmin}
												OnChange={e => (isCreator || isAdmin) && onChangeTaskType(e)}
												selected={(taskDetail.isDepartment ? CONST.TASK_TYPE[2] :
													(taskDetail.isTeam ? CONST.TASK_TYPE[1] : CONST.TASK_TYPE[0]))}
											/>
										</div>
									</div>
									<div className="row justify-content-between m-auto">
										<div className="d-flex align-items-center mr-1 mb-1 form-group">
											<label htmlFor="dueDate" className="pointer-cursor m-0 mr-1" title="Due Date">
												<nobr className="font-weight-semibold">Due Date:</nobr>
											</label>
											<DatePicker
												id="dueDate"
												className={`form-control flex-grow-1 ${(taskDetails.createdBy !== user.id || !isEditMode) ? 'transparent-bg border-0 p-0' : `${classes["form-control"]} p-4_8 border-0`}`}
												selected={!isEditMode ? (taskDetails?.dueDate ? new Date(taskDetails.dueDate) : null) : (updateInput?.dueDate ? new Date(updateInput.dueDate) : null)}
												autoComplete="off"
												onChange={(date) => {
													// onTaskDetailsChanged(taskDetails.id, { dueDate: moment(date).toLocaleString() });
													// setTaskDetails((prev) => ({ ...prev, dueDate: moment(date).toLocaleString() }));
													setUpdateInput(prev => ({ ...prev, dueDate: moment(date).toLocaleString() }))
												}}
												timeInputLabel="Time:"
												dateFormat="MM/dd/yyyy h:mm aa"
												disabled={taskDetails.createdBy !== user.id || !isEditMode}
												placeholderText={taskDetails.createdBy !== user.id && !taskDetails.dueDate ? '-' : 'Select due date'}
												showTimeInput
											/>
										</div>
										{memberType !== CONST.TASK_MEMBER_TYPE.REVIEWER &&
											<div className={`bold-text d-flex align-items-center mb-1 ${!isTaskMember ? "visibility-hidden" : ""}`}>
												<div className="dropdown">
													{/* position-unset */}
													<button className={`btn btn-primary dropdown-toggle text-capitalize task-status-btn ${(isUserClockOut || isTaskFinished) ? 'disabled' : ''}`}
														onClick={() => preCheckStatus({ isUserClockOut, isTaskFinished })}
													>
														Status: {taskStatus}
													</button>
													{/* cstm-taskstatus-dropdown  */}
													<ul ref={statusDDRef} className={`dropdown-menu text-light m-0 ${showStatusDD ? "show" : ""} ${isTaskFinished ? 'visibility-hidden' : ''}`}>
														{STATUS_ARR.map((stat) => {
															if ((taskStatus !== STATUS_ARR[0].value && stat.value === STATUS_ARR[0].value) ||
																(taskStatus === STATUS_ARR[0].value && stat.value === STATUS_ARR[2].value) ||
																(taskStatus === STATUS_ARR[0].value && stat.value === STATUS_ARR[3].value) ||
																(taskStatus === STATUS_ARR[0].value && stat.value === STATUS_ARR[4].value) ||
																(taskStatus !== STATUS_ARR[3].value && stat.value === STATUS_ARR[3].value &&
																	taskDetails.subtasks.some(st => st.status === CONST.TASK_STATUS[0].value)) ||
																(stat.value === taskStatus))
																return null;
															return (
																<li key={stat.id} className={`dropdown-item cursor-pointer text-capitalize`} onClick={() => statusChangeHandler(stat)}>
																	{stat.value}
																</li>
															)
														})}
													</ul>
												</div>
											</div>}
									</div>
									<div className="mb-1">
										{!isEditMode ?
											<div className="col-12 p-0">
												<p className="mb-0">
													<span className="font-weight-semibold">Subject: </span>
													{taskDetails?.subject ?
														<span className="light-text-70" dangerouslySetInnerHTML={{ __html: format_all(taskDetails.subject) }} />
														: <span className="text-muted">{'-'}</span>}
												</p>
											</div> :
											<div className="align-items-center d-flex form-group m-0">
												<p className="mb-0"><span className="mr-1">Subject: </span></p>
												<input type="text" name="subject" id="subject" placeholder="Enter subject"
													defaultValue={taskDetails.subject}
													onChange={(e) => setUpdateInput(prev => ({
														...prev, subject: e.target.value
													}))}
													className={`${classes["form-control"]} form-control p-4_8`} />
											</div>
										}
									</div>
									<div className="mb-1">
										{!isEditMode ?
											<div className="col-12 p-0">
												<p className="font-weight-semibold mb-0 d-inline-flex">
													<span className="mr-1">Patient:</span>
													{taskDetails?.patient ?
														<span className="light-text-70" dangerouslySetInnerHTML={{ __html: format_patient(taskDetails.patient) }} />
														: <span className="text-muted">{'-'}</span>}
												</p>
											</div> :
											<div className="col-12 align-items-center d-flex form-group p-0">
												<p className="mb-0 mr-1">Patient: </p>
												<div className='form-control emojionearea-form-control w-50 d-flex align-items-center rounded-0 mentions-input transparent-bg'>
													<MentionsInput
														id="patientInput"
														name="patient"
														autoComplete="off"
														placeholder="@"
														type="text"
														style={menuStyle}
														value={updateInput?.patient ? updateInput.patient : ""}
														onChange={patientChangehandler}
														className='mentions__ccusers emojionearea-form-control inputField mx-1 flex-100 transparent-bg'
														singleLine
														inputRef={patientRef}
													>
														<Mention
															type="user"
															trigger="@"
															markup="<@__id__>(__display__)"
															// markup="<#__id__>(@__display__)"
															// data={patientData}
															data={getPatientData}
															displayTransform={(id, display) => { return `@${display} ` }}
															className="text-highlight-blue z-index-1"
															style={{ zIndex: 1, position: 'inherit' }}
														/>
													</MentionsInput>
												</div>
											</div>}
									</div>
									<div className="mb-1">
										{!isEditMode ?
											<div className="col-12 p-0">
												<p className="mb-0">
													<span className="font-weight-semibold d-inline-flex mr-1">Description: </span>
													<span className="light-text-70 white-space-preline" dangerouslySetInnerHTML={{ __html: format_description }} />
												</p>
											</div> :
											<div className="col-12 p-0 d-flex flex-wrap form-group">
												<span className="mr-1">Description: </span>
												<textarea
													name="message"
													autoComplete="off"
													className="form-control input-border"
													id="messageInput"
													placeholder="Type Message/Task here..."
													defaultValue={taskDetails.name}
													onChange={(e) => setUpdateInput(prev => ({
														...prev, name: e.target.value
													}))}
													autoFocus
												/>
											</div>}
									</div>
									<div className="row mt-2">
										<div className="col-12 col-md-8">
											<div className="card mb-2 light-shadow">
												<SubTask />
											</div>
											<div className="card mb-2 light-shadow">
												<TaskComments taskDetails={taskDetails} />
											</div>
										</div>
										<div className="col-12 col-md-4 text-center">
											<div className="row">
												{taskDetails?.taskmembers &&
													<TaskMembers
														taskDetails={taskDetails}
														setTaskDetails={setTaskDetails}
														isTaskFinished={isTaskFinished}
														setInspectUser={setInspectUser}
													/>}
												<TaskLabels taskDetails={taskDetails} />
												<TaskAttachment
													taskDetails={taskDetails}
													setImageShow={data => setState(prev => ({ ...prev, isImageShow: data }))}
													attchmentDeleteHandler={attchmentDeleteHandler}
												/>
											</div>
										</div>
									</div>
								</div>}
							{(state.activeTab.id === 2 && isTaskMember) &&
								<div className="tab-pane text-color fade show active">
									<TimeTracker
										taskDetails={taskDetails}
										onTaskToggler={onTaskToggler}
										isDisable={isDisable}
										isTrackerRunning={isTrackerRunning}
										setTracker={data => setState(prev => ({ ...prev, isTrackerRunning: data }))}
									/>
								</div>}
							{state.activeTab.id === 3 && (isAdmin || isCreator) &&
								<div className="tab-pane text-color fade show active">
									<TaskLogs taskDetails={taskDetails} />
								</div>}
							{state.activeTab.id === 4 &&
								<div className="tab-pane text-color fade show active">
									<TaskReplies taskDetails={taskDetails} onClose={onCloseTask} />
								</div>}
							{state.activeTab.id === 5 &&
								<div className="tab-pane text-color fade show active">
									<div className="card mb-2 light-shadow">
										<TaskActivity taskDetails={taskDetails} />
									</div>
								</div>}
						</div>
					</ErrorBoundary>
				}
			/>
			<ClockInFirst setState={setState} state={state} />
			{state.showConfetti &&
				<ConfettiComp cb={() => { setState(prev => ({ ...prev, showConfetti: false })) }} />}
		</>);
	}
}
