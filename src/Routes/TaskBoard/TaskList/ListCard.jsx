import React, { useCallback, useMemo, useRef, useState } from "react";

import classes from "../TasksPage.module.css";
import DatePicker from "react-datepicker";
import { compareName } from "Routes/Chat/Main/UserChat/info/group-chat-info/GroupChatInfo";
import moment from "moment-timezone";
import { CONST } from "utils/constants";
import { Check } from "react-bootstrap-icons";
import { ToggleSwitch } from "Routes/Chat/Main/UserChat/footer/TaskType/ToggleSwitch";
import { format_all } from "redux/common";
import { MuiDeleteAction, MuiEditAction } from "Components/MuiDataGrid";
import { showError } from "utils/package_config/toast";
import { getTaskDetails } from "redux/actions/taskAction";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { useClickAway } from "react-use";
import { useSelector } from "react-redux";

const defaultInput = {
	title: "",
	patient: "",
	subject: "",
	dueDate: null,
	isTeam: false
}
export default function ListCard({
	tasks,
	card,
	addNewTaskHandler,
	taskDeleteHandler,
	activeTaskChat,
	addCardFlag,
	setAddCardFlag,
	userDesignations
}) {
	const { user } = useSelector(state => state.user);
	const [cardInput, setCardInput] = useState(defaultInput);
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
			assignMembers: assignMembers?.map((mem) => mem.user.id),
			type: card.id,
			...cardInput
		}
		addNewTaskHandler(data, () => {
			setCardInput(defaultInput);
			setAssignMem([]);
		});
		setAddCardFlag(false);
	}, [activeTaskChat.id, addNewTaskHandler, assignMembers, card.id, cardInput, setAddCardFlag]);

	const onChangeTaskType = useCallback((val) => {
		if (val === CONST.TASK_TYPE[2]) setCardInput(prev => ({ ...prev, isTeam: false, isDepartment: true }))
		else if (val === CONST.TASK_TYPE[1]) setCardInput(prev => ({ ...prev, isTeam: true, isDepartment: false }))
		else if (val === CONST.TASK_TYPE[0]) setCardInput(prev => ({ ...prev, isTeam: false, isDepartment: false }))
	}, []);

	const addMemberHandler = useCallback((member) => {
		if (assignMembers.some((mem) => mem.user.id === member.user.id))
			setAssignMem((prev) => (prev.filter((mem) => mem.user.id !== member.user.id)));
		else setAssignMem((prev) => ([member, ...prev]));
	}, [assignMembers]);
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

	const onEdit = useCallback((row) => {
		const isCreator = row.createdBy === user.id;
		const findStatus = row?.taskStatuses.find(item => item.userId === user.id);
		const isAllowtoAccess = isCreator || findStatus;
		if (!isAllowtoAccess) return showError('You are not allowed to access this task.');
		getTaskDetails({ taskId: row.id, messageId: row.messageId, isDepartment: row?.isDepartment });
	}, [user?.id]);

	const onDelete = useCallback((row) => {
		taskDeleteHandler(row.chatId, row.id, row?.messageId)
	}, [taskDeleteHandler]);

	const columns = useMemo(() => [
		{
			field: "title", headerName: "Title", minWidth: 200, flex: 1,
			renderCell: ({ row }) => {
				const taskTitle = row?.subject ? format_all(row.subject) : format_all(row?.name);
				return <div className="text-truncate in-one-line" dangerouslySetInnerHTML={{ __html: taskTitle }} />
			},
		},
		{
			field: "actions", headerName: "Actions", type: "actions", minWidth: 180,
			getActions: ({ row }) => [<>
				<MuiEditAction onClick={() => onEdit(row)} />
				<MuiDeleteAction onClick={() => onDelete(row)} />
			</>],
		},
		{
			field: "status", headerName: "Status", minWidth: 180,
			renderCell: ({ row }) => {
				const findStatus = row?.taskStatuses.find(item => item.userId === user.id)?.status;
				return <div className="text-capitalize">{findStatus || ""}</div>
			}
		},
		{
			field: "subtasks", headerName: "Subtasks", minWidth: 180,
			renderCell: ({ row }) => {
				const counts = !!row?.subtasks.length ? `${row.subtasks.filter((item) => item.status === "finished").length}/${row.subtasks.length}` : "-";
				return <div className="text-capitalize">{counts}</div>
			}
		},
		{
			field: "dueDate", headerName: "Due Date", minWidth: 180,
			renderCell: ({ row }) => {
				const dueDate = row.dueDate ? moment(row.dueDate).format("MM/DD/YY") : "-";
				return <div className="text-capitalize">{dueDate}</div>
			}
		}
	], [user?.id, onDelete, onEdit]);

	if (activeTaskChat)
		return (<>
			<div className={`cstm-mui-datagrid mt-2 ${!tasks?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGrow: 1 }}>
				<DataGridPro
					rows={tasks || []}
					columns={columns}
					autoHeight
					density="compact"
					disableColumnFilter
					disableVirtualization
					// sortModel={state.sortModel}
					// onSortModelChange={onSortModelChange}
					// loading={isFetching}
					components={{
						// LoadingOverlay: LinearProgress,
						Footer: () => null
						// <MuiDataGridFooter isFetching={isFetching}
						// 	lastUpdated={userList?.lastUpdated}
						// 	pagination={{ page: state?.page, total: userList?.count || 0, pageSize: state?.pageSize }}
						// 	onPageChange={(e, page) => {
						// 		updateState(setState, { page: page });
						// 	}}
						// />
					}}
				/>
			</div>
			{addCardFlag && (
				<div className={`p-1 d-flex justify-content-center`}>
					<form onSubmit={addNewTask}>
						<div className={`d-flex align-items-center ${classes["gap-2"]}`}>
							<div className="form-group ">
								<label htmlFor="subject" className="mb-1">
									Subject:
								</label>
								<input
									type="text"
									id="subject"
									value={cardInput.subject}
									onChange={(e) => setCardInput((prev) => ({ ...prev, subject: e.target.value }))}
									className={`${classes["form-control"]} form-control p-4_8 fs-14 w-100`}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="patient" className="mb-1">
									Patient:
								</label>
								<input
									type="text"
									id="patient"
									value={cardInput.patient}
									onChange={(e) => setCardInput((prev) => ({ ...prev, patient: e.target.value }))}
									className={`${classes["form-control"]} form-control p-4_8 fs-14 w-100`}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="title" className="mb-1">
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
									className={`${classes["form-control"]} form-control p-4_8 fs-14 w-100`}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="subject" className="mb-1">
									Assign to:
								</label>
								<div className="d-flex align-items-center">
									<div className="text-left">
										<div className="dropdown show chat-member-dropdown open-downside" ref={dropdownTaskRef}>
											<button className="dropdown-toggle btn btn-sm bg-dark-f light-text-70 p-4_8 input-border"
												title={`${!!assignMembers.length ? `Assigned to: ${assignMembers.map((item) => item.user.name).join(", ")}` : 'Click to assign members'}`}
												onClick={() => setShowMembers(!showMembers)}>
												<span className="fs-13">{`Members (${assignMembers?.length})`}</span>
											</button>
											{showMembers && <ul className="dropdown-menu text-light show">
												{userDesignations?.map((item) => (
													<li key={'d-' + item.id} className={`dropdown-item cursor-pointer`} onClick={() => addDesgMembers(item)}>
														<div className="d-flex justify-content-between w-100">
															<span>{item.name}</span>
															<span>
																{!!assignDesignation.filter((desg) => desg.id === item.id).length ? (<Check size={16} />) : ("")}
																{/* {!!assignDesignation.filter((desg) => desg.id === item.id).length ? (<CheckSvg className="hw-16" />) : ("")} */}
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
																	{/* {!!assignMembers.filter((mem) => mem.user.id === member.user.id).length ? (<CheckSvg className="hw-16" />) : ("")} */}
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
											className="form-control flex-grow-1 text-white bg-dark-f p-4_8"
											selected={cardInput?.dueDate ? new Date(cardInput.dueDate) : null}
											value={cardInput?.dueDate ? new Date(cardInput.dueDate) : null}
											onChange={(date) =>
												setCardInput(prev => ({ ...prev, dueDate: date ? moment(date).toLocaleString() : null }))
											}
											isClearable={true}
											dateFormat="MM/dd/yyyy h:mm aa"
											autoComplete='off'
											showTimeInput
											minDate={moment().tz(CONST.TIMEZONE).toDate()}
											timeInputLabel="Time:"
										/>
									</div>
									<div className="d-flex align-items-center ml-1">
										<ToggleSwitch
											values={CONST.TASK_TYPE}
											OnChange={e => onChangeTaskType(e)}
											selected={(cardInput?.isDepartment ? CONST.TASK_TYPE[2] :
												(cardInput?.isTeam ? CONST.TASK_TYPE[1] : CONST.TASK_TYPE[0]))}
										/>
									</div>
								</div>
							</div>
						</div>
						<div className={`text-center ${classes.action}`}>
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
		</>);
}
