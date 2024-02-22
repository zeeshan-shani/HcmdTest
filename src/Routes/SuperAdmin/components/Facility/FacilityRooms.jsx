import React, { useCallback, useState } from 'react'
import { Badge } from 'antd'
import ErrorBoundary from 'Components/ErrorBoundry'
import Input from 'Components/FormBuilder/components/Input'
import { dispatch } from 'redux/store'
import { toastPromise } from 'redux/common'
import patientService from 'services/APIs/services/patientService'
import { CHAT_CONST } from 'redux/constants/chatConstants'
import useDebounce from 'services/hooks/useDebounce'

export default function FacilityRooms({ facilityRooms }) {
    const [state, setState] = useState({
        search: ""
    });
    const newSearch = useDebounce(state.search, 500);
    const availableRooms = facilityRooms.filter(i => !i.facilityRoomAssign && i.roomNumber.includes(newSearch));
    const occupiedRooms = facilityRooms.filter(i => i.facilityRoomAssign && i.roomNumber.includes(newSearch));

    const getPatientInfo = useCallback(async (id) => {
        if (!id) return;
        toastPromise({
            func: async (resolve, reject) => {
                try {
                    const data = await patientService.list({
                        payload: {
                            query: { id },
                            options: { populate: ["patientAssign", "lastAllocatedSlot", "facilityInfo"] },
                            findOne: true
                        }
                    });
                    if (data?.status === 1) dispatch({ type: CHAT_CONST.SET_INSPECT_PATIENT, payload: data.data });
                    resolve(1);
                } catch (error) {
                    reject(0);
                }
            }, loading: "Fetching patient data", success: "Successfully fetch patient", error: "Couldn't fetch data"
        })
    }, []);

    return (
        <ErrorBoundary>
            <div>
                <Input
                    placeholder='Search Room'
                    value={state.search}
                    handleChange={e => setState(prev => ({ ...prev, search: e.target.value }))}
                    autoFocus
                />
            </div>
            {!!availableRooms.length &&
                <div className='mb-2'>
                    <h5>Available Rooms</h5>
                    <div className='d-flex gap-10 flex-wrap'>
                        {availableRooms
                            .map((i, index) => (
                                <Badge
                                    key={index}
                                    count={`${i.roomNumber}`}
                                    style={{ backgroundColor: '#52c41a', display: "flex", alignItems: "center", justifyContent: "center" }}
                                    overflowCount={999999}
                                />
                            ))}
                    </div>
                </div>}
            {!!occupiedRooms.length &&
                <div className='mb-2'>
                    <h5>Occupied Rooms</h5>
                    <div className='d-flex gap-10 flex-wrap'>
                        {occupiedRooms
                            .map((i, index) => (
                                <div onClick={() => getPatientInfo(i.facilityRoomAssign.patientId)}>
                                    <Badge
                                        key={index}
                                        count={`${i.roomNumber}`}
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                        title="Click to get patient data"
                                        overflowCount={999999}
                                    />
                                </div>
                            ))}
                    </div>
                </div>}
        </ErrorBoundary>
    )
}
