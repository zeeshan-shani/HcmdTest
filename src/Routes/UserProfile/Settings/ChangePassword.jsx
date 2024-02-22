import Input from 'Components/FormBuilder/components/Input';
import React, { useCallback, useState } from 'react'
import { Button } from 'react-bootstrap';
import authService from 'services/APIs/services/authService';
import { showError, showSuccess } from 'utils/package_config/toast';

const defaultState = {
    currentPassword: null,
    newPassword: null,
    confirmPassword: null
}
export default function ChangePassword() {
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState(defaultState);

    const updatePassword = useCallback(async () => {
        try {
            setLoading(true);
            const data = await authService.changePassword({ payload: state });
            if (data?.status === 1 && data?.message) showSuccess(data.message);
            else if (data?.status === 0 && data?.message) showError(data.message, "pswd-error");
        } catch (error) { }
        finally {
            setState(defaultState);
            setLoading(false);
        }
    }, [state]);

    const inputChange = useCallback(e => {
        const { name, value } = e.target;
        setState(prev => ({ ...prev, [name]: value }));
    }, []);
    return (
        <div className="card mb-3">
            <div className="card-header">
                <h6 className="mb-1">Password</h6>
                <p className="mb-0 text-muted small">Update password</p>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6 col-12">
                        <Input
                            Label='Current Password'
                            name='currentPassword'
                            handleChange={inputChange}
                            className={`form-control form-control-md`}
                            id="currentPassword"
                            placeholder="Enter current password"
                            value={state.currentPassword || ""}
                            disabled={state.loading}
                            isRequired={true}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-12">
                        <Input
                            Label='New Password'
                            name='newPassword'
                            handleChange={inputChange}
                            className={`form-control form-control-md`}
                            id="newPassword"
                            placeholder="Enter new password"
                            value={state.newPassword || ""}
                            disabled={state.loading}
                            isRequired={true}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Input
                            Label='Repeat Password'
                            name='confirmPassword'
                            handleChange={inputChange}
                            className={`form-control form-control-md`}
                            id="confirmPassword"
                            placeholder="Confirm password"
                            value={state.confirmPassword || ""}
                            disabled={state.loading || !state.newPassword}
                            error={state.newPassword && state.confirmPassword &&
                                (state.newPassword !== state.confirmPassword) ?
                                "Password doesn't match" : false}
                            isRequired={true}
                        />
                    </div>
                </div>
            </div>
            <div className="card-footer d-flex justify-content-end">
                <Button variant='link' className='text-muted mx-1' onClick={() => setState(defaultState)}>
                    Reset
                </Button>
                <Button variant='primary' type='submit'
                    disabled={(loading || !state.currentPassword || !state.confirmPassword || !state.newPassword)}
                    onClick={updatePassword}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    )
}
