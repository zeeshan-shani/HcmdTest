import React, { useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import DialogueBody from './DialogueBody';

const getJsonFields = (fields = {}) => ({ modalHeader: "Input Component", ...fields });

export default function InputDialogue({ editingInputField, setInputField }) {

    const JsonInputFields = useMemo(() => {
        if (editingInputField?.type) return getModalFields(editingInputField);
        return null;
    }, [editingInputField]);

    return (
        <Modal
            show={editingInputField}
            onHide={() => setInputField()}
            dialogClassName="width-85vw"
            aria-labelledby={editingInputField && `${editingInputField.id}-${editingInputField.type}`}
        >
            {editingInputField && <>
                <Modal.Header closeButton>
                    <Modal.Title id={`${editingInputField.id}-${editingInputField.type}`}>
                        {JsonInputFields?.modalHeader}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DialogueBody editField={editingInputField} />
                </Modal.Body>
            </>}
        </Modal>
    )
}

const getModalFields = ({ type }) => {
    switch (type) {
        case "TextFieldNode": return getJsonFields({
            modalHeader: "Text Field Component"
        });
        default: return getJsonFields();
    }
}