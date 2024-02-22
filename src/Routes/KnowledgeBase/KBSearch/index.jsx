import React, { useCallback, useMemo } from 'react'
import moment from 'moment-timezone';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { dispatch } from 'redux/store';
import { format_all, toastPromise } from 'redux/common';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';
import { SOCKET } from 'utils/constants';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import knowledgebaseService from 'services/APIs/services/knowledgebaseService';

export default function KBSearch() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { issueList } = useSelector((state) => state.issues);
  const { taskLabels: categories } = useSelector((state) => state.task);

  const getDetails = useCallback(async (issue) => {
    const dataCategory = categories.find((item) => item.id === issue.category);
    await toastPromise({
      func: async (myResolve, myReject) => {
        try {
          const data = await knowledgebaseService.requestData({ payload: { id: issue.id } });
          if (data?.status === 1) {
            const isAssignee = data.data.createdBy !== user.id;
            navigate(`/knowledge/category/${data.data.category}/${isAssignee ? "assignedRequest" : "request"}/${data.data.id}`)
            dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: data.data, request: !isAssignee });
          }
          dispatch({ type: ISSUE_CONST.SET_ISSUE_CARD_ITEM, payload: dataCategory });
          SocketEmiter(SOCKET.REQUEST.READ_ASSIGNED_ISSUE, { issueId: issue.id });
          myResolve(data);
        } catch (error) {
          myReject("Error");
        }
      }, loading: "Requesting for Issue", success: <b>Successfully get request</b>, error: <b>Could not get request.</b>,
      options: { id: "get-request" }
    })
  }, [categories, user.id, navigate]);

  const columns = useMemo(() => [
    {
      field: "subject", headerName: "Subject", minWidth: 180, flex: 1,
      renderCell: ({ row }) => {
        const format_subject = row?.subject && format_all(row.subject);
        const userInfoRead = row?.issuesAssignedUsers?.find(usr => usr.userId === user.id)?.isRead || true;
        return (
          <nobr>
            <span dangerouslySetInnerHTML={{ __html: format_subject }}></span>
            {(!row.subcategory && !userInfoRead) &&
              <span className='new_issue_badge mx-1 align-items-center'>new</span>}
          </nobr>
        )
      }
    },
    {
      field: "category", headerName: "Category", minWidth: 180, flex: 1,
      renderCell: ({ row }) => (<nobr>{row?.taskLabel?.name}</nobr>)
    },
    {
      field: "created", headerName: "Created", minWidth: 180,
      renderCell: ({ row }) => (<>{moment(row.createdAt).format("MM/DD/YY")}</>),
    },
    {
      field: "type", headerName: "Type", minWidth: 180,
      renderCell: ({ row }) => (<>
        {!row?.subcategory ? ((row.createdBy === user.id) ? 'Creator' : 'Assignee') : 'N/A'}
      </>)
    },
    { field: "status", headerName: "Status", minWidth: 180 }
  ], [user.id]);

  return (
    <div className={`cstm-mui-datagrid ${!issueList?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGrow: 1 }}>
      <DataGridPro
        rows={!!issueList?.length ? issueList : []}
        columns={columns}
        autoHeight
        // density="compact"
        disableColumnFilter
        disableVirtualization
        onRowClick={({ row }) => getDetails(row)}
        // sortModel={state.sortModel}
        // onSortModelChange={onSortModelChange}
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
  )
}
