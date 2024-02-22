import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import classes from "Routes/TaskBoard/TasksPage.module.css";
import { cancelToken } from "redux/actions/chatAction";
import { DataGridPro } from '@mui/x-data-grid-pro';
import { MuiTooltip } from 'Components/components';
import { CaretDownFill, CaretUpFill } from 'react-bootstrap-icons';
import { MuiDeleteAction, MuiEditAction } from 'Components/MuiDataGrid';
import { dispatch } from 'redux/store';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';
import { useNavigate } from 'react-router-dom';
import knowledgebaseService from 'services/APIs/services/knowledgebaseService';
import labelsubCategoryService from 'services/APIs/services/labelsubCategoryService';
import { queryClient } from 'index';

export default function CategoryCard({
    item,
    activeCardId,
    fIndex,
    index,
    columns,
    subCategories,
    onDeleteHandler,
    onUpdateHandler,
    getDetails,
    searchData,
    newSearch
}) {
    const navigate = useNavigate();
    const [rows, setRows] = useState(!!item?.issues?.length ? item.issues : []);

    useEffect(() => {
        setRows(!!item?.issues?.length ? item.issues : []);
    }, [item?.issues]);

    const updateCardposition = useCallback(async (frontIndex, backIndex, state) => {
        queryClient.setQueryData(["/taskSubCategory/list", { ...newSearch }],
            (prev) => prev ?
                subCategories
                    .filter((item) => item)
                    .map((item, mapIndex) => {
                        if (item?.indexValue === backIndex) return { ...item, indexValue: state === 'down' ? subCategories[frontIndex + 1].indexValue : subCategories[frontIndex - 1].indexValue }
                        if (item?.indexValue === (state === 'down' ? subCategories[frontIndex + 1].indexValue : subCategories[frontIndex - 1].indexValue)) return { ...item, indexValue: backIndex }
                        return item;
                    })
                : prev)
        if (cancelToken?.updateCardposition) cancelToken.updateCardposition.cancel("Operation cancel due to new request.");
        cancelToken.updateCardposition = axios.CancelToken.source();
        const config = { cancelToken: cancelToken.updateCardposition.token };
        const payload = {
            labelId: activeCardId,
            cardId: item.id,
            initialIndex: backIndex,
            finalIndex: state === 'down' ? subCategories[frontIndex + 1].indexValue : subCategories[frontIndex - 1].indexValue
        }
        await labelsubCategoryService.update({ payload, config });
    }, [activeCardId, item.id, subCategories, newSearch]);

    const handleRowOrderChange = useCallback(async (params) => {
        const payload = { ...params, categoryId: activeCardId, labelId: item.id, oldIndex: params.row.indexValue, targetIndex: rows[params.targetIndex].indexValue };
        const data = await knowledgebaseService.updateRequest({ payload });
        if (data?.status === 1) setRows(data.data.sort((a, b) => a.indexValue - b.indexValue));
    }, [activeCardId, item.id, rows]);

    try {
        return (
            <div className="accordion my-2" id={`subcategory-${item.id}`} key={item.id}>
                <div className='accordion'>
                    <div className={`${classes["accordion-item"]} accordion-item`}>
                        <div className="d-flex justify-content-between">
                            <div
                                className="accordion-button collapsed cursor-pointer"
                                data-bs-toggle="collapse"
                                data-bs-target={`#panelsStayOpen-collapse-${item.id}`}
                                aria-expanded="false"
                                aria-controls={`panelsStayOpen-collapse-${item.id}`}
                            >
                                <div className={`${classes.title}`}>
                                    <h5>{item.name}</h5>
                                </div>
                            </div>
                            {!searchData &&
                                <div className="buttons-div d-flex align-items-center">
                                    <MuiDeleteAction tooltip='Delete' onClick={() => onDeleteHandler(item)} />
                                    <MuiEditAction tooltip='Edit' onClick={() => onUpdateHandler(item)} />
                                    {(fIndex !== 0) &&
                                        <MuiTooltip title="Move up">
                                            <div className={`btn-svg px-1`} onClick={() => { if (fIndex) updateCardposition(fIndex, index, 'up') }}>
                                                <CaretUpFill />
                                            </div>
                                        </MuiTooltip>}
                                    {(subCategories.length - 1 !== fIndex) &&
                                        <MuiTooltip title="Move down">
                                            <div className={`btn-svg px-1`} onClick={() => { if (!subCategories.length - 1) updateCardposition(fIndex, index, 'down') }}>
                                                <CaretDownFill />
                                            </div>
                                        </MuiTooltip>}
                                    <div className={`btn btn-sm btn-primary ml-2`} onClick={() => {
                                        dispatch({ type: ISSUE_CONST.RES_SET_SUB_CATEGORY, payload: item });
                                        navigate("/knowledge/category/" + activeCardId + "/new-request")
                                    }}>
                                        <span>Add Topic</span>
                                    </div>
                                </div>}
                        </div>
                        <div id={`panelsStayOpen-collapse-${item.id}`} className={`accordion-collapse collapse show`} aria-labelledby={`card-${item.id}`}>
                            <div className="accordion-body">
                                {(rows && !!rows.length) ?
                                    <div className={`mt-2 cstm-mui-datagrid not_loading`} style={{ height: 'auto', minHeight: '160px', maxheight: 'auto', width: '100%', flexGrow: 1 }}>
                                        <DataGridPro
                                            rows={rows}
                                            columns={columns}
                                            // onPageSizeChange={(newPageSize) => updateState(setState, { pageSize: newPageSize })}
                                            // onPageChange={(newPage) => updateState(setState, { page: newPage + 1 })}
                                            // rowsPerPageOptions={[10, 20]}
                                            // rowCount={state.total}
                                            // pageSize={state.pageSize}
                                            // pagination
                                            autoHeight
                                            // page={state.page - 1}
                                            // initialState={{
                                            //     pagination: {
                                            //         page: state.page,
                                            //     },
                                            // }}
                                            components={{}}
                                            density="compact"
                                            rowReordering
                                            onRowOrderChange={handleRowOrderChange}
                                            onRowClick={(params) =>
                                                getDetails(params.row)
                                                // dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: params.row, request: true })
                                            }
                                        // onRowClick={(params) => { setUserDayLogs(params.row) }}
                                        // disableColumnFilter
                                        // filterMode="server"
                                        // onFilterModelChange={onFilterChange}
                                        />
                                    </div>
                                    :
                                    <div className='d-flex justify-content-center text-color'>No data found</div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error(error);
    }
}
