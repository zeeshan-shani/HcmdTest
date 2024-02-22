import React from 'react'
import { X } from 'react-bootstrap-icons';

export const CancelEditButton = (props) => {
    return (
        <div className="btn btn-icon send-icon rounded-circle text-color mb-1 user-menu-container cancel-edit-button"
            style={{ zIndex: 1 }}
            onClick={() => props.onCancelEdit()}
        >
            <X size={18} />
        </div>);
}
