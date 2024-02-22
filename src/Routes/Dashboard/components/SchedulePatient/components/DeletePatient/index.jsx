import React, { useCallback, useMemo, useState } from 'react'
import { Button } from 'react-bootstrap'
import ModalReactstrap from 'Components/Modals/Modal'
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator'
import getDeleteForm from './deletePatientForm';
import moment from 'moment-timezone';
import patientslotService from 'services/APIs/services/patientslotService';
import dischargeReasonService from 'services/APIs/services/dischargeReasonService';
import { showError } from 'utils/package_config/toast';
import { useQuery } from '@tanstack/react-query';

export default function DeletePatient({
    toggleDeleteModel, state
}) {
    const [discharging, setDischarging] = useState(false);

    // Query hook to fetch data based on queryString & caching
    const { data: dischargeReasons, refetch } = useQuery({
        queryKey: ["/deschargeReason/list"],
        queryFn: async () => {
            const data = await dischargeReasonService.list({});
            return (data.data.map(item => ({ id: item.id, label: item.title, value: item.title })) || []);
        },
        keepPreviousData: false,
        refetchOnWindowFocus: false,
        enabled: Boolean(state.deleteModel)
    });

    const patientData = state.deleteModel;
    const formJSON = useMemo(() => {
        let form = getDeleteForm({ cbDelete: refetch });
        form = form.map((item) => {
            if (item.name === "dischargeDate") item.value = state.filters.visitDate ? moment(state.filters.visitDate).toDate() : moment().toDate();
            if (item.name === "reasonType") item.options = dischargeReasons;
            return item;
        });
        return form;
    }, [dischargeReasons, state.filters?.visitDate, refetch]);

    const onSubmitDelete = useCallback(async (data) => {
        try {
            const [reasonType] = data.reasonType || []
            if (reasonType) data.reasonType = reasonType.label
            else return showError("Please select a reason for discharge");
            const reasonId = dischargeReasons.find((i) => i.value === data.reasonType)?.id;
            setDischarging(true);
            const payload = {
                ...data,
                patientId: patientData?.id,
                providerId: patientData?.patientSlots[0]?.providerId,
                slotId: patientData?.patientSlots[0]?.id,
                discharge: true,
                reasonId
            }
            await patientslotService.dischargeUpdate({ payload });
            toggleDeleteModel(true);
        } catch (error) {
            console.error(error);
        } finally {
            setDischarging(false);
        }
    }, [patientData, toggleDeleteModel, dischargeReasons]);

    return (
        <ModalReactstrap
            header="Discharge Patient"
            toggle={() => toggleDeleteModel()}
            show={Boolean(state.deleteModel)}
            body={<>{
                state.deleteModel && (
                    <FormGenerator
                        className="m-0"
                        resetOnSubmit={false}
                        FormButtons={() => (
                            <div className='d-flex justify-content-end gap-10'>
                                <Button variant='secondary' onClick={() => toggleDeleteModel()}>Cancel</Button>
                                <Button type="submit" variant='primary' disabled={discharging}>
                                    {discharging ? "Discharging" : "Discharge"}
                                </Button>
                            </div>
                        )}
                        dataFields={formJSON}
                        onSubmit={onSubmitDelete}
                    />
                )
            }</>}
        />
    )
}
