import React, { useCallback, useEffect, useMemo, useState } from "react";
import { generatePayload } from "redux/common";
import { ReactComponent as LoaderSvg } from "assets/media/heroicons/LoginLoader.svg";
import PatientNotes from "Routes/Dashboard/components/SchedulePatient/DetailPanel/PatientNotes";
import PatientRelatives from "Routes/Dashboard/components/SchedulePatient/DetailPanel/PatientRelatives";
import PictureData from "Routes/Dashboard/components/SchedulePatient/DetailPanel/PictureData";
import TodoList from "Routes/Dashboard/components/SchedulePatient/DetailPanel/TodoList";
import Dictation from "Routes/Dashboard/components/SchedulePatient/DetailPanel/Dictation";
import moment from "moment-timezone";
import ErrorBoundary from "Components/ErrorBoundry";
import patientService from "services/APIs/services/patientService";

const defaultState = { loading: false, patientData: {}, id: 0, showAll: false };
export default function DetailPanelContent({ visitDate, setPatientProfile, params, updatedDetailData, setMainState }) {
    const [state, setState] = useState(defaultState);

    const getDetailedData = useCallback(async (date) => {
        setState(prev => ({ ...prev, loading: true }));
        let payload = await generatePayload({
            body: date && {
                dictationDate: {
                    dateFrom: moment(date).format("YYYY-MM-DD"),
                    dateTo: moment(date).format("YYYY-MM-DD")
                }
            },
            rest: { id: params.row.id },
            options: { populate: ["patientAssign", "patientTasks", "patientAttachements", "patientPaymentCode", "patientGuardians", "patientNote"] },
            findOne: true
        })
        const data = await patientService.list({ payload });
        if (data?.status === 1) {
            setState(prev => ({ ...prev, loading: false, patientData: data.data }));
            return;
        }
        setState(prev => ({ ...prev, loading: false }));
    }, [params.row.id]);

    useEffect(() => {
        const date = visitDate || null; // params.row.patientSlots[0].start ||
        getDetailedData(date);
        return () => {
            setState(defaultState);
        }
    }, [getDetailedData, visitDate]);

    useEffect(() => {
        if (updatedDetailData) {
            setState(prev => ({
                ...prev,
                patientData: {
                    ...prev.patientData,
                    patientAttachments: prev.patientData.patientAttachments ? [updatedDetailData, ...prev.patientData.patientAttachments]
                        : [updatedDetailData]
                }
            }))
            setMainState(prev => ({ ...prev, updatedDetailData: null }));
        }
    }, [updatedDetailData, setMainState]);

    const components = useMemo(() =>
        [
            {
                Order: 4,
                Component: <Dictation
                    type="audio"
                    rowData={params.row}
                    patientId={state.patientData.id}
                    getDetailedData={getDetailedData}
                    data={state.patientData?.patientAttachments?.filter(item => item?.mediaType?.includes('audio'))}
                    mainState={state}
                    visitDate={visitDate}
                    setMainState={setState}
                    card={{ id: 3 }}
                    index={3} />,
            },
            {
                Order: 2,
                Component: <TodoList
                    patientId={state.patientData.id}
                    rowData={params.row}
                    data={state.patientData.patientTasks}
                    setMainState={setState}
                    card={{ id: 1 }}
                    index={1} />,
            },
            {
                Order: 5,
                Component: <PictureData
                    type="image"
                    rowData={params.row}
                    setPatientProfile={setPatientProfile}
                    patientId={state.patientData.id}
                    data={state.patientData?.patientAttachments?.filter(item => item?.mediaType?.includes('image') || item?.mediaType?.includes('pdf'))}
                    setMainState={setState}
                    card={{ id: 2 }}
                    index={2} />,
            },
            {
                Order: 1,
                Component: <PatientRelatives
                    className="w-100"
                    rowData={params.row}
                    patientId={state.patientData.id}
                    setMainState={setState}
                    data={state.patientData?.patientGuardians}
                    card={{ id: 4 }}
                    index={4} />,
            },
            {
                Order: 3,
                Component: <PatientNotes
                    className="w-100"
                    patientId={state.patientData.id}
                    rowData={params.row}
                    setMainState={setState}
                    data={state?.patientData?.patientNotes}
                    card={{ id: 5 }}
                    index={5} />,
            },
        ],
        [state, params.row, setPatientProfile, visitDate, getDetailedData]);

    if (state.loading)
        return (
            <div className="d-flex justify-content-between">
                <LoaderSvg className='login_loader' />
            </div>
        )

    try {
        return (
            <ErrorBoundary>
                <div style={{ maxHeight: '50vh', width: '100%' }}>
                    {components.map((item, index) => (
                        <React.Fragment key={index}>
                            {item.Component}
                        </React.Fragment>
                    ))}
                </div>
            </ErrorBoundary>)
    } catch (error) {
        console.error(error);
    }
}