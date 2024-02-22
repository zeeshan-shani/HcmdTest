import { useState } from "react";
import classes from "Routes/TaskBoard/TaskDetails/TaskDetails.module.css";
import moment from 'moment-timezone';
import { SocketEmiter } from "utils/wssConnection/Socket";
import { CONST, SOCKET } from "utils/constants";
import { format_all, getDateLabel, getImageURL } from "redux/common";
import { Mention, MentionsInput } from "react-mentions";
import { menuStyle } from "Routes/Chat/Main/UserChat/footer/css/defaultStyle";
import { ReplyComments } from "./RelpyComment/ReplyComments";

export const TaskCommentDetail = ({ taskDetails, comment, setReplyCmmt, isTemplate = false }) => {
    const [isEdit, setEdit] = useState(false);
    const [replyShow, setReplyShow] = useState(false);
    const [cmmtText, setCmmtText] = useState();
    const [commentRecipients] = comment?.commentRecipients;

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
            isSubTask: false
        });
    }
    const onReply = () => {
        setReplyCmmt(comment);
    }
    const onSave = (e) => {
        e?.preventDefault();
        setEdit(false);
        SocketEmiter(SOCKET.REQUEST.UPDATE_TASK_COMMENT, { id: comment.id, text: cmmtText?.newPlainTextValue })
    }
    const onCancel = () => { setEdit(false); }
    const usersData = taskDetails?.taskmembers?.map((item) => ({ id: item.userId, display: `${item.user.name}` }));
    const commentChangeHandler = (event, newValue, newPlainTextValue, mentions) => {
        setCmmtText({ newValue, newPlainTextValue, mentions });
    }

    return (<>
        <div className={`${classes["comment-media"]} d-flex flex-row border-0 m-1 p-1`} key={comment.id}>
            <div className={`${classes.member} mx-1`}>
                <img src={getImageURL(comment.user?.profilePicture, '50x50')} alt="people" />
            </div>
            <div className="w-100">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex">
                        <h6 className="text-capitalize mb-0 mx-1 align-items-center d-flex">
                            {comment?.user?.name}
                        </h6>
                        <small className="align-items-center d-flex">
                            {`${getDateLabel(comment?.updatedAt)} ${(moment(comment?.updatedAt).format("hh:mm A"))}`}
                        </small>
                        {commentRecipients && commentRecipients.isRead === false &&
                            <span className="new_cmmt_badge text-white mx-1">new</span>}
                        {commentRecipients && commentRecipients.isMention &&
                            <span className="cmmt-mention text-white mx-1">@</span>}
                    </div>
                    {!isEdit &&
                        <div className="dropdown">
                            <button className="btn nav-link text-muted p-0" id="dropdownCmt" data-bs-toggle="dropdown">
                                <svg className="hw-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                            <ul className="dropdown-menu m-0 py-1" aria-labelledby="dropdownCmt">
                                <li className="dropdown-item p-4_8" onClick={onEdit}>Edit</li>
                                <li className="dropdown-item p-4_8" onClick={onDelete}>Delete</li>
                            </ul>
                        </div>}
                </div>
                {isEdit ? <>
                    <MentionsInput
                        id="cmmtInput"
                        name="comment"
                        autoComplete="off"
                        placeholder="Enter Comment"
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
                        allowSuggestionsAboveCursor={true}
                        className={`mentions__cmmt ${classes["add-card-input"]}`}
                        autoFocus
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
                    <button className="btn btn-primary btn-sm mr-1 mt-1"
                        type="submit"
                        disabled={cmmtText?.newPlainTextValue === comment?.text}
                    >
                        Save
                    </button>
                    <button
                        className="btn btn-secondary btn-sm mt-1"
                        type="button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </> :
                    <div className={`${classes["comment-box"]} border-0`}>
                        <p className="mb-0 mx-1" dangerouslySetInnerHTML={{ __html: format_all(comment?.text) }}>
                        </p>
                        {comment?.isEdited && <span><small>{` (edited)`}</small></span>}
                    </div>}
                <div className="comment_options mx-1">
                    <span className="reply_opt" onClick={onReply}>Reply</span>
                    {comment.replyComment && !!comment.replyComment?.length &&
                        <span className="reply_opt ml-1" onClick={() => setReplyShow(!replyShow)}>
                            {`view ${comment.replyComment.length} comments`}
                        </span>}
                </div>
                {replyShow &&
                    <ReplyComments
                        taskDetails={taskDetails}
                        mainComment={comment}
                        setReplyCmmt={setReplyCmmt}
                        comments={comment.replyComment} />}
            </div>
        </div>
    </>)
}
