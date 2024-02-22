import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { clearBadge } from 'redux/common';

function LoginSignup() {
    useEffect(() => clearBadge(), []);

    return (
        <div className="text-dark">
            <div className="main-layout card-bg-1">
                <div className="container d-flex flex-column">
                    <div className="row no-gutters text-center align-items-center justify-content-center min-vh-100">
                        <div className="col-12 col-md-6 col-lg-5 col-xl-4 m-0">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>);
}

export default LoginSignup;