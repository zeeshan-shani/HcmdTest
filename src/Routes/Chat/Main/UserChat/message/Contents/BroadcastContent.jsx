import React from 'react'
import { useSelector } from 'react-redux';
import { CONST } from 'utils/constants';

export const BroadcastContent = ({ item }) => {
    const { user } = useSelector(state => state.user);
    const buildLabelText = (item) => {
        let text = '';
        const logs = item.chatLogs
        if (!!logs.length) {
            if (logs.length > 1) {
                if (logs[0]?.type === CONST.MSG_TYPE.CHAT_LOG.USER_ADDED) {
                    text += `${logs[0].addedBy.name} added `
                    const username = [];
                    for (const log of logs)
                        username.push(log.user.name);
                    text += username.join(', ');
                }
            }
            else if (logs.length === 1) {
                const [log] = logs;
                const sender = log.addedBy?.name === user.name ? 'You' : log.addedBy?.name;
                const actionAgainst = log.user?.name === user.name ? 'You' : log.user?.name;
                if (log?.type === CONST.MSG_TYPE.CHAT_LOG.USER_ADDED)
                    text += `${sender} added ${actionAgainst}`
                else if (log?.type === CONST.MSG_TYPE.CHAT_LOG.CHAT_CREATED)
                    text += `${sender} created group`
                else if (log?.type === CONST.MSG_TYPE.CHAT_LOG.USER_REMOVED)
                    text += `${sender} removed ${actionAgainst}`
                else if (log?.type === CONST.MSG_TYPE.CHAT_LOG.USER_LEFT)
                    text += `${actionAgainst} left`
                else if (log?.type === CONST.MSG_TYPE.CHAT_LOG.ADDED_BY_LINK)
                    text += `${actionAgainst} Joined via link created by ${sender}`
            }
        }
        return text;
    }
    const label = buildLabelText(item)
    return (
        <div
            className="message-container message-member-divider my-1 justify-content-center d-flex"
            style={{ fontSize: user?.fontSize - 2 }}
        >
            <span>{label}</span>
        </div>
    )
}
