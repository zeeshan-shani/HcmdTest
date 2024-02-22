import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator'
import React, { useMemo } from 'react'
import getpatientForm from './Form'

export default function PersonalInfo() {

    // const formJSON = [
    //     {
    //         id: 1,
    //         title: "Address of Visit",
    //         key: "addressOfVisit",
    //         placeholder: "Select location",
    //         type: "select",
    //     },
    //     {
    //         id: 2,
    //         title: "Address of record and insurance",
    //         key: "AddressOfRecordAndInsurance",
    //         placeholder: "Select location",
    //         type: "select",
    //     },
    //     {
    //         id: 3,
    //         title: "Date of initial HCMD & contacting staff",
    //         key: "dateInitialHCMD",
    //         placeholder: "Select date",
    //         type: "date",
    //     },
    //     {
    //         id: 4,
    //         title: "Where the patient hear about us?",
    //         key: "reference",
    //         placeholder: "Select",
    //         type: "select",
    //     },
    //     {
    //         id: 5,
    //         title: "Who was the first patient spoke to?",
    //         key: "patientFirstPerson",
    //         placeholder: "Select",
    //         type: "select",
    //     },
    //     {
    //         id: 6,
    //         title: "Person who enrolled the patient?",
    //         key: "patientEnrollBy",
    //         placeholder: "Select",
    //         type: "select",
    //     },
    //     {
    //         id: 7,
    //         title: "Family Contact",
    //         key: "familyContact",
    //         type: "phone",
    //     },
    // ]

    const dataFields = useMemo(() => {
        const formdata = getpatientForm();
        return formdata;
    }, []);

    return (
        <FormGenerator
            className="m-0"
            formClassName={"row"}
            resetOnSubmit={false}
            dataFields={dataFields}
            onSubmit={e => console.log('e', e)}
        />
    )
}
