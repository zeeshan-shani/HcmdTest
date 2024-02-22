import React, { useEffect } from 'react'
import { dispatch } from 'redux/store';
import { useSelector } from 'react-redux';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';

import CategoryInfo from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/CategoryInfo';
import MyRequests from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/MyRequests';
import AssignedRequest from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/AssignedRequest';

export default function CategoryDetails() {
    const { taskLabels: categories } = useSelector((state) => state.task);
    const { activeCard } = useSelector((state) => state.issues);

    useEffect(() => () => {
        dispatch({ type: ISSUE_CONST.RES_LIST_ISSUES_CATEGORY, payload: [] });
        dispatch({ type: ISSUE_CONST.RES_ASSIGNED_ISSUE, payload: [] });
    }, []);

    const newRequestCount = activeCard?.issuesAssignedUsers?.length || null;

    try {
        return (
            <div className='my-2 p-0'>
                <div className="tab-section">
                    <nav className='dashboard-nav'>
                        <div className="nav nav-tabs" id="nav-tab" role="tablist">
                            <button className="nav-link active" id="nav-info-tab" data-bs-toggle="tab" data-bs-target="#nav-info" type="button" role="tab" aria-controls="nav-info" aria-selected="true">
                                <span className='fs-14'>{activeCard.name}</span>
                            </button>
                            <button className="nav-link" id="nav-my-issue-tab" data-bs-toggle="tab" data-bs-target="#nav-chats" type="button" role="tab" aria-controls="nav-my-issue" aria-selected="true">
                                <span className='fs-14'>My Questions</span>
                            </button>
                            <button className="nav-link" id="nav-cc-issue-tab" data-bs-toggle="tab" data-bs-target="#nav-cc-issue" type="button" role="tab" aria-controls="nav-cc-issue" aria-selected="false">
                                <span className='fs-14'>
                                    Pending Answers
                                    {newRequestCount &&
                                        <span className='new_issue_badge mx-1 align-items-center'>
                                            {newRequestCount}
                                        </span>}
                                </span>
                            </button>
                        </div>
                    </nav>
                    <div className="tab-content p-2" id="nav-tabContent">
                        <div className="tab-pane fade show active" id="nav-info" role="tabpanel" aria-labelledby="nav-info-tab">
                            <CategoryInfo
                                categories={categories}
                                activeCard={activeCard} />
                        </div>
                        <div className="tab-pane fade show" id="nav-chats" role="tabpanel" aria-labelledby="nav-my-issue-tab">
                            <MyRequests
                                categories={categories}
                                activeCard={activeCard} />
                        </div>
                        <div className="tab-pane fade" id="nav-cc-issue" role="tabpanel" aria-labelledby="nav-cc-issue-tab">
                            <AssignedRequest activeCard={activeCard} />
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error(error);
    }
}
