import { MuiTooltip } from 'Components/components';
import React from 'react'
import { getBackgroundColorClass } from 'redux/common';

export const TaskSendButton = (props) => {
    const onClick = () => {
        if (!props.disabled)
            props.sendTaskHandler(props.taskType, props.taskDueDate);
    }

    return (<>
        <MuiTooltip title={`${props.assignMembers && !!props.assignMembers.length ? 'Send Task' : 'Please assign members to send a task'}`}>
            <div
                className={`btn btn-icon send-icon rounded-circle text-light send-btn-hover ${getBackgroundColorClass(props.taskType)} ${props.disabled ? 'disabled' : ''}`}
                id="#taskButton"
                onClick={onClick}
            >
                {props.disabled ? (
                    <div className="spinner-border text-light" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                )}
            </div>
        </MuiTooltip>
    </>
    )
}