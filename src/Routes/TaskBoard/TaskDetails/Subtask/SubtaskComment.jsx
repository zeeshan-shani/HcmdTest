import { useState } from "react";
import { CONST, SOCKET } from "utils/constants";
import { SocketEmiter } from "utils/wssConnection/Socket";
import { format_all, getDateLabel, getImageURL } from "redux/common";
import moment from 'moment-timezone';
import classes from "Routes/TaskBoard/TaskDetails/TaskDetails.module.css";
import { Mention, MentionsInput } from "react-mentions";
import { menuStyle } from "Routes/Chat/Main/UserChat/footer/css/defaultStyle";
import ErrorBoundary from "Components/ErrorBoundry";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import { Button } from "react-bootstrap";

export const SubTaskComment = ({ taskDetails, comment, subtask }) => {
    const [isEdit, setEdit] = useState(false);
    const [cmmtText, setCmmtText] = useState();
    const [recipients] = comment?.commentRecipients;

    const onEdit = () => {
        setEdit(true);
        setCmmtText({
            newPlainTextValue: comment?.text,
            newValue: String(comment?.text).replace(CONST.REGEX.MENTION_USER, "<@9>($1)")
        });
    }
    const onDelete = () => {
        SocketEmiter(SOCKET.REQUEST.DELETE_TASK_COMMENT, {
            commentId: comment.id,
            isSubTask: true,
            subtaskId: subtask.id
        });
    }
    const onSave = () => {
        setEdit(false);
        SocketEmiter(SOCKET.REQUEST.UPDATE_TASK_COMMENT, { id: comment.id, text: cmmtText?.newPlainTextValue })
    }
    const onCancel = () => {
        setEdit(false);
    }
    const usersData = taskDetails?.taskmembers?.map((item) => ({ id: item.userId, display: `${item.user.name}` }));
    const commentChangeHandler = (event, newValue, newPlainTextValue, mentions) => {
        setCmmtText({ newValue, newPlainTextValue, mentions });
    }

    return (
        <ErrorBoundary>
            <div className={`${classes["comment-media"]} d-flex flex-row border-0 m-1 p-1`} key={comment.id}>
                <div className={`${classes.member} mx-1 d-flex align-items-center`}>
                    <img src={getImageURL(comment.user?.profilePicture, '50x50')} alt="" />
                </div>
                <div className="w-100">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex">
                            <h6 className="text-capitalize mb-0 mx-1">
                                {comment?.user?.name}
                            </h6>
                            <small>
                                {`${getDateLabel(comment?.createdAt)} ${(moment(comment?.createdAt).format("hh:mm A"))}`}
                            </small>
                            {recipients && (recipients.isMention ?
                                <span className="cmmt-mention text-white mx-1">@</span> :
                                (!recipients.isRead && <span className="new_issue_badge text-white mx-1">new</span>))}
                        </div>
                        {!isEdit &&
                            <div className="dropdown">
                                <button className="btn nav-link text-muted p-0" id="dropdownCmt" data-bs-toggle="dropdown">
                                    <ThreeDotsVertical />
                                </button>
                                <ul className="dropdown-menu m-0 py-1" aria-labelledby="dropdownCmt">
                                    <li className="dropdown-item p-4_8" onClick={onEdit}>Edit</li>
                                    <li className="dropdown-item p-4_8" onClick={onDelete}>Delete</li>
                                </ul>
                            </div>}
                    </div>
                    {isEdit ? <>
                        <form onSubmit={onSave}>
                            <MentionsInput
                                id="cmmtInput"
                                name="comment"
                                autoComplete="off"
                                placeholder="Enter Comment & press @ to tag member"
                                type="textarea"
                                style={menuStyle}
                                value={cmmtText?.newValue ? cmmtText?.newValue : ''}
                                onChange={commentChangeHandler}
                                onKeyPress={(event) => {
                                    if (event.key === "Enter" && !event.shiftKey) {
                                        event.preventDefault();
                                        onSave();
                                    }
                                }}
                                autoFocus={true}
                                allowSuggestionsAboveCursor={true}
                                className={`mentions__cmmt_edit ${classes["add-card-input"]} mb-2`}
                            >
                                <Mention
                                    type="user"
                                    trigger="@"
                                    markup="<@__id__>(__display__)"
                                    data={usersData}
                                    displayTransform={(id, display) => { return `@${display} ` }}
                                    className="mentions__cmmt_edit text-highlight-blue"
                                />
                            </MentionsInput>
                            <div className="gap-5">
                                <Button size="sm" type="submit"
                                    disabled={cmmtText?.newPlainTextValue === comment?.text}>
                                    Save
                                </Button>
                                <Button size="sm" variant="light" onClick={onCancel}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </> :
                        <div className={`${classes["comment-box"]} border-0`}>
                            <p className="mb-0">
                                <span className="mx-1" dangerouslySetInnerHTML={{ __html: format_all(comment?.text) }}></span>
                                {comment?.isEdited && <span><small>{` (edited)`}</small></span>}
                            </p>
                        </div>}
                </div>
            </div>
        </ErrorBoundary>
    )
}
