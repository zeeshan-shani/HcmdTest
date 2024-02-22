import ErrorBoundary from 'Components/ErrorBoundry'
import ConsultancyProvider from './ConsultancyProvider'
import HCMDProvider from './HCMDProvider'

export default function HCMDcareTeam() {

    // const dataFields = useMemo(() => {
    //     const formdata = getForm();
    //     return formdata;
    // }, []);

    return (
        <ErrorBoundary>
            <ConsultancyProvider mainState={{}} setMainState={() => { }} />
            <HCMDProvider mainState={{}} setMainState={() => { }} />
        </ErrorBoundary>
    )
}
