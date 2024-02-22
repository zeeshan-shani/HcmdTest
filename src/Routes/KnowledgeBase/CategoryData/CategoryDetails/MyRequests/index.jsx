import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useDebounce from 'services/hooks/useDebounce';
import { CONST, SOCKET } from 'utils/constants';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { getIssueList } from 'redux/actions/IssuesAction';

import { Button } from 'react-bootstrap';
import { DataGridPro } from '@mui/x-data-grid-pro';
import moment from 'moment-timezone';
import { format_all } from 'redux/common';
import { MuiDeleteAction } from 'Components/MuiDataGrid';
import { SocketEmiter, SocketListener } from 'utils/wssConnection/Socket';
import { useNavigate } from 'react-router-dom';

export default function MyRequests() {
    const navigate = useNavigate();
    const { activeCard, issueList } = useSelector((state) => state.issues);
    const [filters, setFilters] = useState({ search: null, status: null });
    const newSearch = useDebounce(filters, 500);

    useEffect(() => {
        let body = {};
        if (newSearch?.search) body.search = newSearch.search;
        if (newSearch?.status) body.status = newSearch.status;
        body.subcategory = false;
        if (activeCard.id) getIssueList(activeCard.id, body);
        SocketListener(SOCKET.RESPONSE.CREATE_ISSUE, async () => {
            if (activeCard.id) getIssueList(activeCard.id, newSearch);
        });
    }, [activeCard.id, newSearch]);

    const getDetails = useCallback(async (issue) => {
        navigate('request/' + issue.id);
        // if (issue.createdBy === user.id) {
        //     await toastPromise({
        //         func: async (myResolve, myReject) => {
        //             try {
        //                 setLoading(true);
        //                 const data = await knowledgebaseService.requestData({ payload: { id: issue.id } });
        //                 if (data?.status === 1) {
        //                     if (data.data.category === activeCard.id) {
        //                         navigate('request/' + issue.id);
        //                         dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: data.data, request: true });
        //                     }
        //                 }
        //                 setLoading(false);
        //                 myResolve(data);
        //             } catch (error) {
        //                 setLoading(false);
        //                 myReject("Error");
        //             }
        //         }, loading: "Requesting for Issue", success: <b>Successfully get request</b>, error: <b>Could not get request.</b>,
        //         options: { id: "get-request" }
        //     })
        //     // dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: issue, request: true });
        // } else {
        //     // dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: issue, request: false });
        // }
    }, [navigate]);

    const deleteRequest = (data) => SocketEmiter(SOCKET.REQUEST.ISSUE_DELETE, { id: data.id });

    const columns = useMemo(() => [
        {
            field: "subject", headerName: "Subject", minWidth: 180, flex: 1,
            renderCell: ({ row }) => {
                const format_subject = row?.subject && format_all(row?.subject);
                return (
                    <nobr>
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
        },
        {
            field: "actions",
            type: "actions",
            minWidth: 180,
            getActions: ({ row }) => [
                // <MuiEditAction />,
                <MuiDeleteAction onClick={() => deleteRequest(row)} />
            ],
        },
    ], []);

    return (<>
        <div className="form-inline d-flex justify-content-between mb-2">
            <div className='d-flex'>
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
            <Button onClick={() => navigate('new-request')}>
                New Request
            </Button>
        </div>
        {/* {loading && <div className="loader">
            <Loader className='login_loader' />
        </div>} */}
        <div className={`cstm-mui-datagrid ${!issueList?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGrow: 1 }}>
            <DataGridPro
                rows={!!issueList?.length ? issueList : []}
                columns={columns}
                autoHeight
                disableColumnFilter
                disableVirtualization
                onRowClick={({ row }) => getDetails(row)}
                components={{
                    // LoadingOverlay: LinearProgress,
                    // Footer: () =>
                    //   <MuiDataGridFooter isFetching={isFetching}
                    //     lastUpdated={issueList?.lastUpdated}
                    //     pagination={{ page: state?.page, total: issueList?.count || 0, pageSize: state?.pageSize }}
                    //     onPageChange={(e, page) => {
                    //       updateState(setState, { page: page });
                    //     }}
                    //   />
                }}
            />
        </div>
    </>);
}
