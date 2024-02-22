import React, { lazy, useCallback, useMemo } from 'react'
import { LazyComponent } from 'redux/common';
import ErrorBoundary from 'Components/ErrorBoundry';
import { ReactComponent as BlocksLoader } from "assets/media/BlocksLoader.svg";
const FormBuilder = lazy(() => import('Routes/FormBuilder/FormTemplate/Builder/FormBuilder'));

export default function Builder({ jsonSchema, setSchema, setState, formId, fetchingForm }) {

    const onFormChange = useCallback((schema) => {
        setSchema({ ...schema, components: schema.components });
    }, [setSchema]);

    const blockLoader = useMemo(() => (
        <div className='d-flex flex-column justify-content-center'>
            <BlocksLoader height={"100px"} />
            <p className='text-center text-muted'>Building Form...</p>
        </div>
    ), []);

    return (
        <ErrorBoundary>
            <LazyComponent fallback={blockLoader}>
                {fetchingForm ?
                    blockLoader :
                    <FormBuilder
                        key={formId}
                        form={jsonSchema}
                        onChange={onFormChange}
                        setState={setState}
                    // onUpdateComponent={onUpdate}
                    />
                }
            </LazyComponent>
        </ErrorBoundary>
    )
}
