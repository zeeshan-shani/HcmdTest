import React, { useMemo, useState } from 'react'
import { Button } from 'react-bootstrap'
import ModalReactstrap from 'Components/Modals/Modal'
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator'
import getTransferForm from './transferForm';
import patientslotService from 'services/APIs/services/patientslotService';
import { showError } from 'utils/package_config/toast';

export default function TransferPatient({
    toggleTransferModel, state, data, providers = []
}) {
    const [transferData, setTransferState] = useState({
        facility: null,
        provider: null,
        selectedRows: [],
        isLoading: false
    })
    const UserFormData = useMemo(() => getTransferForm(), []);
    const { formJSON } = useMemo(() => {
        const selectedRows = data.filter(i => state.selectionModel.includes(i.id));
        if (!selectedRows.length) return [];
        const [patient] = selectedRows
        // const { providerId } = patient.patientSlots[0];
        const facility = patient.patientSlots[0]?.facilitySlotInfo || null;
        let providerOpt = providers
        if (facility) {
            providerOpt = providerOpt.filter(i => i.value.facilityAssigns.map(j => j.facilityId).includes(facility.id));
        }
        providerOpt = providerOpt.map(i => ({ ...i, value: i.id }))
        setTransferState(prev => ({ ...prev, facility, selectedRows }));
        const formJSON = UserFormData.map((item) => {
            if (item.name === 'provider') item.options = providerOpt
            return item;
        });
        return { formJSON }
    }, [UserFormData, data, state.selectionModel, providers]);

    const onTransferPatient = async (payload) => {
        try {
            setTransferState(prev => ({ ...prev, isLoading: true }));
            await patientslotService.transferPatient({ payload });
            setTransferState(prev => ({ ...prev, isLoading: false }));
            toggleTransferModel(true);
        } catch (error) {
            console.error(error);
            setTransferState(prev => ({ ...prev, isLoading: false }));
        }
    }

    const onSubmitTransfer = async (data) => {
        if (!data.provider?.length) return showError("Please assign provider");
        if (data.hasOwnProperty("provider") && !!data.provider?.length) {
            data.providerId = data.provider[0].value
            delete data.provider
        }
        data.type = data.transferType
        if (data.type === "permenant" && data.duration) data.duration = 0
        data.patientInfo = transferData.selectedRows.map((item => ({
            patientId: item.id,
            patientSlotId: item.patientSlots[0].id,
            providerId: item.patientSlots[0].providerId
        })))
        await onTransferPatient(data)
    }

    return (
        <ModalReactstrap
            header="Transfer Patient"
            toggle={toggleTransferModel}
            show={state.transferModel}
            body={<>
                {
                    state.transferModel && !!state.selectionModel.length && (
                        <FormGenerator
                            className="m-0"
                            FormButtons={() => (
                                <div className='d-flex justify-content-end gap-10'>
                                    <Button variant='secondary' onClick={toggleTransferModel}>Cancel</Button>
                                    <Button type="submit" variant='primary'>Save</Button>
                                </div>
                            )}
                            resetOnSubmit={false}
                            dataFields={formJSON}
                            onSubmit={onSubmitTransfer}
                        />
                    )
                }</>}
        />
    )
}