import React, { useEffect, useState } from 'react'
import debounce from 'lodash/debounce';
import { generatePayload } from 'redux/common';
import AsyncSelect from 'react-select/async';
import patientService from 'services/APIs/services/patientService';

export const AssignToPatients = ({ providerId, autoFocus, assignMembers, setAssignMem, placeholder, label = true, className = '' }) => {
    const [searchPatient, setSearchPatient] = useState();

    useEffect(() => {
        if (searchPatient) {
            setAssignMem(searchPatient);
        }
        //eslint-disable-next-line
    }, [searchPatient]);

    const _loadSuggestions = (query, callback) => {
        getPatients(providerId, query).then((res) => {
            if (res.status === 1)
                callback(res.data.map(i => ({ id: i.id, value: i.id, label: i.firstName + ' ' + i.lastName })));
        });
    };
    const loadSuggestions = debounce(_loadSuggestions, 500);
    return (<>
        <div className="form-group w-100">
            {label && <label htmlFor="assignUserInput">Assign Patient: </label>}
            <AsyncSelect
                cacheOptions={[]}
                autoFocus={autoFocus || false}
                defaultOptions={[]}
                value={assignMembers || searchPatient}
                onChange={(text) => setSearchPatient(text)}
                classNamePrefix="select"
                className={className}
                placeholder={placeholder}
                loadOptions={loadSuggestions} />
        </div>
    </>)
}

export const getPatients = async (providerId, value = "") => {
    const payload = await generatePayload({
        rest: { providerId },
        keys: ["firstName", "lastName"],
        value,
    })
    const data = await patientService.list({ payload });
    return data;
}

