import React, { useEffect, useState } from 'react'
import { Mention, MentionsInput } from 'react-mentions';
import { ClipboardMinus } from 'react-bootstrap-icons';
import { TaskCommentDetail } from './TaskCommentDetail';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { SOCKET } from 'utils/constants';
import classes from "Routes/TaskBoard/TaskDetails/TaskDetails.module.css";
import { menuStyle } from 'Routes/Chat/Main/UserChat/footer/css/defaultStyle';
import { Button } from 'react-bootstrap';

export const TaskComments = ({ taskDetails }) => {
    const [addCommentsFlag, setAddComments] = useState();
    const [cmmtText, setCmmtText] = useState('');
    const [replyCmmt, setReplyCmmt] = useState();

    useEffect(() => {
        if (replyCmmt) {
            setAddComments(true);
            setCmmtText({ newValue: `<@${replyCmmt.userId}>(${replyCmmt.user.name})` });
        }
    }, [replyCmmt]);

    try {
        const usersData = taskDetails?.taskmembers?.map((item) => ({ id: item.userId, display: item.user ? `${item.user.name}` : "-" }));
        const isReadArr = taskDetails?.comments?.map(cmmt => {
            return cmmt?.commentRecipients[0]?.isRead;
        }).includes(false);
        const isMentionArr = taskDetails?.comments?.map(cmmt => {
            return cmmt?.commentRecipients[0]?.isMention;
        }).includes(true);
        const addNewComment = async (e) => {
            e?.preventDefault();
            // add new comment
            if (!cmmtText?.newPlainTextValue) return;
            let body = {
                text: cmmtText?.newPlainTextValue?.trim(),
                taskId: taskDetails.id,
                replyCommentId: replyCmmt ? replyCmmt.id : undefined
            }
            if (cmmtText?.mentions && !!cmmtText.mentions.length)
                body.mentions = cmmtText.mentions.map(usr => Number(usr.id));
            SocketEmiter(SOCKET.REQUEST.ADD_TASK_COMMENT, body);
            onCancelAdd();
        }
        const onCancelAdd = () => {
            setAddComments(false);
            setReplyCmmt();
            setCmmtText();
        }
        const commentChangeHandler = (event, newValue, newPlainTextValue, mentions) => {
            setCmmtText({ newValue, newPlainTextValue, mentions });
        }
        const searchComments = taskDetails?.comments;
        if (searchComments)
            return (<>
                <div className={`card-body px-2`}>
                    <div className={`${classes["subtask-block-header"]}`}>
                        <h6 className={`${classes["subtask-title"]} card-title mb-1`}>
                            Comments
                            ({taskDetails?.comments.length})
                        </h6>
                        <div className='d-flex'>
                            {isMentionArr && <span className="unread-mention mr-1" />}
                            {isReadArr && <span className="unread-comment" />}
                        </div>
                    </div>

                    {searchComments &&
                        <div className={`${classes["subtasks-wrapper"]} card-text`}>
                            <div className="comments-wrapper task-comments-wrapper py-1">
                                {!!searchComments.length &&
                                    searchComments
                                        .map((comment, index) => (
                                            <TaskCommentDetail
                                                key={index}
                                                taskDetails={taskDetails}
                                                setReplyCmmt={setReplyCmmt}
                                                comment={comment} />)
                                        )}
                                {!searchComments.length && (
                                    <div className="text-center">
                                        <ClipboardMinus />
                                        <span className='ml-1'>
                                            There are No comment added
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>}
                    {!addCommentsFlag ? (
                        <div className={`${classes["add-comment-btn"]} semi-bold-text mt-1`}>
                            <span onClick={() => setAddComments(true)}>Add Comment</span>
                        </div>
                    ) : (
                        <div className={`${classes["add-card-input-block"]} w-100`}>
                            {replyCmmt &&
                                <div className='cmmt_input_reply_mention text-truncate line-clamp line-clamp-3'>
                                    <p className='mb-0'>
                                        Replying to
                                        <span className='text-highlight-blue mx-1'>{`@${replyCmmt.user.name}`}</span>
                                        <span>{`about "${replyCmmt.text}"`}</span>
                                    </p>
                                </div>}
                            <MentionsInput
                                id="cmmtInput"
                                name="comment"
                                autoComplete="off"
                                placeholder="Enter Comment & press @ to tag member"
                                type="textarea"
                                rows={2}
                                style={menuStyle}
                                value={cmmtText?.newValue ? cmmtText.newValue : ""}
                                onChange={commentChangeHandler}
                                onKeyPress={(event) => {
                                    if (event.key === "Enter" && !event.shiftKey) {
                                        event.preventDefault();
                                        addNewComment();
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
                            <div className={`${classes.action} mt-2`}>
                                <Button size='sm' onClick={addNewComment}>
                                    Add Comment
                                </Button>
                                <Button size='sm' variant='light' onClick={onCancelAdd}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </>
            )
    } catch (error) {
        console.error(error);
    }
}
