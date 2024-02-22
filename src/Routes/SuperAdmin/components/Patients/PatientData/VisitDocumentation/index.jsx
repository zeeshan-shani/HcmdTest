import React, { useMemo } from 'react'
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator'
import getForm from './Form'

export default function VisitDocumentation() {

    const dataFields = useMemo(() => {
        const formdata = getForm();
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
