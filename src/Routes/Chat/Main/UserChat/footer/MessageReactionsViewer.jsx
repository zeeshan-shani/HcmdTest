import React, { useCallback, useState } from 'react'
import _ from 'lodash';
import { Box, Drawer, List, Tab, Tabs, } from '@mui/material';
import { useSelector } from 'react-redux';
import { getImageURL } from 'redux/common';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { dispatch } from 'redux/store';
import { SocketEmiter } from 'utils/wssConnection/Socket';

export default function MessageReactionsViewer() {
    const { user } = useSelector(state => state.user);
    const { messageReactions, activeChat } = useSelector(state => state.chat);
    const [tab, setTab] = useState("all");

    const list = useCallback((anchor) => {
        const reactionGroups = _.groupBy(messageReactions, (item) => item.emojiCode);
        return (
            <Box
                sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
                role="presentation"
                // onClick={toggleDrawer(anchor, false)}
                onKeyDown={toggleDrawer(anchor, false)}
            >
                {messageReactions && <>
                    <Tabs value={tab} onChange={(e, val) => setTab(val)} aria-label="tabs-reactions">
                        <Tab className='bg-none' value={"all"} label={`All ${messageReactions.length}`} {...a11yProps(0)} />
                        {Object.values(reactionGroups).map((item, index) => (
                            <Tab key={index} className='bg-none' value={item[0].emojiCode} label={`${item[0].emojiCode} ${item.length}`} {...a11yProps(index + 1)} />
                        ))}
                    </Tabs>
                    <List className='p-0'>
                        {!!messageReactions?.length &&
                            messageReactions
                                .filter((item) => tab === "all" || item.emojiCode === tab)
                                .map((item, index) => (
                                    <ReactionMember key={index} item={item} userId={user.id} chatId={activeChat.id} />
                                ))}
                    </List>
                </>}
            </Box>
        )
    }, [activeChat.id, messageReactions, user.id, tab]);

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift'))
            return;
        dispatch({ type: CHAT_CONST.SET_MESSAGE_REACTIONS, payload: null })
    };

    return (<div className=''>
        <Drawer
            anchor="bottom"
            open={Boolean(messageReactions && !!messageReactions?.length)}
            onClose={toggleDrawer("bottom", false)}
        >
            {list("bottom")}
        </Drawer>
    </div>
    )
}


const ReactionMember = ({ item, userId, chatId }) => {
    const userInfo = item.userEmojiInfo;
    const removeItem = () => {
        if (userInfo.id !== userId) return;
        SocketEmiter("req-delete-message-reaction", {
            reactId: item.id,
            messageId: item.messageId,
            chatId: chatId
        });
        dispatch({ type: CHAT_CONST.SET_MESSAGE_REACTIONS, payload: null });
    }
    return (
        <li className="list-group-item d-flex justify-content-between">
            <div className="media align-items-center" onClick={removeItem}>
                <div className="mr-2">
                    <img src={getImageURL(userInfo?.profilePicture, '25x25')} alt="" />
                </div>
                <div className="media-body">
                    <h6 className="text-truncate">
                        <div className="text-reset text-capitalize">{userInfo?.name}</div>
                    </h6>
                    {userInfo?.id === userId && <p className="mb-0">Tap to remove</p>}
                </div>
            </div>
            <div className="media-options ml-1 emoji-font">
                {item.emojiCode}
            </div>
        </li>
    )
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}