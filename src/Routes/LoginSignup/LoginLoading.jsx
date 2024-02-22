import React from 'react'
import { ReactComponent as LoaderSvg } from "assets/media/heroicons/LoginLoader.svg";

function LoginLoading() {
    return (
        <div className="text-dark">
            <div className="main-layout card-bg-1">
                <div className="container d-flex flex-column">
                    <div className="row no-gutters text-center align-items-center justify-content-center min-vh-100">
                        <div className="col-12 col-md-6 col-lg-5 col-xl-4">
                            <h1 className="font-weight-bold">Verifying User</h1>
                            <p className="text-dark mb-3">We are Different, We Make You Different.</p>
                            <LoaderSvg className='login_loader' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginLoading;