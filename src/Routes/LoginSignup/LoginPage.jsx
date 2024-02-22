import React, { useState, useEffect, useRef } from 'react'
import { login } from 'redux/actions/userAction';
import { loginSchema } from 'utils/validators';
import { Formik } from 'formik';

function LoginPage() {
    const [state, setState] = useState({ loading: false, error: null });
    const loginEmail = useRef(null);

    useEffect(() => {
        if (state?.error) loginEmail.current.focus();
    }, [state.error]);

    const LoginHandler = async ({ email, password, rememberMe }, { setErrors }) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await login({ email, password, rememberMe });
        setState(prev => ({ ...prev, loading: false, error: !data?.status ? data?.message : null }));
    }

    return (<>
        <h1 className="">HouseCall MD</h1>
        <h3 className="font-weight-semibold">Sign in</h3>
        <p className="text-dark mb-3">We are Different, We Make You Different.</p>
        <Formik
            validationSchema={loginSchema}
            initialValues={{ email: "", password: "", rememberMe: true }}
            onSubmit={LoginHandler}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
            }) => (
                <form className="mb-3 text-left" onSubmit={handleSubmit} noValidate>
                    {state.error && <p className="text-left mb-1 text-danger">{state.error}</p>}
                    <div className="form-group">
                        <label htmlFor="email" className="sr-only">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className={`form-control form-control-md ${(errors.email && touched.email) || state.error ? 'border-danger' : ''}`}
                            id="login_email"
                            placeholder="Enter your email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.email}
                            disabled={state.loading}
                            ref={loginEmail}
                            required
                            autoFocus
                        />
                        <p className="error">
                            {errors.email && touched.email && errors.email}
                        </p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            type="password"
                            name="password"
                            className={`form-control form-control-md  ${(errors.password && touched.password) || state.error ? 'border-danger' : ''}`}
                            id="login_password"
                            placeholder="Enter your password"
                            autoComplete='off'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.password}
                            required
                            disabled={state.loading}
                        />
                        <p className="error">
                            {errors.password && touched.password && errors.password}
                        </p>
                    </div>
                    <div className="form-group d-flex justify-content-between">
                        <div className="custom-control custom-checkbox">
                            <input type="checkbox" name='rememberMe' className="custom-control-input" id="checkbox-remember" checked={values.rememberMe} onChange={handleChange} />
                            <label className="custom-control-label text-muted font-size-sm" htmlFor="checkbox-remember">Remember me</label>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary btn-lg btn-block text-uppercase font-weight-semibold"
                        type="submit"
                        disabled={state.loading}
                    >
                        <span>{!state.loading ? 'Sign In' : 'Signing In...'}</span>
                    </button>
                </form>
            )}
        </Formik>
    </>);
}
export default LoginPage;