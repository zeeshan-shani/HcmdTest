import React, { useCallback } from 'react'
import { generatePayload } from 'redux/common';
import messageService from 'services/APIs/services/messageService';
import ThreadContainer from './ThreadContainer';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { Virtuoso } from 'react-virtuoso';
import { useMount } from 'react-use';
import { useSelector } from 'react-redux';

export default function Body({ state, setState }) {
    const { user } = useSelector(state => state.user);
    const { threadList } = state;

    const getThreadList = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        const payload = await generatePayload({
            // rest: { replies: true },
            options: {
                limit: 10,
                pagination: true,
                offset: threadList.length,
                sort: [["createdAt", "DESC"]],
                populate: [
                    { "method": ["threadMessage", user.id] },
                    "sendByDetail",
                    "userChat"
                ],
            },
            isCount: true
        });
        const data = await messageService.list({ payload });
        if (data?.status === 1)
            setState(prev => ({
                ...prev,
                isLoading: false,
                threadList: data?.data?.rows ? prev.threadList.concat(data.data.rows) : prev.threadList,
                hasMore: data?.data?.count > threadList.length
            }));
    }, [threadList.length, setState, user.id]);


    const onNextLoad = useCallback(async () => {
        await getThreadList();
    }, [getThreadList]);

    useMount(() => {
        onNextLoad();
    }, [onNextLoad]);

    return (<>
        <div className="note-container h-100 p-0">
            {!state.threadList.length && <p className='text-center'>No Thread Available</p>}
            <Virtuoso
                // style={{ height: '100%' }}
                // className='overflow-auto'
                data={state.threadList || []}
                endReached={() => state.hasMore && onNextLoad()}
                overscan={200}
                atBottomThreshold={0}
                itemContent={(index, item) => (
                    <ThreadContainer
                        key={item.id}
                        thread={item}
                    />
                )}
                components={{ Footer: () => <>{(state.isLoading) && <Loader height={"80px"} />}</> }}
            />
        </div>
    </>
    )
}
