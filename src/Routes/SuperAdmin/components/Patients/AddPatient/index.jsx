import React, { useCallback, useMemo, useState } from 'react'
import ModalReactstrap from 'Components/Modals/Modal'
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator'
import { LazyComponent, toastPromise, updateState } from 'redux/common';
import patientService from 'services/APIs/services/patientService';
import patientForm from '../patientForm';
import moment from 'moment-timezone';
import { Button } from 'react-bootstrap';
import { useMount } from 'react-use';
import templateTabService from 'services/APIs/services/templateTabService';
import FormRenderer from 'Routes/FormBuilder/FormTemplate/FormOutput/FormRenderer';
import { blockLoader } from 'Routes/FormBuilder/FormTemplate/FormOutput';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';

export default function AddPatient({ mainState, setMainState, getData }) {
    const [state, setState] = useState({
        step: 1,
        basicData: null,
        advanceData: null
    })

    const onSubmitBasicData = (data) => {
        setState(prev => ({ ...prev, basicData: data, step: 2 }));
    }

    const onSubmitHandler = useCallback(async ({ body = state.basicData, mode = mainState.update ? 'update' : 'create', patientMetaData }) => {
        if (!body) return;
        if (body.hasOwnProperty('gender')) body.gender = (body.gender?.length && body.gender[0]?.value) || null;
        if (body.hasOwnProperty('facilityId')) body.facilityId = (body.facilityId?.length && body.facilityId[0]?.value) || null;
        if (body.hasOwnProperty('maritalStatus')) body.maritalStatus = (body.maritalStatus?.length && body.maritalStatus[0]?.value) || null;
        if (mainState.update) {
            body.id = mainState.update.id;
            const patientUser = mainState.update?.patientAssigns?.map((item) => item.userId);
            const latestUser = body['patientAssigns'].map((item) => item.value) || [];
            body.addedPatientAssign = latestUser?.filter(item => !patientUser.includes(item));
            body.removedPatientAssign = patientUser?.filter(item => !latestUser.includes(item));
            delete body['patientAssigns'];
        }
        body.patientMetaData = patientMetaData;
        await toastPromise({
            func: async (myResolve, myReject) => {
                try {
                    const data = (mode === 'update') ?
                        await patientService.update({ payload: body }) :
                        await patientService.create({ payload: body });
                    myResolve(data);
                } catch (error) {
                    myReject("Error");
                }
            },
            loading: "Updating patient...", success: <b>Successfully Updated</b>, error: <b>Could not update patient.</b>,
            options: { id: "update-patient" }
        }).then(() => {
            getData();
            updateState(setMainState, { create: false, update: false });
        });
    }, [getData, mainState.update, setMainState, state.basicData]);

    const formJSON = useMemo(() =>
        (!mainState.create || !mainState.update) ?
            patientForm.map((item) => {
                if (mainState.update) {
                    if (mainState.update.hasOwnProperty(item.name)) {
                        if (item.name === 'patientAssigns') item.value = mainState.update.patientAssigns.map((item) => ({ id: item.userId, label: item.usersPatient.name, value: item.userId }));
                        else if (item.name === 'DOB' || item.name === 'admitDate') item.value = mainState.update[item.name] ? moment(mainState.update[item.name]).toDate() : "";
                        else if (item.name === 'gender' || item.name === 'maritalStatus') item.value = [item.options.find((i) => i.value === mainState.update[item.name])]
                        else if (item.name === 'facilityId' && mainState.update?.facilityInfo)
                            item.value = [{ label: mainState.update["facilityInfo"].name, value: mainState.update["facilityInfo"].id }]
                        else item.value = mainState.update[item.name]
                    }
                } else item.value = patientForm[item.name];
                return item;
            }) : [], [mainState.create, mainState.update]);

    return (<>
        <ModalReactstrap
            size='lg'
            show={Boolean(mainState.create || mainState.update)}
            toggle={() => updateState(setMainState, { create: false, update: false })}
            centered
            header={mainState.create ? 'Add Patient' : 'Edit Patient'}
            body={<>
                <FormGenerator
                    className={`m-1 ${state.step !== 1 ? "d-none" : ""}`}
                    formClassName="row"
                    dataFields={formJSON}
                    onSubmit={onSubmitBasicData}
                    FormButtons={({ reset }) => (
                        <div className={`col-12 gap-5`}>
                            <Button variant="secondary" onClick={reset}>
                                Reset
                            </Button>
                            <Button type="submit">
                                Next
                            </Button>
                        </div>
                    )}
                />
                <div className={`m-1 ${state.step !== 2 ? "d-none" : ""}`}>
                    <AdvanceForm
                        setMainState={setState}
                        onSubmit={onSubmitHandler}
                    />
                </div>
            </>}
        />
    </>
    )
}

const AdvanceForm = ({ onSubmit, setMainState }) => {
    const [state, setState] = useState({
        jsonSchema: "",
        fetchingForm: false,
        nodes: [],
        disabledBtn: false
    });
    const { nodes = [], fetchingForm, jsonSchema } = state;

    useMount(async () => {
        setState(prev => ({ ...prev, fetchingForm: true }));
        const data = await templateTabService.list({
            payload: {
                query: {
                    identify: "ADD_PATIENT"
                },
                findOne: true
            }
        });
        if (data.status === 1)
            setState(prev => ({ ...prev, jsonSchema: data.data?.components }))
        setState(prev => ({ ...prev, fetchingForm: false }));
    })

    const rendered = useMemo(() => (
        <LazyComponent fallback={blockLoader}>
            {fetchingForm ?
                blockLoader :
                <FormRenderer
                    form={jsonSchema && JSON.parse(jsonSchema)}
                    onChange={(data) => setState(prev => ({ ...prev, nodes: data.components }))}
                    rendered
                    height="80vh"
                    nodeUpdateDelay={100}
                />
            }
        </LazyComponent>
    ), [jsonSchema, fetchingForm]);
    const onSubmitHandler = useCallback(() => {
        let newData = {};
        nodes?.map((item) => {
            const key_data = item.data.name;
            let value_data = item.data.value;
            if (item.type === "LabelNode") value_data = "";
            if (item.type === "NumberNode") value_data = Number(value_data);
            if (item.type === "DateTimeNode") value_data = moment(value_data).format("MM/DD/YYYY");
            if (item.type === "SelectNode") value_data = value_data.value;
            if (value_data) newData[key_data] = value_data;
            return item;
            // return ({ label: item.data.label, value: item.data.value, type: item.type })
        });
        onSubmit({ patientMetaData: newData });
    }, [nodes, onSubmit]);

    return (
        <ErrorBoundary>
            {rendered}
            <div className='d-flex gap-10'>
                <Button onClick={() => setMainState(prev => ({ ...prev, step: 1 }))} variant="secondary">
                    Previous
                </Button>
                <Button onClick={() => onSubmitHandler()}>Submit</Button>
            </div>
        </ErrorBoundary>
    )
}