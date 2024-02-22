import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeModel } from 'redux/actions/modelAction'
import { getPresignedUrl, uploadToS3 } from 'utils/AWS_S3/s3Connection';
import { SocketEmiter } from 'utils/wssConnection/Socket';
import { SOCKET } from 'utils/constants';
import { getImageURL } from 'redux/common';

export default function ProfilePicUpdate() {
    const { user } = useSelector(state => state.user);
    const inputRef = useRef();
    const [error, setError] = useState();
    const [uploading, setuploading] = useState();
    const [profileImage, setProfileImage] = useState();

    useEffect(() => {
        inputRef?.current.click();
    }, []);

    const onCancel = () => changeModel("");
    const OnSave = async () => {
        if (profileImage && !error) {
            setuploading(true);
            const presignedUrl = await onUploadImage(profileImage);
            const uploadedImageUrl = await uploadToS3(presignedUrl, profileImage);
            SocketEmiter(SOCKET.REQUEST.UPDATE_PROFILE_PIC, { profilePicture: uploadedImageUrl, });
            setuploading(false);
        }
        onCancel();
    }
    const OnProfileImageChangeHandler = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setProfileImage(e.target.files[0]);
            if (e.target.files[0].size > 5 * 1000000) setError("File size must be less than 5 MB");
            else if (error && e.target.files[0].size <= 5 * 1000000) setError();
        }
    }

    const onUploadImage = async (file) => {
        if (file) {
            const res = await getPresignedUrl({ fileName: file.name, fileType: file.type });
            return res.data.url;
        }
    }

    return (
        <div className="modal modal-lg-fullscreen fade show" id="taskModal" tabIndex={-1} role="dialog" aria-labelledby="taskModalLabel" style={{ display: 'block' }} aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="taskModalLabel">Upload Profile</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onCancel}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className='text-center'>
                            <div className="prev-img my-1">
                                {profileImage ?
                                    <img className='avatar update-image' src={URL.createObjectURL(profileImage)} alt="" />
                                    : <img className='avatar update-image' src={getImageURL(user?.profilePicture, '80x80')} alt="" />}
                            </div>
                            {error &&
                                <div className='d-flex'>
                                    <span className="text-left text-danger fs-12">{error}</span>
                                </div>}
                            <div className="form-group">
                                <div className="custom-file">
                                    <input
                                        type="file"
                                        ref={inputRef}
                                        className="custom-file-input cursor-pointer"
                                        id="profilePictureInput"
                                        accept="image/jpeg, image/jpg, image/png"
                                        onChange={OnProfileImageChangeHandler}
                                    />
                                    <label className="custom-file-label text-truncate" htmlFor="profilePictureInput">
                                        {profileImage ? profileImage.name : "Choose File"}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-light border" data-dismiss="modal" onClick={onCancel}>Close</button>
                        <button type="button" className="btn btn-primary" onClick={OnSave} disabled={!profileImage || uploading || error}>
                            {uploading ? 'Uploading...' : 'Update'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
