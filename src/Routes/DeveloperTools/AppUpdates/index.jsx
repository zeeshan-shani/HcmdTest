// import React, { useCallback, useEffect, useMemo, useState } from 'react'
// import { generatePayload, LazyComponent, updateState } from 'redux/common';
// import { MuiTooltip } from 'Components/components';
// import moment from 'moment-timezone';
// import { DataGridPro } from '@mui/x-data-grid-pro';
// import { LinearProgress } from '@mui/material';
// import ModalReactstrap from 'Components/Modals/Modal';
// import { Button } from 'react-bootstrap';
// import MyCkEditor from 'Routes/Issues/MyCkEditor';
// import { toast } from 'react-hot-toast';
// import { SocketEmiter } from 'utils/wssConnection/Socket';

// export default function AppUpdates() {
//     const [state, setState] = useState({
//         rows: [],
//         pageSize: 10,
//         page: 1,
//         loading: false,
//         rowCountState: 0,
//         total: 0,
//         search: '',
//         create: false,
//         update: false,
//     });
//     // const newSearch = useDebounce(state.search, 500);

//     const getData = useCallback(async () => {
//         updateState(setState, { loading: true });
//         const payload = await generatePayload({
//             options: {
//                 sort: [['createdAt', 'DESC']]
//             }
//         });
//         .defaults.headers.common["secret-key"] = sessionStorage.getItem("secretToken");
//         const { data } = await .post('/version/list', payload);
//         if (data?.status === 1) setState(prev => ({ ...prev, rows: data.data }));
//         updateState(setState, { loading: false })
//     }, []);

//     useEffect(() => {
//         getData();
//     }, [getData]);

//     // const onSubmitHandler = useCallback(async (body, mode = state.update ? 'update' : 'create') => {
//     //     if (state.update) body.id = state.update.id;
//     //     toastPromise({
//     //         func: async (resolve, reject) => {
//     //             try {
//     //                 // await .post(mode === 'update' ? '/paymentcode/update' : '/paymentcode/create', body);
//     //                 resolve(1);
//     //                 getData();
//     //             } catch (error) {
//     //                 console.error(error);
//     //                 reject(0);
//     //             }
//     //         }, loading: 'Loading Payment code.', error: 'Could not load payment code.', success: 'Payment code loaded.'
//     //     });
//     //     onCancelHandler();
//     // }, [getData, state.update]);
//     const onCancelHandler = () => updateState(setState, { create: false, update: false })
//     // const onEdit = (data) => updateState(setState, { update: data })
//     // const onDelete = (id) => {
//     //     TakeConfirmation({
//     //         title: 'Are you sure about to delete the payment code?',
//     //         onDone: async () => {
//     //             // const { data } = await .delete('/paymentcode/delete/' + id);
//     //             // if (data.status === 1) setState(prev => ({ ...prev, rows: prev.rows.filter(item => item.id !== parseInt(data.data)) }));
//     //         }
//     //     })
//     // }
//     const onPublish = useCallback((id) => {
//         const token = sessionStorage.getItem('secretToken');
//         if (!token) {
//             toast.error('You are not allowed to publish version.')
//             return;
//         }
//         SocketEmiter('version-publish', { secretKey: sessionStorage.getItem('secretToken'), id });
//     }, []);
//     const onEdit = useCallback(() => { }, []);
//     const onDelete = useCallback(() => { }, []);

//     const columns = useMemo(() => [
//         {
//             field: "createdAt", headerName: "Created on", minWidth: 180, headerAlign: "center", align: 'center',
//             renderCell: ({ row }) => (<>{moment(row.createdAt).format("MM/DD/YY")}</>)
//         },
//         {
//             field: "versionId", headerName: "Version", minWidth: 180, headerAlign: "center", align: 'center',
//             renderCell: ({ row }) => {
//                 return (<>{row.version}</>)
//             }
//         },
//         {
//             field: "notes", headerName: "Notes", minWidth: 180, flex: 1, headerAlign: "center", align: 'center',
//             renderCell: ({ row }) => {
//                 return (<>{row.note}</>)
//             }
//         },
//         {
//             field: "actions", headerName: "Actions", minWidth: 180, flex: 1, headerAlign: "center", align: 'center',
//             renderCell: ({ row }) => {
//                 return (<div className='gap-5'>
//                     <MuiTooltip title="Publish">
//                         <Button variant='primary' onClick={() => onPublish(row.id)}>Publish</Button>
//                     </MuiTooltip>
//                     <MuiTooltip title="Edit">
//                         <Button variant='secondary' onClick={onEdit}>Edit</Button>
//                     </MuiTooltip>
//                     <MuiTooltip title="Delete">
//                         <Button variant='danger' onClick={onDelete}>Delete</Button>
//                     </MuiTooltip>
//                 </div>)
//             }
//         }
//     ], [onPublish, onEdit, onDelete]);

//     return (<>
//         <div className="form-inline">
//             <div className="input-group admin-search m-0">
//                 <input type="text" className="form-control search"
//                     placeholder="Search Code..."
//                     onChange={(e) => updateState(setState, { search: e.target.value })}
//                 />
//             </div>
//             <button
//                 className='btn btn-primary ml-auto'
//                 type="button"
//                 onClick={() => setState(prev => ({ ...prev, create: true }))}
//             >
//                 Add New
//             </button>
//         </div>
//         <div className={`mt-2 cstm-mui-datagrid ${state.loading || !state.rows.length ? 'loading' : 'not_loading'}`} style={{ height: '88vh', width: '100%' }}>
//             <DataGridPro
//                 loading={state.loading}
//                 rows={state.rows}
//                 columns={columns}
//                 onPageSizeChange={(newPageSize) => updateState(setState, { pageSize: newPageSize })}
//                 onPageChange={(newPage) => updateState(setState, { page: newPage + 1 })}
//                 rowsPerPageOptions={[10, 20]}
//                 rowCount={state.total}
//                 autoHeight
//                 page={state.page - 1}
//                 initialState={{
//                     pagination: {
//                         page: state.page,
//                     },
//                 }}
//                 components={{ LoadingOverlay: LinearProgress }}
//                 disableColumnFilter
//             />
//         </div>
//         {(state.create || state.update) &&
//             <CreateUpdateVersion
//                 onSubmit={(data) => {}}
//                 mode={state.update ? 'update' : 'create'}
//                 onCancelHandler={onCancelHandler}
//             />}
//     </>)
// }

// const CreateUpdateVersion = ({ onCancelHandler, mode = 'create', onSubmit }) => {
//     const [formData, setformData] = useState({
//         version: null,
//         description: null,
//     });
//     const onChangeDesc = (e) => {
//     }
//     const onSubmithandler = async () => {
//         if (!formData.version) {
//             toast.error('Please enter version');
//             return;
//         }
//         if (!formData.description) {
//             toast.error('Please enter description');
//             return;
//         }
//         onSubmit(formData)
//     }
//     return (
//         <>
//             <ModalReactstrap
//                 size='lg'
//                 show={true}
//                 toggle={onCancelHandler}
//                 centered
//                 header={mode === 'create' ? 'Create version' : 'Edit Version'}
//                 body={<>
//                     <div className="form-group">
//                         <label htmlFor="subjectInput">Version</label>
//                         <input
//                             type="text"
//                             className="form-control form-control-md"
//                             id="dev-appVersion"
//                             placeholder="Enter new version"
//                             onChange={(e) => setformData(prev => ({
//                                 ...prev, version: e.target.value
//                             }))}
//                             required
//                         />
//                     </div>
//                     <div className="form-group">
//                         <label htmlFor="subjectInput">Description</label>
//                         <LazyComponent>
//                             <MyCkEditor
//                                 name={"description"}
//                                 value={formData.description}
//                                 onChange={onChangeDesc}
//                                 placeHolder={"Enter description of the request"} />
//                         </LazyComponent>
//                     </div>
//                 </>}
//                 footer={<>
//                     <Button variant='secondary' onClick={onCancelHandler}>Cancel</Button>
//                     <Button variant='primary' onClick={onSubmithandler}>Submit</Button>
//                 </>}
//             />
//         </>
//     )
// }