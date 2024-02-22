import React from 'react'

export default function RoomNumber({ row }) {
    // const [isRowSelectable, setisRowSelectable] = useState(second)
    const roomNumber = row.patientSlots[0]?.roomNumber || null;
    return (
        <>{roomNumber}</>
    )
}

// import { MuiActionButton, MuiEditAction } from 'Components/MuiDataGrid';
// import React, { useState } from 'react'
// import ReactSelect from 'react-select';

// export default function RoomNumber({ row }) {
//     const [isSelectionOn, setIsSelectionOn] = useState(false);
//     // const [isRowSelectable, setisRowSelectable] = useState(second)
//     const roomNumber = row.patientSlots[0]?.roomNumber || null;
//     return (
//         <div className='d-flex gap-10' onClick={e => e.stopPropagation()}>
//             {!isSelectionOn ? roomNumber :
//                 <ReactSelect
//                     name={"roomNumber"}
//                     value={[{ label: roomNumber, value: roomNumber }]}
//                     onChange={(data) => setIsSelectionOn(prev => !prev)}
//                     // options={state.facility?.value?.roomNumber ? state.facility.value.roomNumber.map(i => ({ value: i, label: i })) : []}
//                     className="basic-multi-select issue-multi-select_user-dropdown input-border min-width-160"
//                     classNamePrefix="select"
//                     placeholder='Room Number'
//                 />
//             }
//             {isSelectionOn ?
//                 <MuiActionButton onClick={(e) => setIsSelectionOn(prev => !prev)} /> :
//                 <MuiEditAction onClick={(e) => setIsSelectionOn(prev => !prev)} />
//             }
//         </div>
//     )
// }
