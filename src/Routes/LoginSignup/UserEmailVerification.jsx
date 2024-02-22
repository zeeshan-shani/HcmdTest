// import React, { useState, useEffect } from 'react'
// import { useNavigate, useParams } from 'react-router-dom';
// import { CONST } from 'utils/constants';
// import { ReactComponent as LoaderSvg } from "assets/media/heroicons/LoginLoader.svg";
// import { PatchCheckFill } from 'react-bootstrap-icons';
// import { updateState } from 'redux/common';

// export default function UserEmailVerification() {
//     const navigate = useNavigate();
//     const params = useParams();
//     const [state, setState] = useState({ isVerified: false, loading: false });
//     useEffect(() => {
//         const verifyEmail = async () => {
//             try {
//                 updateState(setState, { loading: true });
//                 const body = { token: params.token }
//                 const { data } = await .post(CONST.API.EMAIL_VERIFICATION, body);
//                 if (data.status) updateState(setState, { isVerified: true, loading: false });
//                 else updateState(setState, { isVerified: false, loading: false, error: data?.message });
//             } catch (error) {
//                 updateState(setState, { isVerified: false, loading: false, error: 'Something went wrong.' });
//             }
//         }
//         verifyEmail();
//     }, [params.token]);

//     const { isVerified, loading, error } = state;
//     return (<>
//         <div className="text-dark">
//             <div className="main-layout card-bg-1">
//                 <div className="container d-flex flex-column">
//                     <div className="row no-gutters text-center align-items-center justify-content-center min-vh-100">
//                         <div className="col-12 col-md-6 col-lg-5 col-xl-4">
//                             <img src={CONST.APP_LOGO} alt="" style={{ maxWidth: 300, maxHeight: 200 }} />
//                             {!isVerified ? <>
//                                 <h3 className="font-weight-bold">Email Verification</h3>
//                                 {loading ? <LoaderSvg className='login_loader' /> : (error ? <h5 className='text-danger'>{error}</h5> : null)}
//                             </> :
//                                 <>
//                                     <h3 className="font-weight-bold">Email Verified Successfully</h3>
//                                     <PatchCheckFill className='text-success' size={30} />
//                                 </>}
//                             {!loading &&
//                                 <div className='mt-2'>
//                                     <button className='btn btn-primary' onClick={() => navigate('/')}>Go to HCMD Home</button></div>}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>

//     </>)
// }
