import React, { useEffect, useMemo, useState } from 'react'
import ReactSelect from 'react-select';
import Divider from 'antd/lib/divider'
import CreatableSelect from 'react-select/creatable';
import { Col, Row } from "react-bootstrap";
import userService from 'services/APIs/services/userService';
import facilityService from 'services/APIs/services/facilityService';
import { showError } from 'utils/package_config/toast';

export const AttendeeProvider = ({ state, setState, updateData, isDischarge }) => {
    const [ProviderOptions, setProviderOptions] = useState([]);
    const [roomOptions, setRoomOptions] = useState([])
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            if (isDischarge) return;
            setIsLoading(true);
            let facilityId, facilityRooms = [];
            if (updateData) facilityId = updateData.patientSlots[0] && updateData.patientSlots[0].facilityId;
            const facilityData = await facilityService.list({
                payload: { "options": { "populate": ["facilityProviderInfo", "organizationInfo", "facilityRooms"] } }
            });
            const providerData = await userService.list({
                payload: { "options": { "populate": ["providerInfoAssignfacility"] } }
            });
            if (facilityId)
                facilityRooms = facilityData.data
                    .find(i => i.id === facilityId).facilityRooms
                    .map(i => ({
                        value: i.roomNumber,
                        label: `${i.roomNumber} (${Boolean(i.facilityRoomAssign) ? "Occupied" : "Available"})`
                    })) || []
            setIsLoading(false);
            setRoomOptions(facilityRooms.length ? facilityRooms :
                (state.facility?.value?.facilityRooms ?
                    state.facility.value.facilityRooms.map(i => ({
                        value: i.roomNumber,
                        label: `${i.roomNumber} (${Boolean(i.facilityRoomAssign) ? "Occupied" : "Available"})`,
                        // isDisabled: Boolean(i.facilityRoomAssign),
                        color: Boolean(i?.facilityRoomAssign) ? "#ccc" : "#000"
                    }))
                    : []))
            setState(prev => ({ ...prev, facilityOptions: facilityData.data.map(i => ({ id: i.id, value: i, label: i.name })) || [] }))
            setProviderOptions(providerData.data.map(i => ({ id: i.id, value: i, label: i.name })) || [])
        })();
    }, [updateData, state.facility?.value?.facilityRooms, setState, isDischarge]);

    const providers = useMemo(() =>
        state.facility ? ProviderOptions.filter(i => i.value.facilityAssigns.map(j => j.facilityId).includes(state.facility.id)) : []
        , [state.facility, ProviderOptions]);

    return (<>
        <Row>
            <Col>
                <Divider className='text-color align-items-center' style={{ borderColor: 'grey' }} orientation='left'>
                    Attending Provider
                </Divider>
                <Row>
                    <Col md={6} className='form-group'>
                        <label>Facility</label>
                        <ReactSelect
                            name={"facility"}
                            value={[state.facility]}
                            isLoading={isLoading}
                            onChange={(item) => {
                                setState(prev => ({
                                    ...prev,
                                    facility: item,
                                    provider: item?.value?.id === prev.provider?.value?.facilityAssign?.facilityId ? prev.provider : null,
                                    HCMDProvider: item?.value?.facilityAssigns
                                        .filter(i => i.isDefault)
                                        .map(i => ({
                                            id: `${i?.designation}-${i?.id}`,
                                            designation: i.desiInfo || null,
                                            ...i.providerInfo
                                        })) || null,
                                    HCMDProviderOptions: item?.value?.facilityAssigns
                                }))
                            }
                            }
                            options={state.facilityOptions && !!state.facilityOptions.length ? state.facilityOptions : []}
                            menuPlacement='bottom'
                            className={`basic-multi-select issue-multi-select_user-dropdown input-border ${state?.facility?.autoSet ?? ''}`}
                            classNamePrefix="select"
                            placeholder="Select facility"
                            isDisabled={isDischarge}
                            isClearable
                        />
                    </Col>
                    <Col md={6} className="form-group">
                        <label htmlFor="duration" className="mb-1">
                            Provider
                            {/* <small className='text-danger'>*</small> */}
                        </label>
                        <CreatableSelect
                            name={"provider"}
                            value={[state.provider]}
                            onChange={(item) => {
                                if (item?.__isNew__ && state.facility?.value?.info?.hasOwnProperty("owner") &&
                                    Boolean(state.facility?.value?.info?.owner)) {
                                    return showError("Outside provider can't be created in HCMD facility. Please select another facility and try again.")
                                }
                                setState(prev => ({
                                    ...prev,
                                    provider: item ? { label: item.label, value: item.value, isNew: item?.__isNew__ } : null,
                                }))
                            }}
                            options={providers && !!providers.length ? providers : []}
                            menuPlacement='auto'
                            className={`basic-multi-select issue-multi-select_user-dropdown input-border ${state?.facility?.autoSet ?? ''}`}
                            classNamePrefix="select"
                            placeholder="Select provider"
                            isClearable
                            isLoading={isLoading}
                            isDisabled={isLoading || !state.facility || isDischarge}
                        />
                        {state.facility && !state.facility?.autoSet &&
                            <small className='text-success'>Set as per previous slot of the patient</small>}
                        {!state.facility &&
                            <small>Please select facility first</small>}
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <label>Location</label>
                        <input type='text' className={`form-control`} placeholder="Location" disabled
                            value={state.facility?.value?.location ? state.facility.value.location : ''}
                        />
                    </Col>
                    <Col md={6}>
                        <label>Room Number</label>
                        <CreatableSelect
                            name={"roomNumber"}
                            value={[state.scheduleInfo.roomNumber]}
                            onChange={(data) => {
                                setState(prev => ({
                                    ...prev, scheduleInfo: {
                                        ...prev.scheduleInfo,
                                        roomNumber: data ? { label: data.label, value: data.value, isNew: data?.__isNew__ } : null
                                    }
                                }))
                            }}
                            options={roomOptions}
                            menuPlacement='auto'
                            className="basic-multi-select issue-multi-select_user-dropdown input-border"
                            classNamePrefix="select"
                            placeholder='Room Number'
                            isDisabled={isDischarge}
                            isClearable
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
    </>)
}

