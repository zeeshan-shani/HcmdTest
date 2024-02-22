import React, { useCallback, useMemo, useState } from 'react'
import moment from 'moment-timezone';
import ReactDatePicker from 'react-datepicker';
import { CONST } from 'utils/constants';
import { generatePayload, updateState } from 'redux/common';
import { getUserAttendanceLogs } from 'redux/actions/userAction';
import { LinearProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { DataGridPro } from '@mui/x-data-grid-pro/DataGridPro/DataGridPro';
import { getDateXDaysAgoEndOf, getDateXDaysAgoStartOf } from 'redux/common';

import { MuiDataGridFooter } from 'Components/MuiDataGrid';
import ErrorBoundary from 'Components/ErrorBoundry';
import { UsersDropdown } from 'Routes/SuperAdmin/UsersDropdown';

export const DateLogs = ({
    userData,
    setUserData,
    onlyMe,
    setUserDayLogs
}) => {
    const [state, setState] = useState({
        rows: [],
        pageSize: 10,
        page: 1,
        loading: false,
        rowCountState: 0,
        total: 0,
        totalHours: 0,
        filters: {
            dateFrom: getDateXDaysAgoStartOf(5).toLocaleString(),
            dateTo: getDateXDaysAgoEndOf(0).toLocaleString(),
        }
    });

    const getData = useCallback(async () => {
        const payload = await generatePayload({
            body: { date: state.filters },
            rest: { userId: userData.id },
            options: { sort: [['time', 'DESC']] },
        });
        const data = await getUserAttendanceLogs({ ...payload, userData: userData.name });
        return {
            rows: data?.data?.map((item, index) => ({ ...item, id: index + 1 })),
            total: data?.data ? data.data.length : 0,
            totalHours: data?.totalHours ? data.totalHours : 0
        }
    }, [state.filters, userData?.id, userData?.name]);

    // Query hook to fetch data based on queryString & caching
    const { data: userlogs, isFetching } = useQuery({
        queryKey: ["/log/list", userData?.id, userData?.name, state.filters],
        queryFn: getData,
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L2,
        refetchOnWindowFocus: false,
        enabled: Boolean(state.filters.dateFrom && state.filters.dateTo)
    });

    const columns = useMemo(() => [
        {
            field: "date", headerName: "Date", minWidth: 180, flex: 1,
            renderCell: (params) => (
                <>{moment(params.row.date).format("MM/DD/YY")}</>
            ),
        },
        {
            field: "grossTotalHours", headerName: "Gross Hours", minWidth: 180,
            headerAlign: 'center', align: 'center', flex: 1,
            renderCell: (params) => {
                const grossHours = params.row?.grossTotalHours.includes(':') && params.row.grossTotalHours.split(":");
                if (!grossHours) return <></>;
                return (<>
                    {(grossHours && !!grossHours.length) ? `${grossHours[0]}h ${grossHours[1]}m` : '-'}
                </>)
            },
        },
        {
            field: "arrivalLog", headerName: "Arrival", minWidth: 180,
            headerAlign: 'center', align: 'center', flex: 1,
            renderCell: (params) => {
                const arrival = params.row.arrivalLog;
                return (<>
                    {/* && arrival.type === USER_CONST.CLOCK_IN  */}
                    {arrival ? moment(arrival.time).tz(CONST.TIMEZONE).format("hh:mm A") : 'N/A'}
                </>)
            },
        },
        {
            field: "recentLog", headerName: "Recent Log", minWidth: 180,
            headerAlign: 'center', align: 'center', flex: 1,
            renderCell: (params) => {
                const lastLog = params.row.recentLog;
                return (<>
                    {lastLog ? moment(lastLog.time).tz(CONST.TIMEZONE).format("hh:mm A") : 'N/A'}
                </>)
            },
        },
    ], []);
    const onChangeDate = (obj) => setState((prev) => ({ ...prev, filters: { ...prev.filters, ...obj } }));
    const setUserDay = (item) => setUserDayLogs(item);
    const totalhours = userlogs?.totalHours ? userlogs.totalHours.split(":") : [];

    return (
        <ErrorBoundary>
            <div className="row m-0 mb-2 d-flex flex-wrap align-items-center justify-content-end">
                {!onlyMe &&
                    <UsersDropdown userData={userData} setUserData={setUserData} classes={''} />}
                <div className="date-task-filter d-flex align-items-center">
                    <div className="input-group d-flex px-0 flex-nowrap m-1 align-items-center" title="Date from">
                        <label className='mb-0 mr-2'>Date:</label>
                        <ReactDatePicker
                            selectsRange={true}
                            startDate={state.filters.dateFrom ? new Date(state.filters.dateFrom) : null}
                            endDate={state.filters.dateTo ? new Date(state.filters.dateTo) : null}
                            placeholderText="Date range"
                            className="form-control search mr-3"
                            onChange={(update) => {
                                const [a, b] = update;
                                onChangeDate({ dateFrom: a ? moment(a).toLocaleString() : null, dateTo: b ? moment(b).toLocaleString() : null })
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className={`mt-2 cstm-mui-datagrid ${isFetching || !userlogs.rows?.length ? 'loading' : 'not_loading'}`} style={{ height: 'auto', maxheight: 'auto', width: '100%' }}>
                <DataGridPro
                    loading={isFetching}
                    rows={userlogs?.rows ? userlogs.rows : []}
                    columns={columns}
                    onPageSizeChange={(newPageSize) => updateState(setState, { pageSize: newPageSize })}
                    onPageChange={(newPage) => updateState(setState, { page: newPage + 1 })}
                    rowCount={userlogs?.total}
                    pageSize={state.pageSize}
                    pagination
                    autoHeight
                    page={state.page - 1}
                    initialState={{
                        pagination: { page: state.page },
                    }}
                    components={{
                        LoadingOverlay: LinearProgress,
                        Footer: () =>
                            <MuiDataGridFooter
                                // lastUpdated={userList?.lastUpdated}
                                pagination={{ page: state?.page, total: userlogs?.total || 0, pageSize: state?.pageSize }}
                                onPageChange={(e, page) => {
                                    updateState(setState, { page });
                                }}
                            />
                    }}
                    density="compact"
                    onRowClick={(params) => { setUserDay(params.row) }}
                />
            </div>
            <h6 className='my-3'>
                {`Total Hours: ${totalhours && totalhours[0] && totalhours[1] ? `${totalhours[0]}h ${totalhours[1]}m` : '-'}`}
            </h6>
        </ErrorBoundary>
    );
}
