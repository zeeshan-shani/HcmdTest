import React, { useEffect } from 'react'
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { dispatch } from 'redux/store';
import { changeChatBackground } from 'redux/actions/chatAction';
import { useSelector } from 'react-redux';

export default function ChatBackground() {
    const { user } = useSelector(state => state.user);
    const changeBackground = (item) => changeChatBackground({ colorCode: item.colorCode });
    const setDefault = () => changeChatBackground({ colorCode: '323331' });
    const setNone = () => changeChatBackground({ colorCode: 'none' });

    useEffect(() => {
        dispatch({ type: CHAT_CONST.UPDATE_CHAT_BACKGROUND, payload: { colorCode: user?.chatWallpaper } });
        //eslint-disable-next-line
    }, []);

    return (
        <div className="chat-background-setting">
            <div className="todo-title">
                <h6 className="">Chat Wallpaper</h6>
            </div>
            <div className='col p-0'>
                <button className="btn btn-primary btn-sm align-items-center text-left mr-2" onClick={setNone}>
                    Reset Default
                </button>
                <button className="btn btn-secondary btn-sm align-items-center text-left" onClick={setDefault}>
                    Set Default Wallpaper
                </button>
                <div className='solid-colors text-color mt-2'>
                    <div>Solid Colors</div>
                    <div>
                        {chatBackgrounds.map((item) => {
                            return (
                                <div
                                    key={item.id}
                                    className={`bg-color-demo w-${item.class} m-2 br-6 p-1`}
                                    style={{ width: "50px" }}
                                    onClick={() => changeBackground(item)}>
                                </div>
                            )
                        })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export const chatBackgrounds = [
    {
        id: 2,
        color: 'light',
        class: 'bg-chat-light',
        colorCode: 'c6c9c4'
    },
    {
        id: 3,
        color: 'dark',
        class: 'bg-chat-dark',
        colorCode: '323331'
    },
    {
        id: 4,
        color: 'purple',
        class: 'bg-chat-purple',
        colorCode: '46475f'
    },
    {
        id: 5,
        color: 'green',
        class: 'bg-chat-green',
        colorCode: '37483c'
    },
    {
        id: 6,
        color: 'brown',
        class: 'bg-chat-brown',
        colorCode: '585341'
    },
    {
        id: 7,
        color: 'pink',
        class: 'bg-chat-pink',
        colorCode: '584155'
    },
]