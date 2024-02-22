import React from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import ReactSelect from 'react-select';

export const AssignToDesignation = ({ assignDesignation, setDesignation }) => {
    const { userDesignations } = useSelector((state) => state.chat);
    if (userDesignations) {
        const options = userDesignations.map(desg => ({
            id: desg.id, value: desg.id, label: desg.name
        }))
        return (
            <ReactSelect
                isMulti
                name="designation"
                options={options}
                defaultValue={assignDesignation}
                value={assignDesignation}
                placeholder='Select Groups...'
                onChange={setDesignation}
                className="basic-multi-select issue-multi-select_designation-dropdown flex-grow-1 input-border"
                classNamePrefix="select"
            />
        )
    }
}