import React, { useState, useEffect, useMemo, useCallback } from 'react'
import useDebounce from 'services/hooks/useDebounce';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { CONST } from 'utils/constants';
import { ListenNewRequest } from 'utils/wssConnection/Listeners/IssuesListeners';
import { getIssueList } from 'redux/actions/IssuesAction';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { format_all } from 'redux/common';
import moment from 'moment-timezone';
import { useNavigate } from 'react-router-dom';

export default function AssignedRequest() {
    const navigate = useNavigate();
    const { AssignedIssue, activeCard } = useSelector((state) => state.issues);
    const [filters, setFilters] = useState({ search: null, status: null });
    // const [loading, setLoading] = useState(false);
    const newSearch = useDebounce(filters, 500);

    useEffect(() => {
        let body = { category: activeCard.id };
        if (newSearch?.search) body.search = newSearch.search;
        if (newSearch?.status) body.status = newSearch.status;
        body.assignedIssue = true;
        (async () => {
            if (activeCard.id) await getIssueList(activeCard.id, body);
        })();
        ListenNewRequest(activeCard.id, body);
    }, [activeCard?.id, newSearch]);

    const clickOnRequest = useCallback(async (issue) => {
        navigate('assignedRequest/' + issue.id);
        // await toastPromise({
        //     func: async (myResolve, myReject) => {
        //         try {
        //             setLoading(true);
        //             const data = await knowledgebaseService.requestData({ payload: { id: issue.id } });
        //             if (data?.status === 1) {
        //                 if (data.data.category === activeCard.id) {
        //                     navigate('assignedRequest/' + issue.id);
        //                     dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: data.data, request: false });
        //                 }
        //             }
        //             if (data?.status === 1)
        //                 setLoading(false);
        //             myResolve(data);
        //         } catch (error) {
        //             setLoading(false);
        //             myReject("Error");
        //         }
        //     },
        //     loading: "Requesting for Issue",
        //     success: <b>Successfully get request</b>,
        //     error: <b>Could not get request.</b>,
        //     options: { id: "get-request" }
        // })
        // dispatch({ type: ISSUE_CONST.RES_GET_ASSIGNED_REQUEST_DETAILS, payload: issue });
    }, [navigate]);

    const columns = useMemo(() => [
        {
            field: "subject", headerName: "Subject", minWidth: 180, flex: 1,
            renderCell: ({ row }) => {
                const [userInfo] = row?.issuesAssignedUsers;
                const format_subject = row?.subject && format_all(row?.subject);
                return (
                    <nobr>
                        {!userInfo.isRead &&
                            <span className='new_issue_badge mx-1 align-items-center'>new</span>}
                        <span dangerouslySetInnerHTML={{ __html: format_subject }}></span>
                    </nobr>
                )
            }
        },
        {
            field: "created", headerName: "Created", minWidth: 180,
            renderCell: ({ row }) => (<>{moment(row.createdAt).format("MM/DD/YY")}</>),
        },
        {
            field: "updated", headerName: "Last Activity", minWidth: 180, flex: 1,
            renderCell: ({ row }) => (<>{moment(row.updatedAt).fromNow()}</>)
        },
        {
            field: "status", headerName: "Status", minWidth: 180,
            renderCell: ({ row }) => (
                <nobr className='text-capitalize'>
                    {row?.status}
                </nobr>)
        }
    ], []);

    return (<>
        <div className="form-inline mb-2">
            <div className="d-flex">
                <div className="dropdown">
                    <button
                        className="btn btn-outline-default mr-1 dropdown-toggle text-capitalize custom-dropdown"
                        id="statusDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        type="button"
                    >
                        <span>status: {filters.status ? filters.status : 'All'}</span>
                    </button>
                    <ul className="dropdown-menu m-0" aria-labelledby="statusDropdown">
                        <li className={`dropdown-item cursor-pointer text-capitalize`} onClick={() => setFilters(prev => ({ ...prev, status: null }))}>
                            {'All'}
                        </li>
                        {CONST.ISSUE_STATUS.map((item) =>
                        (<li key={item.id} className={`dropdown-item cursor-pointer text-capitalize`} onClick={() => setFilters(prev => ({ ...prev, status: item.value }))}>
                            {item.value}
                        </li>))}
                    </ul>
                </div>
                <div className="input-group admin-search m-0 mr-1">
                    <input type="text" className="form-control search p-4_8"
                        placeholder="Search Request"
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>
            </div>
        </div>
        {/* {loading &&
            <div className="loader">
                <Loader className='login_loader' />
            </div>} */}
        <div className={`cstm-mui-datagrid ${!AssignedIssue?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGrow: 1 }}>
            <DataGridPro
                rows={!!AssignedIssue?.length ? AssignedIssue : []}
                columns={columns}
                autoHeight
                disableColumnFilter
                disableVirtualization
                onRowClick={({ row }) => clickOnRequest(row)}
                // sortModel={state.sortModel}
                // onSortModelChange={onSortModelChange}
                components={{
                    // LoadingOverlay: LinearProgress,
                    // Footer: () =>
                    //   <MuiDataGridFooter isFetching={isFetching}
                    //     lastUpdated={AssignedIssue?.lastUpdated}
                    //     pagination={{ page: state?.page, total: AssignedIssue?.count || 0, pageSize: state?.pageSize }}
                    //     onPageChange={(e, page) => {
                    //       updateState(setState, { page: page });
                    //     }}
                    //   />
                }}
            />
        </div>
    </>);
}
