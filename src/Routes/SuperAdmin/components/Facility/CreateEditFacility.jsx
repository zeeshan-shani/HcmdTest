import React, { useCallback, useEffect, useState } from 'react'
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator'
import { Col, Row } from 'react-bootstrap'
import ReactSelect from 'react-select'
import userService from 'services/APIs/services/userService'

export const defaultTagStyles = {
    multiValue: (base, state) => {
        return state.data.isDefault ? { ...base, backgroundColor: "gray" } : base;
    },
    multiValueLabel: (base, state) => {
        return state.data.isDefault
            ? { ...base, color: "white", paddingRight: 6 }
            : base;
    },
    multiValueRemove: (base, state) => {
        return state.data.isDefault ? { ...base, display: "none" } : base;
    }
};

export default function CreateEditFacility({ state, formJSON, onSubmitHandler }) {
    const [defaultProvider, setDefaultProvider] = useState({ MD: null, NP: null });
    const [facilityProvider, setFacilityProvider] = useState({ MD: [], NP: [] });
    const [providerOptions, setProviderOptions] = useState({ MD: [], NP: [] });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            getHCMDProviders('', state?.providerId).then((res) => {
                setIsLoading(false);
                if (res.status === 1)
                    setProviderOptions(prev => ({
                        ...prev,
                        MD: res.data.map(i => ({
                            id: i.id,
                            value: i.id,
                            label: i.name,
                            designationId: state?.providerId
                        }))
                    }));
            });
            getHCMDProviders('', state?.nursePractitionerId).then((res) => {
                setIsLoading(false);
                if (res.status === 1)
                    setProviderOptions(prev => ({
                        ...prev,
                        NP: res.data.map(i => ({
                            id: i.id,
                            value: i.id,
                            label: i.name,
                            designationId: state?.nursePractitionerId
                        }))
                    }));
            });
            getHCMDProviders('', state?.roundsDesgId).then((res) => {
                setIsLoading(false);
                if (res.status === 1)
                    setProviderOptions(prev => ({
                        ...prev,
                        STAFF: res.data.map(i => ({
                            id: i.id,
                            value: i.id,
                            label: i.name,
                            designationId: state?.roundsDesgId
                        }))
                    }));
            });
        })();
    }, [state?.nursePractitionerId, state?.providerId, state.roundsDesgId]);

    useEffect(() => {
        if (state.update) {
            setDefaultProvider(prev => {
                const defaultMD = state.update.facilityAssigns.filter(i => i.isDefault && i.designationId === state?.providerId).map(i => i?.providerInfo);
                const defaultNP = state.update.facilityAssigns.filter(i => i.isDefault && i.designationId === state?.nursePractitionerId).map(i => i?.providerInfo);
                return {
                    ...prev,
                    MD: !!defaultMD?.length ? defaultMD.map(md => ({ label: md.name, value: md.id, designationId: state?.providerId })) : null,
                    NP: !!defaultNP?.length ? defaultNP.map(np => ({ label: np.name, value: np.id, designationId: state?.nursePractitionerId })) : null,
                }
            });
            setFacilityProvider(prev => {
                const facilityMD = state.update.facilityAssigns
                    .filter(i => i.designationId === state?.providerId)
                    .map(i => ({ label: i.providerInfo?.name, value: i.providerInfo?.id, isDefault: i.isDefault, designationId: state?.providerId }));
                const facilityNP = state.update.facilityAssigns
                    .filter(i => i.designationId === state?.nursePractitionerId)
                    .map(i => ({ label: i.providerInfo?.name, value: i.providerInfo?.id, isDefault: i.isDefault, designationId: state?.nursePractitionerId }));
                const facilityStaff = state.update.facilityAssigns
                    .filter(i => i.designationId === state?.roundsDesgId)
                    .map(i => ({ label: i.providerInfo?.name, value: i.providerInfo?.id, designationId: state?.roundsDesgId }));
                return { ...prev, MD: facilityMD, NP: facilityNP, STAFF: facilityStaff }
            });
        }
    }, [state.update, state?.nursePractitionerId, state?.providerId, state.roundsDesgId]);

    const onSubmitForm = useCallback((body) => {
        body = { ...body, ...facilityProvider };
        onSubmitHandler(body)
    }, [facilityProvider, onSubmitHandler]);

    return (<>
        {(state.create || state.update) &&
            <FormGenerator
                className={'m-0'}
                formClassName="row"
                dataFields={formJSON}
                resetOnSubmit={false}
                extraFields={<Col>
                    <Row className='my-2'>
                        <Col md={6}>
                            <label htmlFor="default-hcmd-md">HCMD Default MD</label>
                            <ReactSelect
                                id='default-hcmd-md'
                                name="DefaultMD"
                                options={providerOptions.MD || []}
                                value={defaultProvider.MD}
                                placeholder={'HCMD Default MD'}
                                onChange={e => {
                                    setDefaultProvider(prev => ({ ...prev, MD: e }))
                                    setFacilityProvider(prev => ({
                                        ...prev,
                                        MD: e.map(i => ({ ...i, isDefault: true })).concat([...prev.MD.filter(i => !i.isDefault)])
                                    }))
                                }}
                                menuPlacement='auto'
                                className="basic-multi-select input-border"
                                classNamePrefix="select"
                                isLoading={isLoading}
                                isMulti
                            />
                        </Col>
                        <Col md={6}>
                            <label htmlFor="default-hcmd-np">HCMD Default NP</label>
                            <ReactSelect
                                id='default-hcmd-np'
                                name="DefaultNP"
                                options={providerOptions.NP || []}
                                value={defaultProvider.NP}
                                placeholder={'HCMD Default NP'}
                                onChange={e => {
                                    setDefaultProvider(prev => ({ ...prev, NP: e }))
                                    setFacilityProvider(prev => ({
                                        ...prev,
                                        NP: e.map(i => ({ ...i, isDefault: true })).concat([...prev.NP.filter(i => !i.isDefault)])
                                    }))
                                }}
                                menuPlacement='auto'
                                className="basic-multi-select input-border"
                                classNamePrefix="select"
                                isLoading={isLoading}
                                isMulti
                            />
                        </Col>
                    </Row>
                    <Row className='mb-2'>
                        <Col md={6}>
                            <label htmlFor="hcmd-md">HCMD MD</label>
                            <ReactSelect
                                id='hcmd-md'
                                name="MD"
                                options={providerOptions.MD || []}
                                value={facilityProvider.MD}
                                placeholder={'HCMD MD'}
                                onChange={data => setFacilityProvider(prev => ({ ...prev, MD: data }))}
                                menuPlacement='auto'
                                isClearable={!facilityProvider.MD.some(i => i.isDefault)}
                                className="basic-multi-select input-border"
                                classNamePrefix="select"
                                isLoading={isLoading}
                                isMulti
                                styles={defaultTagStyles}
                            />
                        </Col>
                        <Col md={6}>
                            <label htmlFor="hcmd-np">HCMD NP</label>
                            <ReactSelect
                                id='hcmd-np'
                                name="NP"
                                options={providerOptions.NP || []}
                                value={facilityProvider.NP}
                                placeholder={'HCMD NP'}
                                onChange={data => setFacilityProvider(prev => ({ ...prev, NP: data }))}
                                isClearable={!facilityProvider.NP.some(i => i.isDefault)}
                                menuPlacement='auto'
                                className="basic-multi-select input-border"
                                classNamePrefix="select"
                                isLoading={isLoading}
                                isMulti
                                styles={defaultTagStyles}
                            />
                        </Col>
                    </Row>
                    <Row className='mb-3'>
                        <Col>
                            <label htmlFor="hcmd-np">HCMD STAFF</label>
                            <ReactSelect
                                id='hcmd-staff'
                                name="STAFF"
                                options={providerOptions.STAFF || []}
                                value={facilityProvider.STAFF}
                                placeholder={'Select HCMD STAFF'}
                                onChange={data => setFacilityProvider(prev => ({ ...prev, STAFF: data }))}
                                // isClearable={!facilityProvider.STAFF.some(i => i.isDefault)}
                                menuPlacement='auto'
                                className="basic-multi-select input-border"
                                classNamePrefix="select"
                                isLoading={isLoading}
                                isMulti
                                styles={defaultTagStyles}
                            />
                        </Col>
                    </Row>
                </Col>}
                onSubmit={onSubmitForm}
            />}
    </>
    )
}

export const getHCMDProviders = async (value = "", designationId, populate = []) => {
    const payload = {
        "query": { designationId },
        "options": {
            "sort": [["name", "asc"]],
            "populate": ["users:own", ...populate]
        }
    }
    const data = await userService.list({ payload })
    return data;
}