import React, { useCallback, useEffect, useState } from 'react'
// import { Check, Close } from '@mui/icons-material';

export default function PatientIsVisited({ row, updatePatientVisited }) {
    const [isPatientVisited, setPatientVisited] = useState(row.patientSlots[0]?.isVisited || false);

    useEffect(() => {
        // set visited state whenever updated
        if (row.patientSlots[0]) setPatientVisited(row.patientSlots[0]?.isVisited);
    }, [row.patientSlots]);

    const changePatientVisited = useCallback(() => {
        const updateVal = !isPatientVisited;
        setPatientVisited(updateVal);
        updatePatientVisited({ id: row.patientSlots[0].id, isVisited: updateVal });
    }, [isPatientVisited, row.patientSlots, updatePatientVisited]);

    return (
        <div onClick={(e) => e.stopPropagation()} className={`d-flex h-100 w-100 custom-control custom-checkbox cursor-pointer justify-content-center align-items-center ${isPatientVisited ? "patient-visited" : ""}`}>
            {/* {isPatientVisited ? <Check /> : <Close />} */}
            <div>
                <input
                    className="custom-control-input"
                    id={`select-all-${row.id}`}
                    name={`select-all-${row.id}`}
                    type="checkbox"
                    checked={isPatientVisited}
                    onChange={() => changePatientVisited()}
                />
                <label className="custom-control-label" htmlFor={`select-all-${row.id}`}>
                </label>
            </div>
        </div>
    )
}

// ******************* Test Code ************************
// isEditing ?
//     <div className="custom-control custom-checkbox" ref={ref}>
//         <input type="checkbox" className="custom-control-input" id="isPatientVisited"
//             checked={isPatientVisited}
//             onChange={changePatientVisited}
//         />
//         <label className="custom-control-label" htmlFor="isPatientVisited">&nbsp;</label>
//     </div> : 