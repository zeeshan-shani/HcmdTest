import React, { useCallback, useEffect, useLayoutEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import ReactDatePicker from "react-datepicker";
import { receiveNewTask } from "utils/wssConnection/Socket";

import classes from "../TasksPage.module.css";
import { TASK_STATUS } from "../config";
import useDebounce from "services/hooks/useDebounce";
import { ClockHistory, FunnelFill, SortAlphaDown, SortAlphaUp } from "react-bootstrap-icons";
import { CONST } from "utils/constants";
import { ToggleSwitch } from "./ToggleSwitch";
import { getChatTaskList } from "../TaskPage";
import moment from "moment-timezone";
import { TASK_CONST } from "redux/constants/taskConstants";
import { dispatch } from "redux/store";
import { getPrivateChatUser } from "services/helper";
import { compareByName } from "Routes/Chat/Main/UserChat/info/group-chat-info/GroupChatInfo";
import taskCategoryService from "services/APIs/services/taskCategoryService";
import { useQuery } from "@tanstack/react-query";
import { MuiTooltip } from "Components/components";
import { sortingMethods } from "Routes/Chat/Appbar/Todos";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { CalendarToday, Dashboard, List } from "@mui/icons-material";
import ReactSelect from "react-select";

let isRendering = false;
const allChat = { id: -1, name: CONST.CHAT_TYPE.ALL_CHATS, type: CONST.CHAT_TYPE.GROUP }
export default function FilterTasks({
	filterObj,
	setFilterObj,
	state,
	setState,
}) {
	const { activeTaskChat, filterTaskData } = useSelector((state) => state.task);
	const { chatList } = useSelector((state) => state.chat);
	const newFilters = useDebounce(filterObj, 500);
	const { sortMethod } = filterObj;

	const { data: taskCategories = [] } = useQuery({
		queryKey: ["/taskCategory/list"],
		queryFn: async () => {
			const data = await taskCategoryService.list({});
			if (data?.status === 1) return data.data
			return [];
		},
		keepPreviousData: false,
		staleTime: CONST.QUERY_STALE_TIME.L1,
	});

	useEffect(() => {
		if (!newFilters.dateFrom || !newFilters.dateTo) return;
		if (newFilters.chatId && isRendering) {
			let filters = {
				...newFilters,
				sortMethod: newFilters.sortMethod.value || sortingMethods[0].value,
				category: newFilters.category ? newFilters.category.id : null
			};
			receiveNewTask(filters);
			getChatTaskList(activeTaskChat?.id, chatList, filters);
		}
		if (!isRendering) isRendering = true;
		//eslint-disable-next-line
	}, [newFilters]);

	useLayoutEffect(() => {
		if (!activeTaskChat && !!chatList.length) {
			dispatch({ type: TASK_CONST.NEW_CHAT_SELECTED, payload: { ...allChat, name: CONST.CHAT_TYPE.ALL_CHATS } });
			setFilterObj(prev => ({
				...prev,
				chatId: chatList.map((chat) => chat.id),
				search: "",
				status: filterTaskData.status,
				dateFrom: filterTaskData.dateFrom,
				dateTo: filterTaskData.dateTo,
				chatType: CONST.CHAT_TYPE.ALL_CHATS
			}));
		}
		//eslint-disable-next-line
	}, [activeTaskChat]);

	const onChangeDate = useCallback((data) =>
		dispatch({ type: TASK_CONST.SET_TASK_FILTER_DATA, payload: { ...data } }), []);

	const onChangeFilter = useCallback((val) => setFilterObj(prev => ({ ...prev, filterTask: val })), [setFilterObj]);

	const getChatImageUrl = useCallback((chat) => {
		if (chat) {
			if (chat.type === CONST.CHAT_TYPE.GROUP)
				return { id: chat.id, name: chat.name, image: chat.image };
			else {
				const { name, profilePicture } = getPrivateChatUser(chat);
				return { id: chat.id, name, image: profilePicture };
			}
		}
		return { id: -1, name: null, image: null }
	}, []);

	const NewChatSelected = useCallback((chat) => {
		dispatch({ type: TASK_CONST.RES_GET_TASKLIST, payload: [] });
		let updates = {
			search: "",
			status: filterTaskData.status,
			dateFrom: filterTaskData.dateFrom,
			dateTo: filterTaskData.dateTo,
		}
		if (chat !== CONST.CHAT_TYPE.ALL_CHATS) {
			dispatch({ type: TASK_CONST.NEW_CHAT_SELECTED, payload: chat });
			updates = { ...updates, chatId: [chat.id], chatType: chat.type }
		} else {
			dispatch({ type: TASK_CONST.NEW_CHAT_SELECTED, payload: { id: -1, name: CONST.CHAT_TYPE.ALL_CHATS, type: CONST.CHAT_TYPE.GROUP } });
			updates = { ...updates, chatId: chatList.map((chat) => chat.id), chatType: CONST.CHAT_TYPE.ALL_CHATS }
		}
		setFilterObj(prev => ({
			...prev,
			chatId: chatList.map((chat) => chat.id),
			chatType: CONST.CHAT_TYPE.ALL_CHATS,
			...updates
		}));
	}, [chatList, filterTaskData.dateFrom, filterTaskData.dateTo, filterTaskData.status, setFilterObj]);

	const chatOptions = useMemo(() => chatList
		.map(i => ({ ...i, ...getChatImageUrl(i) }))
		.filter(i => i.name)
		.map(chat => ({ label: chat.name, value: chat })), [chatList, getChatImageUrl]);

	const { name = '' } = getChatImageUrl(activeTaskChat);

	try {
		return (
			<nav className={`navbar navbar-expand-lg p-0 m-1 ${classes["board-toolbar"]} board-toolbar bg__chat-dark position-sticky`}
				style={{ top: 0, zIndex: 999 }}>
				<div className="container-fluid p-0">
					<button
						className="navbar-toggler m-1"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#navbarSupportedContent"
						aria-controls="navbarSupportedContent"
						aria-expanded="false"
						aria-label="Toggle navigation"
					>
						<FunnelFill />
						<small className="ml-1">Filters</small>
					</button>
					<div className={`collapse navbar-collapse`} id="navbarSupportedContent">
						<div className={`p-1 m-0 navbar-nav w-100 justify-content-around`}>
							<div className="d-flex align-items-center mb-2 mb-lg-0">
								<ReactSelect
									className={`basic-single min-width-160`}
									classNamePrefix="select"
									placeholder={`Select chat...`}
									value={name ? [{ label: name }] : []}
									options={[{ ...allChat, label: allChat.name, value: allChat.name }, ...chatOptions]}
									onChange={(data) => NewChatSelected(data?.value)}
								/>
							</div>
							<div className="bold-text d-flex align-items-center mb-2 mb-lg-0 justify-content-between">
								<div className="dropdown-select-options mr-2">
									{/* <div className='p-1'>Task View: </div> */}
									<div className='options'>
										<ToggleButtonGroup
											color="primary"
											value={state.view}
											onChange={(e, view) => setState(prev => ({ ...prev, view }))}
											aria-label="taskboard:view"
											exclusive
											size="small"
										>
											{[
												{ name: CONST.TASK_BOARD_VIEW.CALENDAR, Icon: CalendarToday },
												{ name: CONST.TASK_BOARD_VIEW.BOARD, Icon: Dashboard },
												{ name: CONST.TASK_BOARD_VIEW.LIST, Icon: List },
												
											]
												.map((Item, index) => (
													<ToggleButton
														key={index}
														value={Item.name}
														className={`text-capitalize outline-none ${Item.name === state.view ? 'text-white' : ''}`}
													>
														<Item.Icon />
													</ToggleButton>
												))}
										</ToggleButtonGroup>
									</div>
								</div>
								<div className="dropdown">
									<button
										className="btn btn-outline-default dropdown-toggle text-capitalize custom-dropdown"
										type="button"
										id="statusDropdown"
										data-bs-toggle="dropdown"
										aria-expanded="false"
										title="Filter by task status"
									>
										<span>Status: {filterObj.status}</span>
									</button>
									<ul className="dropdown-menu position-absolute m-0" aria-labelledby="statusDropdown">
										{TASK_STATUS.map((status) => (
											<li
												key={status.id}
												className="dropdown-item cursor-pointer text-capitalize"
												onClick={() => {
													dispatch({ type: TASK_CONST.SET_TASK_FILTER_DATA, payload: { status: TASK_STATUS[status.id].value } });
												}}
											>
												{status.value}
											</li>
										))}
									</ul>
								</div>
								<div className="dropdown mx-2">
									<button
										className="btn btn-outline-default dropdown-toggle text-capitalize custom-dropdown text-truncate d-flex align-items-center"
										type="button"
										style={{ maxWidth: "250px" }}
										id="cateoryDropdown"
										data-bs-toggle="dropdown"
										aria-expanded="false"
										title="Filter by category"
									>
										{filterObj.category &&
											<div className='color-dot mr-1' style={filterObj.category.colorCode ?
												{ background: filterObj.category.colorCode } : {}} />}
										{filterObj.category ?
											`${filterObj.category.name || "unknown"}`
											: "Select Category"}
									</button>
									<ul className="dropdown-menu position-absolute m-0" aria-labelledby="statusDropdown">
										<li className="dropdown-item cursor-pointer text-capitalize"
											onClick={() => setFilterObj(prev => ({ ...prev, category: null }))}>
											{"All"}
										</li>
										{taskCategories
											.sort(compareByName)
											.map((category) => (
												<li
													key={category.id}
													className="dropdown-item cursor-pointer text-capitalize text-truncate"
													onClick={() => setFilterObj(prev => ({ ...prev, category: category }))}
												>
													<div className='color-dot mr-1' style={category.colorCode ?
														{ background: category.colorCode } : {}} />
													{category.name || "unknown"}
												</li>
											))}
									</ul>
								</div>
							</div>
							<div className="bold-text mb-2 mb-lg-0 form-group">
								<input
									type="text"
									name="search"
									id="search"
									title="Search task"
									placeholder="Search task"
									className={`${classes["form-control"]} form-control search mr-2`}
									value={filterObj.search}
									autoComplete="off"
									onChange={(e) => setFilterObj((prev) => ({ ...prev, search: e.target.value }))}
								/>
							</div>
							<div className="bold-text mb-2 mb-lg-0 form-group">
								<div className="toggle_chat mr-1">
									<ToggleSwitch
										values={[CONST.FILTER_TASK_TYPE.ASSIGNEE.value, CONST.FILTER_TASK_TYPE.CREATOR.value, CONST.FILTER_TASK_TYPE.ALL.value]}
										OnChange={onChangeFilter}
										selected={filterObj.filterTask} />
								</div>
							</div>
							<div className="date-task-filter d-flex align-items-center">
								<div className="input-group d-flex px-0 w-auto" title="Date from">
									<ReactDatePicker
										selectsRange={true}
										startDate={filterObj.dateFrom ? new Date(filterObj.dateFrom) : null}
										endDate={filterObj.dateTo ? new Date(filterObj.dateTo) : null}
										placeholderText="Created Date"
										className={`form-control search mr-3 ${!filterObj.dateFrom || !filterObj.dateTo ? "border-danger" : ""}`}
										// maxDate={filterObj.dateFrom ? moment(filterObj.dateFrom).add(1, "month").toDate() : null}
										onChange={(update) => {
											const [a, b] = update;
											onChangeDate({ dateFrom: a ? moment(a).startOf("day").toLocaleString() : null, dateTo: b ? moment(b).endOf("day").toLocaleString() : null })
										}}
										isClearable={true}
									/>
								</div>
							</div>
							<div className="d-flex align-items-center">
								{/* <Dropdown.Button
									menu={{
										items: sortMethods,
										selectable: true,
										onClick: ({ key }) => setSort(prev => ({ ...prev, by: key })),
										defaultSelectedKeys: ["1"],
									}}
									icon={sort.by === sortMethods[0].key ? <Abc /> : <AccessTime />}
									onClick={() => setSort(prev => ({ ...prev, ascending: !prev.ascending }))}
									className="taskSortDropdown"
								>
									<MuiTooltip title={sort.ascending ? "Ascending Order" : "Decending Order"}>
										{sort.ascending ? <ArrowUp /> : <ArrowDown />}
									</MuiTooltip>
								</Dropdown.Button> */}
								<MuiTooltip title={`${sortMethod.label} Order`}>
									<div className="btn btn-sm btn-outline-default custom-dropdown d-flex align-items-center h-100"
										onClick={() => setFilterObj(prev => ({ ...prev, sortMethod: sortingMethods[(prev.sortMethod.id + 1) % 3] }))}>
										{sortMethod.value === sortingMethods[0].value && <ClockHistory size={20} />}
										{sortMethod.value === sortingMethods[1].value && <SortAlphaUp size={20} />}
										{sortMethod.value === sortingMethods[2].value && <SortAlphaDown size={20} />}
									</div>
								</MuiTooltip>
							</div>
						</div>
					</div>
				</div>
			</nav>
		);
	} catch (error) {
		console.error(error);
	}
}
