import React from 'react'
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
import { FRAMEWORK_TYPES } from 'Components/FormBuilder/Build/_common/FormGenerator/Utils/constants';
import { Button } from 'react-bootstrap';
import ModalReactstrap from 'Components/Modals/Modal';

export default function FormPreview({ onClose, dataJson }) {
    try {
        return (<>
            <ModalReactstrap
                show={true}
                size='lg'
                header='Form Preview'
                toggle={onClose}
                body={
                    <FormGenerator
                        className={'m-1'}
                        dataFields={dataJson}
                        framework={FRAMEWORK_TYPES.react_bs}
                        onSubmit={(data) => console.info(`Data: `, data)}
                    />}
                footer={<Button color="secondary" onClick={onClose}>Close</Button>}
            />
        </>);
    } catch (error) {
        console.error(error);
    }
}
