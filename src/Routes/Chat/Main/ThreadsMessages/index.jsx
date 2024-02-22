import ErrorBoundary from 'Components/ErrorBoundry'
import React, { useEffect, useState } from 'react'
import { CHAT_CONST } from 'redux/constants/chatConstants'
import { dispatch } from 'redux/store'
import Body from './Body'
import Header from './Header'

export default function ThreadsMessages() {
    const [state, setState] = useState({
        threadList: [],
        isLoading: false,
        hasMore: false
    })

    useEffect(() => {
        dispatch({ type: CHAT_CONST.DELETE_ACTIVE_CHAT })
    }, []);

    return (
        <div className="chats">
            <div className="chat-body">
                <ErrorBoundary>
                    <Header />
                    <Body
                        state={state}
                        setState={setState}
                    />
                </ErrorBoundary>
            </div>
        </div>
    )
}
