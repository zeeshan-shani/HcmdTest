import AttachmentCard from "Routes/TaskBoard/TaskDetails/Attachments/AttachmentCard";
import { Paperclip } from "react-bootstrap-icons";
import { getPresignedUrl, uploadToS3 } from "utils/AWS_S3/s3Connection";
import { ISSUE_CONST } from "redux/constants/issuesConstants";
import { dispatch } from "redux/store";
import knowledgebaseService from "services/APIs/services/knowledgebaseService";

export const IssueAttachments = ({ requestData, onChangeHandler, setImageShow, attchmentDeleteHandler, editMode = false, type }) => {
    const attachments = requestData.issuesAttachments ? requestData.issuesAttachments : [];
    const attachData = attachments.filter(item => item.type === type);
    return (
        <div className="">
            <div className="mb-1">
                <div className="card-body task-attachment-body">
                    <div className='d-flex justify-content-between'>
                        <h6>
                            Attachments ({attachData?.length})
                        </h6>
                        {editMode && <>
                            <label htmlFor="fileUpload" className="btn btn-info btn-sm m-0" title="Add Attchment">
                                <span>Add Attachments</span>
                            </label>
                            <input id="fileUpload" type="file" onChange={onChangeHandler} multiple hidden />
                        </>}
                    </div>
                    <div className='d-flex flex-row flex-wrap'>
                        {attachData?.map((att) => (
                            <AttachmentCard
                                key={att.id}
                                att={att}
                                requestData={requestData}
                                setImageShow={setImageShow}
                                attchmentDeleteHandler={attchmentDeleteHandler}
                            />)
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const AttachmentInput = ({ requestData }) => {
    const onChangeHandler = async (e) => {
        const files = e.target.files;
        let uploadedFiles = [];
        for (const file of files) {
            const presignedUrl = await onUploadImage(file);
            const FileUrl = await uploadToS3(presignedUrl, file);
            uploadedFiles.push({
                mediaUrl: FileUrl,
                mediaType: `${file.type.split("/").shift()}/${file.name?.split(".").pop()}`,
                fileName: file.name,
            });
        };
        if (uploadedFiles.length > 0) {
            const data = await knowledgebaseService.addAttachment({
                payload: {
                    attachments: uploadedFiles,
                    issueId: requestData.id
                }
            });
            dispatch({ type: ISSUE_CONST.SET_ISSUES_ATTACHMENTS, payload: data });
        }
    }
    const onUploadImage = async (file) => {
        if (file) {
            const res = await getPresignedUrl({ fileName: file.name, fileType: file.type });
            return res.data.url;
        }
    }
    return (<>
        <label htmlFor="fileUpload" className="cursor-pointer m-0" title="Add Attchment">
            <Paperclip />
        </label>
        <input hidden id="fileUpload" type="file" onChange={(e) => onChangeHandler(e)} multiple />
    </>)
}
