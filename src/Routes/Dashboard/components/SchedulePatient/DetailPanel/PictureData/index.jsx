import React, { useCallback, useMemo, useState } from 'react';
import { Button, Card, Row, } from 'react-bootstrap';
import classes from "Routes/TaskBoard/TasksPage.module.css";
import { toastPromise } from 'redux/common';
import { TakeConfirmation } from 'Components/components';
import { ExclamationCircle } from 'react-bootstrap-icons';
import PictureDataImage from 'Routes/Dashboard/components/SchedulePatient/DetailPanel/PictureData/PictureDataImage';
import { CreateEditAttachment } from './CreateEditAttachment';
import { sortObjectsByField } from 'services/helper/default';
import patientService from 'services/APIs/services/patientService';

export default function PictureData({
    rowData, type = "image",
    card, patientId,
    index, setMainState, setPatientProfile,
    data = []
}) {
    const [state, setState] = useState({
        create: false,
        update: false,
        loading: false,
        text: '',
    });
    const onCancelHandler = useCallback(() => setState(prev => ({ ...prev, create: false, update: false })), []);

    const onSubmitHandler = useCallback(async (body, mode, id) => {
        if (mode === 'create') {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const data = await patientService.attachmentCreate({ payload: { patientId, ...body } });
                        if (data?.status === 1)
                            setMainState(prev => ({
                                ...prev, patientData: {
                                    ...prev.patientData,
                                    patientAttachments: [data.data, ...prev.patientData.patientAttachments]
                                }
                            }))
                        resolve(1);
                    } catch (error) {
                        console.error(error);
                        reject(0);
                    }
                }, loading: 'Creating File Data.', error: 'Could not create File Data.', success: 'File data created.',
                options: { id: "create-picture" }
            });
        }
        else if (mode === 'update') {
            await toastPromise({
                func: async (resolve, reject) => {
                    try {
                        const data = await patientService.attachmentUpdate({ payload: { ...body, patientId, id } });
                        setMainState(prev => ({
                            ...prev, patientData: {
                                ...prev.patientData,
                                patientAttachments: prev.patientData.patientAttachments.map((item) => {
                                    if (item.id === data.data.id)
                                        return { ...item, ...data.data }
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
                options: { id: "update-picture" }
            });
        };
        if (body.profilePicture)
            setPatientProfile(patientId, body.mediaUrl);
        onCancelHandler();
    }, [onCancelHandler, patientId, setMainState, setPatientProfile]);

    const onDelete = useCallback(async (id) => {
        TakeConfirmation({
            title: 'Are you sure about to delete the attached content?',
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
    const PictureData = useMemo(() => sortObjectsByField(data, "createdAt"), [data]);

    return (<>
        <Card className='card p-2 m-1'>
            <div className="d-flex justify-content-between">
                <div
                    className="accordion-button collapsed cursor-pointer d-flex justify-content-between"
                    data-bs-toggle="collapse"
                    data-bs-target={`#panelsStayOpen-collapse-${card.id}-${patientId}`}
                    aria-expanded="false"
                    aria-controls={`panelsStayOpen-collapse-${card.id}-${patientId}`}
                >
                    <div className={`${classes.title} font-weight-bold`}>
                        {`${rowData?.firstName ? `${rowData?.firstName} ${rowData?.lastName ? rowData?.lastName : ''} -` : ''} Picture Data`}
                    </div>
                </div>
            </div>
            <div id={`panelsStayOpen-collapse-${card.id}-${patientId}`} className={`accordion-collapse collapse show`} aria-labelledby={`card-${card.id}`}>
                <div className="accordion-body">
                    <div className="my-1 overflow-auto hide-horizonal-scroll" style={{ maxHeight: '300px' }}>
                        <Row>
                            {/* <ul className="mb-2"> */}
                            {!!PictureData.length ?
                                PictureData.map((item, index) => {
                                    // if (type === 'audio') {
                                    //     return (
                                    //         <DictationCard
                                    //             data={item}
                                    //             key={index}
                                    //             onUpdate={onSubmitHandler}
                                    //             onDelete={onDelete}
                                    //             onEdit={() => setState(prev => ({ prev, update: item }))} />)
                                    // }
                                    // else {
                                    return (
                                        <PictureDataImage
                                            imagesData={PictureData}
                                            data={item}
                                            key={index}
                                            onUpdate={onSubmitHandler}
                                            onDelete={onDelete}
                                            onEdit={() => setState(prev => ({ ...prev, update: item }))} />)
                                }
                                    // }
                                )
                                : (<div className="w-100 text-center text-muted">
                                    <ExclamationCircle size={20} />
                                    <p className="mb-0 text-muted">
                                        No data available
                                    </p>
                                </div>
                                )}
                            {/* </ul> */}
                        </Row>
                    </div>
                    <Button variant="primary" size="sm" onClick={(e) => setState(prev => ({ ...prev, create: true }))}>
                        {`Add ${type === 'audio' ? 'Dictation' : 'Picture'}`}
                    </Button>
                </div>
            </div>
            <CreateEditAttachment
                type={type}
                fieldName={type === 'audio' ? 'Dictation' : 'Picture Data'}
                showModal={Boolean(state.create || state.update)}
                onSubmit={onSubmitHandler}
                onCancel={onCancelHandler}
                mode={(state.create ? 'create' : (state.update && 'update'))}
                updateData={state.update} />
        </Card>
    </>);
}

