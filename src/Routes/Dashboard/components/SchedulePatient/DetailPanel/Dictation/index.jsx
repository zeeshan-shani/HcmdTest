import React, { useCallback, useMemo, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import classes from "Routes/TaskBoard/TasksPage.module.css";
import { LinearProgress } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { toastPromise } from 'redux/common';
import { TakeConfirmation } from 'Components/components';
import { CreateEditDictation } from './CreateEditDictation';
import ActiveAudio from './ActiveDictation';
import { sortObjectsByField } from 'services/helper/default';
import moment from 'moment-timezone';
import patientService from 'services/APIs/services/patientService';

export default function Dictation({
    card, patientId, rowData,
    index, setMainState, mainState, visitDate,
    getDetailedData, data = []
}) {
    const [state, setState] = useState({
        create: false,
        update: false,
        loading: false,
        text: '',
        activeAudio: false,
        parentDictation: null,
        continueDictation: null,
    });
    const onCancelHandler = useCallback(() => setState(prev => ({ ...prev, create: false, update: false, continueDictation: null, activeAudio: null })), []);

    // get task data sort
    const DictationData = useMemo(() => {
        let dictations = data || [];
        if (!mainState.showAll)
            dictations = dictations.filter(i => i.dictationDate === moment(visitDate).format("YYYY-MM-DD"));
        return sortObjectsByField(dictations, "createdAt")
    }, [data, mainState.showAll, visitDate]);

    const updateFiles = useCallback(() => {
        onCancelHandler();
        // const updated = DictationData.find(i => i.id === state.activeAudio?.id)
        // setTimeout(() => {
        //     setState(prev => ({
        //         ...prev,
        //         activeAudio: prev.activeAudio ? updated : null
        //     }))
        // }, 1000);
    }, [onCancelHandler]);

    const onSubmitHandler = useCallback(async (body, mode, id) => {
        if (!state.continueDictation) {
            body = {
                ...body,
                fileName: body.fileName,
                mediaType: body.mediaType,
                mediaUrl: body.mediaUrl,
            }
            // delete body.fileName;
            // delete body.mediaType;
            // delete body.mediaUrl;
        }
        else {
            // body.attachmentId = state.continueDictation.id
            body.id = state.continueDictation.id || null;
            delete body.note;
            delete body.mediaType;
            delete body.comment;
            delete body.label;
        }
        if (mode === 'create') {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const payload = { patientId, ...body };
                        const data = !state.continueDictation ?
                            await patientService.attachmentCreate({ payload }) :
                            await patientService.attachmentUpdate({ payload });
                        if (data?.status === 1 && !state.continueDictation) {
                            setMainState(prev => ({ ...prev, patientData: { ...prev.patientData, patientAttachments: [data.data, ...prev.patientData.patientAttachments] } }))
                        } else if (data?.status === 1 && state.continueDictation) {
                            setMainState(prev => ({
                                ...prev, patientData: {
                                    ...prev.patientData,
                                    patientAttachments: prev.patientData.patientAttachments.map(i => {
                                        if (i.id === data.data.id) return { ...i, mediaUrl: data.data.mediaUrl }
                                        return i
                                    })
                                }
                            }));
                            updateFiles();
                        }
                        resolve(1);
                    } catch (error) {
                        console.error(error);
                        reject(0);
                    }
                }, loading: 'Creating File Data.', error: 'Could not create File Data.', success: 'File data created.',
                options: { id: "create-dictation" }
            });
        }
        else if (mode === 'update') {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const data = await patientService.attachmentUpdate({ payload: { ...body, id } });
                        setMainState(prev => ({
                            ...prev, patientData: {
                                ...prev.patientData,
                                patientAttachments: prev.patientData.patientAttachments.map((item) => {
                                    if (item.id === data.data.id) return { ...item, ...data.data }
                                    return item;
                                })
                            }
                        }))
                        resolve(1);
                    } catch (error) {
                        console.error(error);
                        reject(0);
                    }
                }, loading: 'Updating File Data.', error: 'Could not update File Data.', success: 'File Data updated.',
                options: { id: "update-dictation" }
            });

        };
        onCancelHandler();
    }, [onCancelHandler, patientId, setMainState, state.continueDictation, updateFiles]);

    const onDeleteAttachment = useCallback(async (id, attachmentId) => {
        TakeConfirmation({
            title: 'Are you sure about to delete the audio and attached content?',
            onDone: async () => {
                await patientService.attachmentDelete({ payload: { id } });
                setMainState(prev => ({
                    ...prev, patientData: {
                        ...prev.patientData,
                        patientAttachments: prev.patientData?.patientAttachments.filter(i => i.id !== id)
                    }
                }));
                updateFiles();
            }
        })
    }, [setMainState, updateFiles]);

    const onDelete = useCallback(async (id) => {
        TakeConfirmation({
            title: 'Are you sure about to delete the audio and attached content?',
            onDone: async () => {
                await patientService.attachmentDelete({ payload: { id } });
                setMainState(prev => ({
                    ...prev, patientData: {
                        ...prev.patientData,
                        patientAttachments: prev.patientData?.patientAttachments.filter((item) => item.id !== id)
                    }
                }))
            }
        })
    }, [setMainState]);

    const onContinueDictation = useCallback((activeAudio) => {
        setState(prev => ({ ...prev, continueDictation: activeAudio }))
    }, []);

    const columns = useMemo(() => [
        {
            field: "actions", headerName: "Actions", type: "actions", minWidth: 180, flex: 1,
            getActions: ({ row }) => [
                <Button size='sm' onClick={() => setState(prev => ({ ...prev, activeAudio: row }))}>Play</Button>,
                <Button size='sm' variant='secondary' onClick={() => onContinueDictation(row)}>Continue Dictation</Button>,
                <Button size='sm' variant='secondary' onClick={() => onDelete(row.id)}>Delete</Button>,
            ],
        },
        {
            field: "date", headerName: "Date", minWidth: 180, flex: 0,
            // renderCell: ({ row }) => (<>{moment(row.createdAt).tz(CONST.LOCAL_TIMEZONE).format("MM/DD/YY")}</>), // .tz(CONST.SERVER_TIMEZONE)
            renderCell: ({ row }) => <>{row.dictationDate ? moment(row.dictationDate).format("MM/DD/YY") : null}</>
        },
        {
            field: "label", headerName: "Label", minWidth: 180, flex: 1,
            renderCell: ({ row }) => (
                <div>{row.label ? row.label : '-'}</div>
            ),
        },
        {
            field: "note", headerName: "Notes", minWidth: 200, flex: 1,
            renderCell: ({ row }) => (
                <div>{row.note ? row.note : '-'}</div>
            ),
        },
        {
            field: "comments", headerName: "Comments", minWidth: 180, flex: 1,
            renderCell: ({ row }) => (
                <>{row.comment}</>
            ),
        }
    ], [onDelete, onContinueDictation]);

    const onViewAllDictation = useCallback(async () => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    await getDetailedData();
                    setMainState(prev => ({ ...prev, showAll: !prev.showAll }));
                    resolve();
                } catch (error) {
                    console.error(error);
                    reject();
                }
            }, loading: "Fetching dictations", success: "Successfully Fetch dictations", error: "Couldn't fetch dictations",
            options: { id: "read-dictation" }
        })
    }, [getDetailedData, setMainState]);

    const onResetDictation = useCallback(() => setMainState(prev => ({ ...prev, showAll: !prev.showAll })), [setMainState]);

    return (<>
        <Card className='card p-2 m-1'>
            <div className="d-flex justify-content-between">
                <div
                    className="accordion-button collapsed cursor-pointer"
                    data-bs-toggle="collapse"
                    data-bs-target={`#panelsStayOpen-collapse-${card.id}-${patientId}`}
                    aria-expanded="false"
                    aria-controls={`panelsStayOpen-collapse-${card.id}-${patientId}`}
                >
                    <div className={`${classes.title} font-weight-bold`}>
                        {`${rowData?.firstName ? `${rowData?.firstName} ${rowData?.lastName ? rowData?.lastName : ''} -` : ''}  Dictation`}
                    </div>
                </div>
            </div>
            <div id={`panelsStayOpen-collapse-${card.id}-${patientId}`} className={`accordion-collapse collapse show`} aria-labelledby={`card-${card.id}`}>
                <div className="accordion-body">
                    <div className="buttons d-flex gap-10 my-2">
                        <Button variant="primary" size="sm" onClick={(e) => setState(prev => ({ ...prev, create: true }))}>
                            {`Add Dictation`}
                        </Button>
                        <Button variant='outline-secondary' size='sm' onClick={mainState.showAll ? onResetDictation : onViewAllDictation}>
                            {mainState.showAll ? 'Reset' : 'Show All'}
                        </Button>
                    </div>
                    <div className={`my-2 cstm-mui-datagrid ${!DictationData?.length ? 'loading' : 'not_loading'}`} style={{ maxHeight: '88vh', width: '100%', flexGlow: 1 }}>
                        <DataGridPro
                            columns={columns}
                            rows={!!DictationData?.length ? DictationData : []}
                            autoHeight
                            density="compact"
                            disableColumnFilter
                            components={{
                                LoadingOverlay: LinearProgress,
                                Footer: () => <></>
                            }}
                        />
                    </div>
                </div>
            </div>
            <CreateEditDictation
                type={"audio"}
                fieldName={'Dictation'}
                showModal={Boolean(state.create || state.update || state.continueDictation)}
                onSubmit={onSubmitHandler}
                onCancel={onCancelHandler}
                mode={((state.create || state.continueDictation) ? 'create' : (state.update && 'update'))}
                continueDictation={state.continueDictation}
                updateData={state.update}
                visitDate={visitDate} />
            <ActiveAudio
                activeAudio={state.activeAudio}
                onContinueDictation={onContinueDictation}
                onDeleteAttachment={onDeleteAttachment}
                updateFiles={updateFiles}
                onClose={() => setState(prev => ({ ...prev, activeAudio: false }))} />
        </Card>
    </>)
}
