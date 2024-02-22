import React, { useState } from 'react'
import ModalReactstrap from 'Components/Modals/Modal';
import { Tab, Tabs } from 'react-bootstrap';
import PersonalInfo from './PatientData/PersonalInfo';
import Contacts from './PatientData/Contacts';
import MedicalHistory from './PatientData/MedicalHistory';
import AdditionalInfo from './PatientData/AdditionalInfo';
import CareLocation from './PatientData/CareLocation';
import HCMDcareTeam from './PatientData/HCMDcareTeam';
import VisitDocumentation from './PatientData/VisitDocumentation';
import InsuranceBilling from './PatientData/InsuranceBilling';
import Monitoring from './PatientData/Monitoring';

const patientTabs = [
    { key: "personal-info", name: "Personal Info", Component: PersonalInfo },
    { key: "contacts", name: "Contacts", Component: Contacts },
    { key: "medical-history", name: "Medical History", Component: MedicalHistory },
    { key: "care-location", name: "Care & Location", Component: CareLocation },
    { key: "hcmd-care-team", name: "HCMD Care Team", Component: HCMDcareTeam },
    { key: "visit-documentation", name: "Visit & Documents", Component: VisitDocumentation },
    { key: "monitoring", name: "Monitoring", Component: Monitoring },
    { key: "additional-info", name: "Additional Info", Component: AdditionalInfo },
    { key: "insurance-billing", name: "Insurance & Billing", Component: InsuranceBilling },
];
export default function PatientModal({ onCancel }) {
    const [state, setstate] = useState({
        activeKey: patientTabs[0].key
    })

    return (
        <ModalReactstrap
            size='xl'
            // show={Boolean(state.create || state.update)}
            show={Boolean(true)}
            toggle={onCancel}
            centered
            header={state.create ? 'Create Patient' : 'Patient Details'}
            body={<>
                <Tabs
                    id={"patient-info-tab"}
                    className="mb-2"
                    onSelect={key => setstate(prev => ({ ...prev, activeKey: key }))}
                >
                    {patientTabs.map((item) => {
                        const { key, name, Component } = item;
                        return (
                            <Tab
                                key={key}
                                eventKey={key}
                                title={name}
                                active={key === state.activeKey}
                            >
                                {key === state.activeKey && <Component />}
                            </Tab>
                        )
                    })}
                </Tabs>
                {/* <FormGenerator
                        className={'m-1'}
                        formClassName="row"
                        dataFields={formJSON}
                        onSubmit={onSubmitHandler}
                    /> */}
            </>}
        />
    )
}
