import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { SocketEmiter } from "utils/wssConnection/Socket";
import classes from "Routes/TaskBoard/TaskDetails/TaskDetails.module.css";

import { CONST, SOCKET } from "utils/constants";
import { Mention, MentionsInput } from "react-mentions";
import { menuStyle } from "Routes/Chat/Main/UserChat/footer/css/defaultStyle";
import { ChatDots, CheckCircleFill, PencilFill, TrashFill } from "react-bootstrap-icons";
import { MuiTooltip } from "Components/components";
import ErrorBoundary from "Components/ErrorBoundry";
import { Badge, Button } from "react-bootstrap";
import { MuiActionButton } from "Components/MuiDataGrid";
import { SubTaskComment } from "./SubtaskComment";
import { Avatar, AvatarGroup } from "@mui/material";
import { Dropdown } from "antd";
import { getImageURL, toastPromise } from "redux/common";
import { PersonAdd } from "@mui/icons-material";
import taskService from "services/APIs/services/taskService";
import { dispatch } from "redux/store";
import { TASK_CONST } from "redux/constants/taskConstants";
import moment from "moment-timezone";

export default function SubtaskDetails({
	subtask: subtaskData,
	subtaskStatusToggleHandler,
	onEditSubtask,
	subtaskDeleteHander,
	isTemplate = false
}) {
	const { taskDetails: task, templateTaskDetail } = useSelector((state) => state.task);
	const taskDetails = isTemplate ? templateTaskDetail : task;
	const [subtask, setSubtask] = useState(subtaskData);
	const [viewComment, setViewComment] = useState(false);
	const [addCommentFlag, setAddCommentFlag] = useState(false);
	const [EditSubtaskFlag, setEditSubtaskFlag] = useState(false);
	const [cmmtText, setCmmtText] = useState('');
	const [mentions, setMentions] = useState();

	useEffect(() => {
		setSubtask(subtaskData);
	}, [subtaskData]);

	const addNewComment = useCallback(async (subtask) => {
		if (!cmmtText) return;
		const body = {
			text: cmmtText.trim(),
			subTaskId: subtask.id,
			taskId: taskDetails.id,
			title: subtask.title
		}
		if (mentions && !!mentions.length)
			body.mentions = mentions.map(usr => Number(usr.id));
		SocketEmiter(SOCKET.REQUEST.ADD_TASK_COMMENT, body);
		setCmmtText('');
		setAddCommentFlag(prev => !prev)
	}, [cmmtText, mentions, taskDetails?.id]);

	const isReadArr = useMemo(() =>
		!isTemplate && subtask?.comments.map(cmmt => cmmt?.commentRecipients[0]?.isRead).includes(false), [isTemplate, subtask?.comments]);

	const isMentionArr = useMemo(() =>
		!isTemplate && subtask?.comments.map(cmmt => cmmt?.commentRecipients[0]?.isMention).includes(true), [isTemplate, subtask?.comments]);

	const onClickComment = useCallback(async () => {
		setViewComment(!viewComment);
		isReadArr && SocketEmiter("manage-task-module:req-read-comment", {
			subTaskId: subtask.id,
			commentIds: subtask?.comments.map(cmmt => cmmt.id)
		});
	}, [isReadArr, subtask?.comments, subtask.id, viewComment]);

	const onClickEdit = useCallback(() => {
		setEditSubtaskFlag(EditSubtaskFlag ? null : { subtaskId: subtask.id })
	}, [EditSubtaskFlag, subtask?.id]);

	const onSubmit = useCallback((e) => {
		e?.preventDefault();
		onEditSubtask(subtask.id, EditSubtaskFlag.title)
		setEditSubtaskFlag();
	}, [EditSubtaskFlag?.title, onEditSubtask, subtask?.id]);

	const usersData = useMemo(() =>
		taskDetails?.taskmembers?.map((item) => ({ ...item.user, id: item.userId, key: item.userId, label: item.user.name, display: item.user.name }))
		, [taskDetails?.taskmembers]);

	const commentChangeHandler = useCallback((event, newValue, newPlainTextValue, mentions) => {
		setCmmtText(newPlainTextValue);
		setMentions(mentions);
	}, []);

	const changeSubtaskAssignee = useCallback(async (userId) => {
		await toastPromise({
			func: async (resolve, reject) => {
				try {
					const pName = taskDetails.chatDetails.type === CONST.CHAT_TYPE.PRIVATE &&
						taskDetails.chatDetails.chatusers.find(i => i.userId !== Number(userId))?.user?.name;
					const payload = {
						userId, subtaskId: subtaskData?.id,
						chatName: (taskDetails.chatDetails.type === CONST.CHAT_TYPE.PRIVATE ?
							`${pName}'s Chat` : `${taskDetails.chatDetails.name}`),
						subject: taskDetails?.subject
					};
					const data = await taskService.subtaskMemberCreate({ payload })
					dispatch({
						type: TASK_CONST.UPDATE_SUBTASK_DATA, payload: {
							id: subtaskData.id,
							subtaskMembers: [data.data]
						}
					});
					resolve(1);
				} catch (error) {
					reject(0);
				}
			}
		})
	}, [subtaskData?.id, taskDetails?.chatDetails?.name, taskDetails?.chatDetails?.type, taskDetails?.subject, taskDetails?.chatDetails?.chatusers]);

	const SubTaskUser = useMemo(() => {
		const [member] = subtaskData?.subtaskMembers || [];
		return (
			<Dropdown
				overlayStyle={{ maxHeight: "70vh", overflow: "auto" }}
				trigger={['click']}
				className="hide-scrollbar"
				menu={{
					items: usersData || [],
					selectable: true,
					onClick: ({ key }) => key !== member?.userId && changeSubtaskAssignee(key),
					defaultSelectedKeys: member?.userId ? [member.userId] : [],
				}}>
				<MuiTooltip title={member ? `Assigned to: ${member.user?.name || ''}` : "Assign member"} placement="top">
					<AvatarGroup style={{ maxHeight: "32px" }}>
						{member ?
							<Avatar alt={member.user?.name || ''}
								src={getImageURL(member.user?.profilePicture, '32x32')} /> :
							<MuiActionButton Icon={PersonAdd} size="small" />}
					</AvatarGroup>
				</MuiTooltip>
			</Dropdown>)
	}, [subtaskData, usersData, changeSubtaskAssignee]);

	const isCompleted = subtask?.completedBy;

	return (
		<ErrorBoundary>
			<div className="card mb-2 subtask-details">
				<div className="card-body">
					{!EditSubtaskFlag ?
						<div className={subtask.status === "finished" ? "task-completed" : ""}>
							{subtask.title}
						</div> :
						<form onSubmit={onSubmit}>
							<input
								type="text"
								name="title"
								id="title"
								placeholder="Edit subtask"
								defaultValue={subtask?.title}
								onChange={(e) => setEditSubtaskFlag(prev => ({ ...prev, title: e.target.value }))}
								className={`form-control p-4_8 mb-1`}
							/>
							<div className="gap-10">
								<Button size="sm" onClick={onSubmit}>Save</Button>
								<Button size="sm" variant="light" onClick={setEditSubtaskFlag}>Cancel</Button>
							</div>
						</form>}
					<div className={`${classes["subtask-options"]} justify-content-between`}>
						{SubTaskUser}
						<div className="subtask-badges gap-5 align-items-center">
							{!isTemplate && <>
								{isMentionArr && <span className="unread-mention mr-1"></span>}
								{isReadArr && <span className="unread-comment" />}
								<MuiTooltip title="Toggle Comments">
									<span onClick={onClickComment} className={`position-relative cursor-pointer fs-14`}>
										{subtask.totalComments} comments
									</span>
								</MuiTooltip>
							</>}
							<Badge bg="primary" className="d-flex text-light p-1 mx-1 align-items-center">
								{`#${subtask.id}`}
							</Badge>
							<MuiActionButton
								size="small"
								Icon={PencilFill}
								tooltip="Edit Subtask"
								onClick={onClickEdit}
								className={`${!EditSubtaskFlag ? 'text-primary' : "text-success"}`}
							/>
							{!isTemplate && <>
								<MuiActionButton
									Icon={ChatDots}
									size="small"
									tooltip="Comments"
									onClick={onClickComment}
									className="text-primary"
								/>
								<MuiActionButton
									Icon={CheckCircleFill}
									size="small"
									tooltip={subtask.status === "finished" ? 'Mark as Incomplete' : 'Mark as Complete'}
									onClick={() => subtaskStatusToggleHandler(subtask.id, subtask.status)}
									className={subtask.status === "finished" ? "text-success" : ""}
								/>
							</>}
							<MuiActionButton
								Icon={TrashFill}
								size="small"
								tooltip="Delete"
								onClick={() => subtaskDeleteHander(subtask.id)}
								className="text-danger"
							/>
						</div>
					</div>
					{isCompleted &&
						<div className={`${classes["subtask-options"]} justify-content-end`}>
							<p className="mb-0">Completed by {subtask?.completedByUser?.name} ({moment(subtask?.completedAt).format('MM/DD/YY hh:mm A')})</p>
						</div>}
					{!isTemplate && viewComment && !isTemplate && (subtask.comments && subtask.comments !== undefined) && (
						<div className="comments-wrapper mt-1">
							{!!subtask.comments.length &&
								subtask.comments.map((comment, index) => (
									<SubTaskComment
										key={index}
										taskDetails={taskDetails}
										comment={comment}
										subtask={subtask}
									/>
								))}
							{!addCommentFlag ? (
								<div className={`${classes["add-comment-btn"]} semi-bold-text`}>
									<span onClick={() => setAddCommentFlag(true)}>
										Add Comment
									</span>
								</div>
							) : (
								<div className={classes["add-card-input-block"]}>
									<MentionsInput
										id="cmmtInput"
										name="comment"
										autoComplete="off"
										placeholder="Enter Comment & press @ to tag member"
										type="textarea"
										rows={3}
										style={menuStyle}
										value={cmmtText ? cmmtText : ''}
										onChange={commentChangeHandler}
										onKeyPress={(event) => {
											if (event.key === "Enter" && !event.shiftKey) {
												event.preventDefault();
												addNewComment(subtask);
											}
										}}
										allowSuggestionsAboveCursor={true}
										className={`mentions__cmmt ${classes["add-card-input"]} mb-2`}
									>
										<Mention
											type="user"
											trigger="@"
											markup="<@__id__>(__display__)"
											data={usersData}
											displayTransform={(id, display) => { return `@${display} ` }}
											className="mentions__cmmt text-highlight-blue"
										/>
									</MentionsInput>
									<div className={`${classes.action} gap-10`}>
										<Button size="sm" onClick={() => addNewComment(subtask)}>Add Comment</Button>
										<Button size="sm" variant="light" onClick={() => setAddCommentFlag(false)}>Cancel</Button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</ErrorBoundary>
	);
}