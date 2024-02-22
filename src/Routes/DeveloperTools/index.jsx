// import React, { useState, useMemo, useCallback } from 'react'
// import PageHeader from "Routes/SuperAdmin/components/PageHeader";
// import ErrorBoundary from 'Components/ErrorBoundry';

// import AppUpdates from './AppUpdates';
// import ModalReactstrap from 'Components/Modals/Modal';
// import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator';
// import { Button } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import { encryptData } from 'redux/common';
// import { toast } from 'react-hot-toast';

// export default function DeveloperTools() {
//     const [state, setState] = useState({
//         // secretKey: 'csacsc',
//         // hasAccess: true
//         secretKey: null,
//         hasAccess: false,
//         verify: false,
//     });

//     const tabRoute = useMemo(() => {
//         return [
//             {
//                 id: "nav-update-tab",
//                 targetId: "nav-updates",
//                 buttonClass: "nav-link active",
//                 title: 'App Updates',
//                 tabClass: "tab-pane fade show active",
//                 component: <AppUpdates />,
//             }
//         ]
//     }, []);
//     const [tab, setTab] = useState(tabRoute[0].targetId);

//     const onSubmitSecretKey = useCallback(async (body) => {
//         setState(prev => ({ ...prev, verification: true }));
//         const encPswd = await encryptData(body?.secretKey);
//         const { data } = await .post('version/login', { password: encPswd });
//         if (data?.status === 1) {
//             setState(prev => ({ ...prev, verification: false, secretKey: data?.secretToken, hasAccess: true }));
//             sessionStorage.setItem('secretToken', data?.secretToken);
//             return;
//         }
//         if (!data?.status) toast.error(data.message);
//         setState(prev => ({ ...prev, verification: false }));
//     }, []);


//     return (
//         <ErrorBoundary>
//             <div className="super-admin super-admin-list p-2 col vh-100 overflow-auto prevent-overscroll-reload">
//                 {state.secretKey && state.hasAccess ? <>
//                     <PageHeader title='Developer Dashboard' />
//                     <div className='pt-2'>
//                         <nav className='dashboard-nav my-2'>
//                             <div className="nav nav-tabs flex-nowrap hide-scrollbar" id="nav-tab" role="tablist" style={{ overflowX: 'auto' }}>
//                                 {tabRoute.map((tabr) => {
//                                     if (tabr.hasOwnProperty('access') && !tabr.access) return null;
//                                     return (
//                                         <button key={tabr.id} className={tabr.buttonClass} id={tabr.id} data-bs-toggle="tab" data-bs-target={`#${tabr.targetId}`} type="button" role="tab" aria-controls={tabr.targetId} aria-selected="true" onClick={() => setTab(tabr.targetId)}>
//                                             {tabr.title}
//                                         </button>
//                                     )
//                                 })}
//                             </div>
//                         </nav>
//                         <div className="tab-content" id="nav-tabContent">
//                             {tabRoute.map((tabr) => {
//                                 if (tabr.hasOwnProperty('access') && !tabr.access) return null;
//                                 return (
//                                     <div key={tabr.id} className={tabr.tabClass} id={tabr.targetId} role="tabpanel" aria-labelledby={tabr.id}>
//                                         <ErrorBoundary>
//                                             {tab === tabr.targetId && <>
//                                                 {tabr.component}
//                                             </>}
//                                         </ErrorBoundary>
//                                     </div>
//                                 )
//                             })}
//                         </div>
//                     </div>
//                 </> : <>
//                     <ModalReactstrap
//                         header={'Unlock Developer Tools'}
//                         show={!state.hasAccess}
//                         backdrop='static'
//                         body={<>
//                             <FormGenerator
//                                 className={'m-0'}
//                                 dataFields={SecretForm}
//                                 onSubmit={onSubmitSecretKey}
//                             />
//                         </>}
//                     />
//                 </>}
//             </div>
//         </ErrorBoundary>
//     )
// }

// const SecretForm = [
//     {
//         "name": "secretKey",
//         "label": "Secret Key",
//         "valueKey": "secretKey",
//         "value": "",
//         "type": "text",
//         "placeholder": "Enter secret key",
//         "validationType": "string",
//         "validations": [{
//             "type": "required",
//             "params": ["Please enter secret key. This is required to unlock application developer tools."]
//         }],
//         "isEditable": true,
//         "autoComplete": "off",
//         "autoFocus": true,
//     }
// ]