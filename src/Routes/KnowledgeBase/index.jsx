import React, { useCallback, useEffect, useState } from 'react'
import { dispatch } from 'redux/store';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';

import ErrorBoundary from 'Components/ErrorBoundry';
import PageHeader from 'Routes/SuperAdmin/components/PageHeader';
import { Button } from 'react-bootstrap';
import { Link } from '@mui/icons-material';
import { showSuccess } from 'utils/package_config/toast';

export default function KnowledgeBase() {
    const { activeCard } = useSelector((state) => state.issues);

    return (
        <ErrorBoundary>
            <div className="w-100 custom-page-layout p-2 vh-100 limit-scroll overflow-auto">
                <PageHeader title='HCMD Knowledge Based' />
                <div>
                    <KnowledgebaseBreadcrumb activeCard={activeCard} />
                    <Outlet />
                </div>
            </div>
        </ErrorBoundary>
    );
}

const KnowledgebaseBreadcrumb = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [state, setState] = useState(defaultState);
    const { newRequest } = state;
    const { user } = useSelector((state) => state.user);
    const { taskLabels: categories } = useSelector((state) => state.task);
    const { activeCard, issueDetails, assignIssueDetails, subCategory } = useSelector((state) => state.issues);

    // const checkUpdateRequestDetail = useCallback(async (requestId) => {
    //     if (issueDetails && issueDetails.id === requestId) {
    //     }
    //     else {
    //         await toastPromise({
    //             func: async (resolve, reject) => {
    //                 try {
    //                     const { data } = await .post('/issue/info', { id: requestId });
    //                     if (data?.status === 1) {
    //                         if (data.data.category === activeCard.id) {
    //                             dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: data.data, request: true });
    //                         }
    //                     }
    //                     resolve(1);
    //                 } catch (error) {
    //                     reject("Error");
    //                 }
    //             }, loading: "Requesting for Issue", success: <b>Successfully get request</b>, error: <b>Could not get request.</b>,
    //         })
    //     }
    // }, [activeCard?.id, issueDetails]);

    // const checkUpdateAssignedRequestDetail = useCallback(async (requestId) => {
    //     if (assignIssueDetails && assignIssueDetails.id === requestId) {
    //     }
    //     else {
    //         await toastPromise({
    //             func: async (resolve, reject) => {
    //                 try {
    //                     const { data } = await .post('/issue/info', { id: requestId });
    //                     if (data?.status === 1) {
    //                         if (data.data.category === activeCard.id) {
    //                             dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: data.data, request: false });
    //                         }
    //                     }
    //                     resolve();
    //                 } catch (error) {
    //                     reject("Error");
    //                 }
    //             }, loading: "Requesting for Issue", success: <b>Successfully get request</b>, error: <b>Could not get request.</b>,
    //         })
    //     }
    // }, [activeCard?.id, assignIssueDetails]);

    useEffect(() => {
        const { category = "", request = "", assignedRequest = "" } = extractKeysAndValues(location.pathname);
        const isNewRequest = location.pathname.includes('new-request');
        setState(prev => ({
            ...prev,
            categoryId: category ? Number(category) : null,
            requestId: request ? Number(request) : null,
            newRequest: isNewRequest,
        }));
        if (!category && !request && !assignedRequest) {
            dispatch({ type: ISSUE_CONST.SET_ISSUE_CARD_ITEM, payload: null });
            dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: null });
            dispatch({ type: ISSUE_CONST.RES_GET_ASSIGNED_REQUEST_DETAILS, payload: null });
            dispatch({ type: ISSUE_CONST.RES_SET_SUB_CATEGORY, payload: null });
        }
        // if (location.pathname.includes("request")) {
        //     checkUpdateRequestDetail(Number(request));
        // }
        // else if (location.pathname.includes("assignedRequest")) {
        //     checkUpdateAssignedRequestDetail(Number(assignedRequest));
        // }
    }, [location.pathname, navigate]);

    useEffect(() => () => {
        dispatch({ type: ISSUE_CONST.CLEAR_ISSUE_STATE, payload: [] });
    }, []);

    useEffect(() => {
        if (state.categoryId) {
            const newActivedata = categories.find(item => item.id === Number(state.categoryId));
            dispatch({ type: ISSUE_CONST.SET_ISSUE_CARD_ITEM, payload: newActivedata });
        }
    }, [state?.categoryId, categories]);

    const onCategory = useCallback(() => {
        navigate('/knowledge/home');
        dispatch({ type: ISSUE_CONST.SET_ISSUE_CARD_ITEM, payload: null });
        dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: null });
        dispatch({ type: ISSUE_CONST.RES_GET_ASSIGNED_REQUEST_DETAILS, payload: null });
        dispatch({ type: ISSUE_CONST.RES_SET_SUB_CATEGORY, payload: null });
    }, [navigate]);

    const onActivecard = useCallback(() => {
        navigate('/knowledge/category/' + activeCard.id);
        dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: null });
        dispatch({ type: ISSUE_CONST.RES_GET_ASSIGNED_REQUEST_DETAILS, payload: null });
        dispatch({ type: ISSUE_CONST.RES_SET_SUB_CATEGORY, payload: null });
    }, [activeCard?.id, navigate]);

    return (
        <div className="d-flex flex-wrap issues-category-cards mb-2 justify-content-between">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb p-1 my-1 transparent-bg">
                    <li className="breadcrumb-item" onClick={onCategory}>
                        <h5>{`Categories`}</h5>
                    </li>
                    {activeCard &&
                        <li className="breadcrumb-item" onClick={onActivecard}>
                            <h5>{activeCard.name}</h5>
                        </li>}
                    {subCategory &&
                        <li className="breadcrumb-item">
                            <h5>{subCategory.name}</h5>
                        </li>}
                    {newRequest &&
                        <li className="breadcrumb-item">
                            <h5>{'New Request'}</h5>
                        </li>}
                    {issueDetails &&
                        <li className="breadcrumb-item">
                            <h5 className='text-info'>{`#${issueDetails.id} ${!issueDetails.subcategory ? `(Created)` : ''}`}</h5>
                        </li>}
                    {assignIssueDetails &&
                        <li className="breadcrumb-item">
                            <h5 className='text-info'>
                                {`#${assignIssueDetails.id} (Assigned)`}
                            </h5>
                            {!assignIssueDetails?.issuesAssignedUsers?.find(i => i.userId = user.id)?.isRead &&
                                <span className='new_issue_badge mx-1 align-items-center'>new</span>}
                        </li>}
                </ol>
            </nav>
            <div className='d-flex align-items-center'>
                {activeCard &&
                    <Button className='gap-5' size='sm' variant='secondary' onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showSuccess("Link coppied to clipboard.", { id: "copied" })
                    }}>
                        <Link />
                        Copy link
                    </Button>}
            </div>
        </div>
    )
}

const defaultState = {
    categoryId: null,
    requestId: null,
    newRequest: false
}
export const extractKeysAndValues = (inputString) => {
    const parts = inputString.split('/');
    const result = {};
    for (let i = 0; i < parts.length; i += 2)
        if (parts[i] && parts[i + 1])
            result[parts[i]] = parts[i + 1];
    return result;
}