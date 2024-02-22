import React, { useCallback } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { getProfileStatus } from "redux/common";
import { TASK_STATUS } from 'Routes/TaskBoard/config';
import classes from "Routes/TaskBoard/TasksPage.module.css";

import { ReactComponent as TaskStarted } from "assets/media/heroicons/task-started.svg";
import { ReactComponent as TaskPaused } from "assets/media/heroicons/task-paused.svg";
import { ReactComponent as TaskPending } from "assets/media/heroicons/task-pending.svg";
import { ReactComponent as TaskCompleted } from "assets/media/heroicons/task-completed.svg";
import { ThreeDots } from 'react-bootstrap-icons';
import { MuiTooltip, NotificationBadge } from 'Components/components';
import { getImageURL } from 'redux/common';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { dispatch } from 'redux/store';
import { CONST } from 'utils/constants';
import { getPrivateChatUser } from 'services/helper';

export const Board = ({
    board,
    gotoBoard,
    gotoChat,
    unique,
    chatType }) => {
    const { user } = useSelector((state) => state.user);

    const ClickMenuHandler = e => e.stopPropagation();

    const onClickTask = useCallback((id) => {
        dispatch({ type: TASK_CONST.SET_TASK_FILTER_DATA, payload: { status: TASK_STATUS[id].value } });
        gotoBoard(board);
    }, [board, gotoBoard]);

    const viewChatHandler = useCallback((e) => {
        e.stopPropagation();
        gotoChat(board);
    }, [board, gotoChat]);

    const viewTaskHandler = useCallback((e) => {
        e.stopPropagation();
        gotoBoard(board);
    }, [board, gotoBoard]);

    try {
        let chat = {};
        let myProfile;
        let profileStatus = null;
        if (chatType === CONST.CHAT_TYPE.GROUP) {
            chat.name = board.name;
            chat.profilePicture = board.image;
            myProfile = board.chatusers.find(x => x.userId === user.id);
        } else if (chatType === CONST.CHAT_TYPE.PRIVATE) {
            const { name: username, profilePicture: userPic, profileStatus: pStatus } = getPrivateChatUser(board);
            myProfile = board.chatusers.find(x => x.userId === user.id);
            chat.name = username;
            chat.profilePicture = userPic;
            profileStatus = pStatus;
        }

        let tasksArr = { pending: 0, started: 0, paused: 0, finished: 0 };
        board?.tasks?.map(task => {
            const status = task?.taskStatuses[0]?.status;
            if (status) {
                switch (status) {
                    case "pending": tasksArr.pending++;
                        break;
                    case "started": tasksArr.started++;
                        break;
                    case "paused": tasksArr.paused++;
                        break;
                    case "finished": tasksArr.finished++;
                        break;
                    default:
                }
                return true;
            }
            return false;
        });
        board.totalMessageCount = myProfile?.routineUnreadMessageCount + myProfile?.emergencyUnreadMessageCount + myProfile?.urgentUnreadMessageCount + myProfile?.atTheRateMentionMessageCount + myProfile?.hasMentionMessageCount + myProfile?.hasPatientMentionCount;
        return (
            <div className="col-xxl-2 col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 my-1">
                <div className="whitelight cursor-pointer with-transition roe-box-shadow pos-relative board-grid">
                    <div className="board card">
                        <div className="dropdown more_icon board-more-option ml-auto">
                            <button className="btn-outline-default text-capitalize transparent-button" id={`board-${unique}-${board.id}`} data-bs-toggle="dropdown" onClick={ClickMenuHandler}>
                                <ThreeDots size={20} />
                            </button>
                            <ul className="dropdown-menu m-0" aria-labelledby="chatFilterDropdown">
                                <li className="dropdown-item" onClick={viewChatHandler}>Chat</li>
                                <li className="dropdown-item" onClick={viewTaskHandler}>Task</li>
                            </ul>
                        </div>
                        <div className="text-center" onClick={() => gotoChat(board)} title={`Click to view ${chat.name}'s chat`}>
                            <div className={`avatar ${profileStatus && getProfileStatus(profileStatus)}`}>
                                <img src={getImageURL(chat?.profilePicture, '50x50')} alt="" />
                            </div>
                            <p className="fs-14 font-weight-bold text-capitalize word-break text-truncate">
                                {chat.name}
                            </p>
                        </div>
                        <div className="notification-section mb-1">
                            <div className={`${classes["task-options"]}`}>
                                <div className={`d-flex align-items-center task-card-svg`}>
                                    <p className="mb-0">Tasks:</p>
                                </div>
                                <MuiTooltip title='Click to view pending tasks'>
                                    <div className="d-flex align-items-center task-card-svg"
                                        onClick={() => onClickTask(1)}>
                                        <div className="svg-wrap">
                                            <TaskPending />
                                        </div>
                                        <p className="mb-0">{tasksArr.pending}</p>
                                    </div>
                                </MuiTooltip>
                                <MuiTooltip title='Click to view started tasks'>
                                    <div className="d-flex align-items-center task-card-svg"
                                        onClick={() => onClickTask(2)}>
                                        <div className="svg-wrap">
                                            <TaskStarted />
                                        </div>
                                        <p className="mb-0">{tasksArr.started}</p>
                                    </div>
                                </MuiTooltip>
                                <MuiTooltip title='Click to view paused tasks'>
                                    <div className="d-flex align-items-center task-card-svg"
                                        onClick={() => onClickTask(3)}>
                                        <div className="svg-wrap">
                                            <TaskPaused />
                                        </div>
                                        <p className="mb-0">{tasksArr.paused}</p>
                                    </div>
                                </MuiTooltip>
                                <MuiTooltip title='Click to view finished tasks'>
                                    <div className="d-flex align-items-center task-card-svg"
                                        onClick={() => onClickTask(4)}>
                                        <div className="svg-wrap">
                                            <TaskCompleted />
                                        </div>
                                        <p className="mb-0">{tasksArr.finished}</p>
                                    </div>
                                </MuiTooltip>
                            </div>
                        </div>
                        <MuiTooltip title={`Click to view ${chat.name}'s chat`}>
                            <div className="notification-section" onClick={() => gotoChat(board)}>
                                <div className={`${classes["task-options"]}`}>
                                    <div className={`d-flex align-items-center task-card-svg`}>
                                        <p className="mb-0 mr-1">
                                            Messages:
                                        </p>
                                        {board.totalMessageCount > 0 ?
                                            <NotificationBadge myChatDetails={myProfile} />
                                            : <div className="line-height-18">-</div>}
                                    </div>
                                </div>
                            </div>
                        </MuiTooltip>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error(error);
    }
}