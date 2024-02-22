import React, { useCallback } from 'react'
// Redux
import { dispatch } from 'redux/store'
import { MODEL_CONST } from 'redux/constants/modelConstants'
import { getImageURL, toastPromise } from 'redux/common';
// Utils
import { onUploadImage, uploadToS3 } from 'utils/AWS_S3/s3Connection';
// Ant and MUi Components
import { Modal } from 'antd'
import { Edit, Info } from '@mui/icons-material';
// Components
import { MuiTooltip } from 'Components/components';
import patientService from 'services/APIs/services/patientService';
import organizationService from 'services/APIs/services/organizationService';
import ErrorBoundary from 'Components/ErrorBoundry';

export default function UserImageData({
    showModal = false, // open image modal
    data, // data should includes image, name, updateURL and profileData 
    boxInPx = "280px", // image resolution
    imageInfo = "50px" // Bottom info bar size
}) {
    const { isEditable = true, info = false } = showModal ? data : {};
    const onCloseModal = () => dispatch({ type: MODEL_CONST.USER_IMAGE_DATA, payload: null });

    // Trigger on upload new image
    const onChangePicture = useCallback(async (e) => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    let payload = { id: data.id };
                    const [file] = e.target.files;
                    const presignedUrl = await onUploadImage(file);
                    const uploadedImageUrl = await uploadToS3(presignedUrl, file);
                    if (data.updateField) payload[data.updateField] = uploadedImageUrl
                    else payload.profilePicture = uploadedImageUrl;
                    data.updateType === "patient" && await patientService.update({ payload })
                    data.updateType === "organization" && await organizationService.update({ payload })
                    dispatch({ type: MODEL_CONST.USER_IMAGE_DATA, payload: { ...data, image: uploadedImageUrl } });
                    dispatch({ type: MODEL_CONST.TABLE_UPDATE, payload: data.updateTable });
                    resolve(1);
                } catch (error) {
                    reject(0);
                }
            },
            loading: "Uploading new profile",
            error: "Could not upload profile",
            success: "Upload profile successfully",
            options: { id: "upload-user-image" }
        })
    }, [data]);

    return (
        <Modal
            open={showModal}
            getContainer={false}
            closable={false}
            onCancel={onCloseModal}
            wrapClassName="user-image-modal-content"
            bodyStyle={{ height: boxInPx, width: boxInPx }}
            footer={null}
        >
            <ErrorBoundary>
                <div>
                    <img
                        src={getImageURL(data?.image, '280x280')}
                        alt="Enlarged Avatar"
                        loading='lazy'
                        style={{ width: boxInPx, height: boxInPx, background: 'white' }} />
                    <div className="d-flex bg-dark justify-content-between px-2 text-white align-items-center" style={{ height: imageInfo }}>
                        {data?.name || 'Unknown Image'}
                        <div className='d-flex gap-10'>
                            {isEditable &&
                                <MuiTooltip title="Change photo">
                                    <div>
                                        <label htmlFor={"fileUpload-profile"} className="cursor-pointer m-0" title="Add Attchment">
                                            <Edit />
                                        </label>
                                        <input hidden accept="image/*" id={"fileUpload-profile"} type="file" onChange={onChangePicture} />
                                    </div>
                                </MuiTooltip>}
                            {info &&
                                <MuiTooltip title="More Info" className='cursor-pointer'>
                                    <Info />
                                </MuiTooltip>}
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        </Modal>
    )
}