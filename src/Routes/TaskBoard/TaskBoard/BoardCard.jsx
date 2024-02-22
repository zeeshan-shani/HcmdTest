import React, { useCallback, useRef, useState } from "react";
import classes from "../TasksPage.module.css";
import { Draggable, Droppable } from "react-beautiful-dnd";

import { ReactComponent as TaskStarted } from "assets/media/heroicons/task-started.svg";
import { ReactComponent as TaskPaused } from "assets/media/heroicons/task-paused.svg";
import { ReactComponent as TaskPending } from "assets/media/heroicons/task-pending.svg";
import { ReactComponent as TaskCompleted } from "assets/media/heroicons/task-completed.svg";
import BoardTaskCard from "./BoardTaskCard";
import DatePicker from "react-datepicker";
import { compareName } from "Routes/Chat/Main/UserChat/info/group-chat-info/GroupChatInfo";
import moment from "moment-timezone";
import { CONST } from "utils/constants";
import { Check, ExclamationTriangle } from "react-bootstrap-icons";
import { MuiTooltip } from "Components/components";
import { moveChatandQMessage } from "redux/actions/chatAction";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToggleSwitch } from "Routes/Chat/Main/UserChat/footer/TaskType/ToggleSwitch";
import { PublishedWithChangesTwoTone } from "@mui/icons-material";
import { useClickAway } from "react-use";

const defaultCardInput = {
	title: "",
	patient: "",
	subject: "",
	isTeam: false,
	isDepartment: false
}
export default function BoardCard({
	tasks,
	title,
	droppableId,
	index,
	card,
	addNewTaskHandler,
	taskDeleteHandler,
	activeTaskChat,
	userDesignations,
	taskCategories,
	disabledAddDelete
}) {
	const navigate = useNavigate();
	const { user } = useSelector(state => state.user);
	const { chatList, activeChat } = useSelector(state => state.chat);
	const [addCardFlag, setAddCardFlag] = useState(false);
	const [cardInput, setCardInput] = useState(defaultCardInput);
	const [taskDueDate, setTaskDueDate] = useState(null);
	const [showMembers, setShowMembers] = useState(false);
	const [assignMembers, setAssignMem] = useState([]);
	const [assignDesignation, setAssignDesg] = useState([]);
	const dropdownTaskRef = useRef();
	useClickAway(dropdownTaskRef, () => setShowMembers(false))

	const addNewTask = useCallback((e) => {
		e.preventDefault();
		if (cardInput.title === "" || !assignMembers.length) return;
		const data = {
			chatId: activeTaskChat.id,
			name: cardInput.title,
			subject: cardInput.subject,
			patient: cardInput.patient,
			dueDate: taskDueDate,
			description: "",
			assignMembers: assignMembers?.map((mem) => mem.user.id),
			type: card.id,
		}
		addNewTaskHandler(data, () => {
			setCardInput(defaultCardInput);
			setTaskDueDate();
			setAssignMem([]);
		});
		setAddCardFlag(false);
	}, [activeTaskChat.id, addNewTaskHandler, assignMembers, card.id, cardInput.patient, cardInput.subject, cardInput.title, taskDueDate]);

	const addMemberHandler = useCallback((member) => {
		if (assignMembers.some((mem) => mem.user.id === member.user.id))
			setAssignMem((prev) => (prev.filter((mem) => mem.user.id !== member.user.id)));
		else setAssignMem((prev) => ([member, ...prev]));
	}, [assignMembers]);

	const onChangeTaskType = useCallback((val) => {
		if (val === CONST.TASK_TYPE[2]) setCardInput(prev => ({ ...prev, isTeam: false, isDepartment: true }))
		else if (val === CONST.TASK_TYPE[1]) setCardInput(prev => ({ ...prev, isTeam: true, isDepartment: false }))
		else if (val === CONST.TASK_TYPE[0]) setCardInput(prev => ({ ...prev, isTeam: false, isDepartment: false }))
	}, []);

	const addDesgMembers = useCallback((desg) => {
		if (assignDesignation.some((item) => item.id === desg.id)) {
			activeTaskChat?.chatusers.forEach(user => {
				if (user?.user?.userDesignations &&
					user?.user?.userDesignations.map(item => item.designationId).includes(desg.id) &&
					assignMembers.some((mem) => mem.user.id === user.user.id))
					addMemberHandler(user)
			});
			setAssignDesg((prev) => (prev.filter((item) => item.id !== desg.id)))
		} else {
			activeTaskChat?.chatusers.forEach(user => {
				if (user?.user?.userDesignations &&
					user?.user?.userDesignations.map(item => item.designationId).includes(desg.id) &&
					!assignMembers.some((mem) => mem.user.id === user.user.id))
					addMemberHandler(user)
			});
			setAssignDesg((prev) => ([desg, ...prev]))
		}
	}, [activeTaskChat?.chatusers, addMemberHandler, assignDesignation, assignMembers]);

	const routeToChatMessage = useCallback((qMessage) => {
		moveChatandQMessage({ chatList, activeChat, user, qMessage, navigate });
	}, [activeChat, chatList, navigate, user]);

	let tasksArr = { pending: 0, started: 0, paused: 0, finished: 0, review: 0 }
	tasks?.filter(task => {
		const status = task?.taskStatuses?.find(item => item.userId === user.id)?.status;
		if (status) {
			switch (status) {
				case CONST.TASK_STATUS[0].value: tasksArr.pending++;
					break;
				case CONST.TASK_STATUS[1].value: tasksArr.started++;
					break;
				case CONST.TASK_STATUS[2].value: tasksArr.paused++;
					break;
				case CONST.TASK_STATUS[3].value: tasksArr.finished++;
					break;
				case CONST.TASK_STATUS[4].value: tasksArr.review++;
					break;
				default:
			}
			return true;
		} else if (task.createdBy === user.id) {
			// tasksArr.pending++;
			return true;
		}
		return false;
	});
	return (
		<Draggable draggableId={card.id.toString()} index={index} type="card" isDragDisabled={true}>
			{(provided) => (
				<div ref={provided.innerRef} className={`${classes["board-card"]} ${classes["roe-box-shadow"]} task-card-item`}>
					<div className='accordion text-color' ref={provided.innerRef}>
						<div className={`${classes["accordion-item"]} task-card-item`}>
							<div>
								<div
									className="accordion-button collapsed cursor-pointer d-flex justify-content-between"
									data-bs-toggle="collapse"
									data-bs-target={`#panelsStayOpen-collapse-${card.id}`}
									aria-expanded="false"
									aria-controls={`panelsStayOpen-collapse-${card.id}`}
								>
									<div className={`d-flex ${classes["column-title"]} text-color`}>
										<div className={`${classes.title}`}>{title}</div>
										{/* {activeTaskChat && activeTaskChat.id !== -1 &&
											<div className={`btn text-color fs-14 ${classes["add-task-block"]} ${classes["add-board-task"]} ${classes["semi-bold-text"]} p-0 ml-auto`} onClick={() => setAddCardFlag(true)}>
												<Plus size={16} />
											</div>} */}
									</div>
									<div className={`d-flex ${classes["column-title"]}`}>
										<div className={`${classes["header-options"]} ${classes["task-options"]} w-100 text-color`}>
											<MuiTooltip title='Pending tasks'>
												<div className="d-flex align-items-center task-card-svg">
													<div className="svg-wrap">
														<TaskPending />
													</div>
													<p className="mb-0">{tasksArr.pending}</p>
												</div>
											</MuiTooltip>
											<MuiTooltip title='Started tasks'>
												<div className="d-flex align-items-center task-card-svg">
													<div className="svg-wrap">
														<TaskStarted />
													</div>
													<p className="mb-0">{tasksArr.started}</p>
												</div>
											</MuiTooltip>
											<MuiTooltip title='Paused tasks'>
												<div className="d-flex align-items-center task-card-svg">
													<div className="svg-wrap">
														<TaskPaused />
													</div>
													<p className="mb-0">{tasksArr.paused}</p>
												</div>
											</MuiTooltip>
											<MuiTooltip title='Review tasks'>
												<div className="d-flex align-items-center task-card-svg">
													<div className="svg-wrap">
														<PublishedWithChangesTwoTone color="success" />
													</div>
													<p className="mb-0">{tasksArr.review}</p>
												</div>
											</MuiTooltip>
											<MuiTooltip title='Finished tasks'>
												<div className="d-flex align-items-center task-card-svg">
													<div className="svg-wrap">
														<TaskCompleted />
													</div>
													<p className="mb-0">{tasksArr.finished}</p>
												</div>
											</MuiTooltip>
										</div>
									</div>
								</div>
							</div>
							<div id={`panelsStayOpen-collapse-${card.id}`} className={`accordion-collapse collapse show`} aria-labelledby={`card-${card.id}`}>
								<div className="accordion-body">
									{!disabledAddDelete && activeTaskChat && activeTaskChat.id !== -1 &&
										<div className={`btn ${classes["add-task-block"]} p-0 mr-2 text-color`} onClick={() => setAddCardFlag(!addCardFlag)}>
											<span>Add a new Task</span>
										</div>}
									<div className="overflow-auto">
										<Droppable droppableId={`${droppableId}-${card.id}`} type="task" direction="vertical">
											{(provided) => (
												<div ref={provided.innerRef} className={`${classes["board-card-scroll"]} p-1 ${addCardFlag ? classes["board-card-height"] : ""}`}>
													{!!tasks.length &&
														tasks.map((task, index) => (
															<BoardTaskCard
																key={task.id}
																task={task}
																index={index}
																taskDeleteHandler={taskDeleteHandler}
																routeToChatMessage={routeToChatMessage}
																taskCategories={taskCategories}
																disabledAddDelete={disabledAddDelete}
																activeTaskChat={activeTaskChat}
															/>
														))}
													{!tasks.length && (<div className="text-center light-text-70">
														{/* <ExclamationSVG /> */}
														<ExclamationTriangle size={20} />
														<p className="mb-0">
															No task available
														</p>
													</div>
													)}
													{provided.placeholder}
												</div>
											)}
										</Droppable>
										{addCardFlag && (
											<div className={`${classes["add-card-input-block"]}`}>
												<form onSubmit={addNewTask}>
													<div className="text-color">
														<div className="d-flex align-items-center form-group w-100 mb-1">
															<label htmlFor="subject" className="mb-0 mr-1 fs-14">
																Subject:
															</label>
															<input
																type="text"
																id="subject"
																value={cardInput.subject}
																onChange={(e) => {
																	setCardInput((prev) => ({
																		...prev,
																		subject: e.target.value,
																	}));
																}}
																className={`${classes["form-control"]} form-control p-4_8 fs-14`}
															/>
														</div>
														<div className="d-flex align-items-center form-group w-100 mb-1">
															<label htmlFor="patient" className="mb-0 mr-1 fs-14">
																Patient:
															</label>
															<input
																type="text"
																id="patient"
																value={cardInput.patient}
																onChange={(e) => {
																	setCardInput((prev) => ({
																		...prev,
																		patient: e.target.value,
																	}));
																}}
																className={`${classes["form-control"]} form-control p-4_8 fs-14`}
															/>
														</div>
														<div className="d-flex align-items-center form-group w-100 mb-1">
															<label htmlFor="title" className="mb-0 mr-1 fs-14">
																Title:
															</label>
															<input
																type="text"
																id="title"
																autoFocus
																value={cardInput.title}
																onChange={(e) => {
																	setCardInput((prev) => ({
																		...prev,
																		title: e.target.value,
																	}));
																}}
																className={`${classes["form-control"]} form-control p-4_8 fs-14`}
															/>
														</div>
														<div className="d-flex align-items-center mb-1">
															<ToggleSwitch
																values={CONST.TASK_TYPE}
																OnChange={e => onChangeTaskType(e)}
																selected={(cardInput?.isDepartment ? CONST.TASK_TYPE[2] :
																	(cardInput?.isTeam ? CONST.TASK_TYPE[1] : CONST.TASK_TYPE[0]))}
															/>
														</div>
														<div className="d-flex align-items-center mb-1">
															<div className="text-left">
																<div className="dropdown show chat-member-dropdown open-upside" ref={dropdownTaskRef}>
																	<button className="dropdown-toggle btn btn-sm bg-dark-f light-text-70 p-4_8"
																		title={`${!!assignMembers.length ? `Assigned to: ${assignMembers.map((item) => item.user.name).join(", ")}` : 'Click to assign members'}`}
																		onClick={() => setShowMembers(!showMembers)}>
																		<span className="fs-13">{`Members (${assignMembers?.length})`}</span>

																	</button>
																	{showMembers &&
																		<ul className="dropdown-menu text-light show" style={!tasks?.length ? { maxHeight: '200px' } : {}}>
																			{userDesignations?.map((item) => (
																				<li key={'d-' + item.id} className={`dropdown-item cursor-pointer`} onClick={() => addDesgMembers(item)}>
																					<div className="d-flex justify-content-between w-100">
																						<span>{item.name}</span>
																						<span>
																							{!!assignDesignation.filter((desg) => desg.id === item.id).length ? (<Check size={16} />) : ("")}
																						</span>
																					</div>
																				</li>
																			))}
																			<hr className='my-1' />
																			{activeTaskChat?.chatusers.sort(compareName)
																				.map((member) => (
																					<li key={member.user.id} className={`dropdown-item cursor-pointer`} onClick={() => addMemberHandler(member)}>
																						<div className="d-flex justify-content-between w-100">
																							<span>{member.user.name}</span>
																							<span>
																								{!!assignMembers.filter((mem) => mem.user.id === member.user.id).length ? (<Check size={16} />) : ("")}
																							</span>
																						</div>
																					</li>
																				))}
																		</ul>}
																</div>
															</div>
															<div className="ml-1 flex-nowrap">
																<DatePicker
																	id="dueDate"
																	placeholderText="Due Date"
																	className="form-control flex-grow-1 bg-dark-f p-4_8 input-border text-color"
																	selected={taskDueDate ? new Date(taskDueDate) : null}
																	value={taskDueDate ? new Date(taskDueDate) : null}
																	onChange={(date) => setTaskDueDate(date ? moment(date).toLocaleString() : null)}
																	isClearable={true}
																	dateFormat="MM/dd/yyyy h:mm aa"
																	autoComplete='off'
																	showTimeInput
																	minDate={moment().tz(CONST.TIMEZONE).toDate()}
																	timeInputLabel="Time:"
																/>
															</div>
														</div>
													</div>
													<div className={`${classes.action}`}>
														<button className={`btn btn-primary mr-2 p-4_8`} type="submit" title={`${!assignMembers?.length ? 'Please Assign members' : 'Add task'}`}>
															Add Task
														</button>
														<button className={`btn btn-light border p-4_8`} onClick={() => setAddCardFlag(false)}>
															Cancel
														</button>
													</div>
												</form>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</Draggable>
	);
}