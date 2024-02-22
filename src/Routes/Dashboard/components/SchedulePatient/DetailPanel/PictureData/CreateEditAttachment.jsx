import { useCallback, useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import Dropzone from 'react-dropzone'
import moment from 'moment-timezone';
import ModalReactstrap from 'Components/Modals/Modal';
import { Button, Col, Row } from 'react-bootstrap';
import { onUploadImage, uploadToS3 } from 'utils/AWS_S3/s3Connection';
import { FileTarget, MultipleImage } from 'Routes/Chat/Models/Dropzone';

const defaultState = {
    imageFiles: [],
    isUploading: false,
    pdfName: '',
    pdfCaption: '',
    pdfUploadLoad: null,
    uploadLoad: null,
    note: "",
    setProfilePic: false,
}
export const CreateEditAttachment = ({ showModal, type, onSubmit, onCancel, mode = 'create', updateData, fieldName = 'field', patientId }) => {
    // const [data, setData] = useState({ note: '', file: null });
    const [state, setState] = useState(defaultState);
    const pictureBtn = useRef();

    useEffect(() => {
        showModal && !updateData &&
            setTimeout(() => {
                pictureBtn?.current?.click();
            }, 200);
        if (updateData) setState(prev => ({ ...prev, note: updateData.note }));
    }, [showModal, updateData]);

    const funcupload = useCallback(async (i, isImagePDF = false) => {
        const file = i.file;
        const onUploadProgress = (e) => {
            if (isImagePDF) setState(prev => ({ ...prev, pdfUploadLoad: parseInt(e.progress * 100) }))
            else setState(prev => ({ ...prev, uploadLoad: parseInt(e.progress * 100) }))
        }
        const presignedUrl = await onUploadImage(file);
        const uploadedImageUrl = await uploadToS3(presignedUrl, file, onUploadProgress);
        return { mediaUrl: uploadedImageUrl, mediaType: file.type, fileName: file.name };
    }, []);

    const mergeImagestoPdf = useCallback(async () => {
        const pdf = new jsPDF("p", "");
        const pdfName = state.pdfName || "HCMD_PDF_" + moment().format("MM/DD/YY");
        const paddingX = 5;
        const paddingY = 5;
        const pageWidth = pdf.internal.pageSize.getWidth();
        // const pageHeight = pdf.internal.pageSize.getHeight();
        state.imageFiles.forEach((item, index) => {
            const { file } = item;
            const imageURL = URL.createObjectURL(file);
            // pdf.addImage(imageURL, 'any', 10, (index + 1) * 10, 210, 297);
            // pdf.addImage(imageURL, 'any',);
            pdf.addImage(imageURL, "any", paddingX, paddingY, pageWidth - (paddingX * 2), 0);
            pdf.addPage();
        });
        pdf.deletePage(state.imageFiles.length + 1);
        let pdfData = pdf.output("blob")
        let myBlob = new Blob([pdfData], { type: 'application/pdf' });
        myBlob.name = pdfName;
        // myBlob.lastModified = new Date();
        const myFile = new File([myBlob], `${pdfName}.pdf`, { type: myBlob.type, });
        // pdf.save(pdfName + '.pdf');
        const url = await funcupload({
            file: myFile,
            name: state.pdfName,
            caption: state.pdfCaption
        }, true);
        return url;
    }, [state.imageFiles, state.pdfName, state.pdfCaption, funcupload]);

    const OnSave = useCallback(async () => {
        let resp = {}
        let body = { note: state.note };
        if (state.error) return;
        if (!!state.imageFiles.length) {
            setState(prev => ({ ...prev, isUploading: true }));
            if (state.imageFiles.length === 1) resp = await funcupload(state.imageFiles[0])
            else if (state.imageFiles.length > 1) resp = await mergeImagestoPdf()
        } else if (updateData.mediaUrl) {
            resp.mediaUrl = updateData.mediaUrl
        }
        body = { ...body, ...resp }
        if (state.setProfilePic) body.profilePicture = true;
        setState(defaultState)
        onSubmit(body, mode, updateData?.id || patientId);
    }, [funcupload, mergeImagestoPdf, mode, onSubmit, patientId, state.error, state.imageFiles,
        state.note, updateData?.id, state.setProfilePic, updateData?.mediaUrl]);

    const onDropFilesHandler = useCallback((filesList) => {
        let imageFiles = [];
        Array.from(filesList).map((i, ind) => {
            const fileData = { id: ind, file: i, name: i.name, caption: "", uploadLoad: 0 };
            if (i.type.includes("image")) imageFiles.push(fileData);
            else imageFiles.push(fileData);
            return null
        });
        setState(prev => ({ ...prev, imageFiles }));
        return () => {
            setState(defaultState);
        }
    }, []);

    const clearFiles = useCallback(() => {
        onDropFilesHandler([]);
    }, [onDropFilesHandler]);

    return (
        <ModalReactstrap
            show={showModal}
            size='lg'
            header={<>{mode === 'update' ? 'Edit ' + fieldName : 'Create ' + fieldName}</>}
            toggle={onCancel}
            body={
                showModal &&
                <Row>
                    <Col md={12}>
                        <Dropzone onDrop={onDropFilesHandler}>
                            {({ getRootProps, getInputProps }) => (
                                <section className='border-1 text-center py-2'>
                                    <div {...getRootProps()}>
                                        <input {...getInputProps()}
                                            type="file"
                                            id="filePictureInput"
                                            accept="image/jpeg, image/jpg, image/png"
                                            ref={pictureBtn}
                                            className="dropzone-input"
                                        />
                                        <p className='py-2 mb-0 text-color'>Drag / drop files here, or click to select files</p>
                                        {updateData &&
                                            <small className='text-muted'>Please select files to update</small>}
                                    </div>
                                </section>
                            )}
                        </Dropzone>
                    </Col>
                    <Col md={12}>
                        {!!state?.imageFiles?.length && <>
                            {state?.imageFiles.length > 1 ?
                                <MultipleImage state={state} setState={setState} />
                                :
                                (state.imageFiles.map(item =>
                                    <FileTarget key={item.id} item={item} isUploading={state.isUploading}
                                        setState={setState} progress={state.isUploading && { value: item.uploadLoad }}
                                        OnClose={clearFiles}
                                    />)
                                )
                            }
                        </>}
                    </Col>
                    {((!!state?.imageFiles?.length && state?.imageFiles?.length === 1)
                        || (mode === 'update' && updateData.mediaType.includes("image"))) &&
                        <Col md={12} className="mt-2">
                            <div className="custom-control custom-checkbox">
                                <input
                                    className="custom-control-input"
                                    id={`select-all`}
                                    name={`select-all`}
                                    type="checkbox"
                                    value={-2}
                                    checked={state.setProfilePic}
                                    onChange={e => setState(prev => ({ ...prev, setProfilePic: e.target.checked }))}
                                />
                                <label className="custom-control-label" htmlFor={`select-all`}>
                                    Set as profile picture
                                </label>
                            </div>
                        </Col>}
                    <Col md={12}>
                        <div className="form-group my-2">
                            <label htmlFor="groupName">Notes: </label>
                            <textarea
                                className="form-control form-control-md"
                                id="note"
                                name="note"
                                placeholder="Type Notes here"
                                autoComplete='off'
                                maxLength={250}
                                rows={5}
                                onChange={(e) => setState(prev => ({ ...prev, note: e.target.value }))}
                                value={state.note}
                                required
                            />
                        </div>
                    </Col>
                </Row >
            }
            footer={<>
                <Button variant='secondary' onClick={onCancel}>Cancel</Button>
                <Button variant='primary' onClick={OnSave} disabled={state.isUploading}>{state.isUploading ? 'Saving...' : 'Save'}</Button>
            </>}
        />
    )
}