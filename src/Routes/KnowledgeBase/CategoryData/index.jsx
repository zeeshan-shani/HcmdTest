import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ReactComponent as Loader } from "assets/media/messageLoader.svg";
import { extractKeysAndValues } from '..';
import { dispatch } from 'redux/store';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';
import knowledgebaseService from 'services/APIs/services/knowledgebaseService';
import { listenKBEvents } from 'utils/wssConnection/Listeners/IssuesListeners';
import { SOCKET } from 'utils/constants';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import KBCategoryService from 'services/APIs/services/KBCategoryService';
import { generatePayload } from 'redux/common';

export default function CategoryData() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const { taskLabels: categories, loadingTasklabel } = useSelector((state) => state.task);
    const { activeCard } = useSelector((state) => state.issues);
    const [isCategoryAvailable, setIsCategoryAvailable] = useState(false);

    // Listen socket events on mount
    useMount(listenKBEvents);

    useEffect(() => {
        (async () => {
            const { category = "", request = "", assignedRequest = "" } = extractKeysAndValues(location.pathname);
            const categoryId = category ? Number(category) : null;
            const requestId = request || assignedRequest || null;
            if (categoryId && !!categories.length) {
                const isAvailable = categories.findIndex(i => i?.id === categoryId) !== -1;
                const payload = await generatePayload({
                    rest: { id: categoryId },
                    options: { populate: [{ "method": ["issueAssignedUsers", user.id] }] },
                    findOne: true
                })
                const category = await KBCategoryService.list({ payload });
                dispatch({ type: ISSUE_CONST.UPDATE_ACTIVE_CARD, payload: category.data });
                // dispatch({ type: TASK_CONST.UPDATE_TASK_LABEL, payload: category.data });
                if (isAvailable) {
                    setIsCategoryAvailable(true);
                    if (Number(requestId)) {
                        const payload = {
                            id: Number(requestId),
                            verifyAssigned: Boolean(assignedRequest)
                        }
                        const data = await knowledgebaseService.requestData({ payload });
                        payload.verifyAssigned &&
                            SocketEmiter(SOCKET.REQUEST.READ_ASSIGNED_ISSUE, { issueId: requestId });
                        if (data?.status === 1) {
                            if (data.data.category === categoryId) {
                                dispatch({
                                    type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: data.data,
                                    request: request ? true : Boolean(!assignedRequest)
                                });
                            } else
                                navigate('/knowledge/category/' + categoryId);
                        } else if (data?.status === 2)
                            navigate('/knowledge/category/' + categoryId);
                    }
                }
                else navigate('/knowledge/home');
            }
        })();
    }, [location.pathname, categories, user.id, navigate]);

    return (
        <div>
            {!activeCard && loadingTasklabel &&
                <div className='text-center'>
                    <Loader height={"80px"} />
                    <p>Fetching Category data</p>
                </div>}
            {(activeCard && isCategoryAvailable && <Outlet />)}
        </div>
    )
}
