import React, { useCallback } from 'react'
import { Paperclip } from 'react-bootstrap-icons';
import { TASK_CONST } from 'redux/constants/taskConstants';
import { dispatch } from 'redux/store';
import taskService from 'services/APIs/services/taskService';
import { getPresignedUrl, uploadToS3 } from 'utils/AWS_S3/s3Connection';

export const AttachmentInput = ({ taskId, isTemplate = false }) => {
    const onUploadImage = useCallback(async (file) => {
        if (!file) return;
        const res = await getPresignedUrl({ fileName: file.name, fileType: file.type });
        return res.data.url;
    }, []);

    const onChangeHandler = useCallback(async (e) => {
        const files = e.target.files;
        let uploadedFiles = [];
        if (!!files.length) {
            dispatch({ type: TASK_CONST.SET_UPLOADING_ATTACHMENT, payload: true });
            for (const file of files) {
                const presignedUrl = await onUploadImage(file);
                const FileUrl = await uploadToS3(presignedUrl, file);
                uploadedFiles.push({
                    mediaUrl: FileUrl,
                    mediaType: `${file.type.split("/").shift()}/${file.name?.split(".").pop()}`,
                    fileName: file.name,
                    taskId,
                });
            };
            if (!!uploadedFiles.length) {
                const data = await taskService.addAttachment({ payload: { attachment: uploadedFiles, isTemplate } });
                dispatch({ type: TASK_CONST.SET_TASKS_ATTACHMENTS, payload: data });
                dispatch({ type: TASK_CONST.UPDATE_ACTIVITY_LOGS });
            }
            dispatch({ type: TASK_CONST.SET_UPLOADING_ATTACHMENT, payload: false });
        }
    }, [isTemplate, onUploadImage, taskId]);

    return (<>
        <label htmlFor={"fileUpload" + taskId} className="cursor-pointer m-0" title="Add Attchment">
            <Paperclip />
        </label>
        <input hidden accept="image/*" id={"fileUpload" + taskId} type="file" onChange={onChangeHandler} multiple="multiple" />
    </>)
}
