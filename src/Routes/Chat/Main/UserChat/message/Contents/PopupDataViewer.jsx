import { useState } from 'react';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { ZoomIn, ZoomOut } from "react-bootstrap-icons";
import { showError } from "utils/package_config/toast";
import { CONST } from 'utils/constants';
import { Document, Page } from "react-pdf";

export default function PopupDataviewer({ popupData }) {
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1);
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    }
    return (<>
        <div className={`chat-content position-relative ${popupData?.mediaType?.startsWith("application/pdf") ? '' : 'd-flex align-items-center'}`} style={{ backgroundColor: 'rgba(0,0,0,.3)' }}>
            <div className="container">
                <div className='col-12 px-0'>
                    {popupData?.mediaType?.startsWith(CONST.MEDIA_TYPE.IMAGE) &&
                        <img src={popupData?.mediaUrl} alt="" />}
                    {popupData?.mediaType?.startsWith(CONST.MEDIA_TYPE.VIDEO) &&
                        <video width="100%" controls>
                            <source src={popupData?.mediaUrl} type="video/mp4" />
                            <source src={popupData?.mediaUrl} type="video/ogg" />
                            Your browser does not support the video tag.
                        </video>}
                    {popupData?.mediaType?.startsWith('application/pdf') &&
                        <Document
                            loading={<Loader height={'80px'} />}
                            file={popupData?.mediaUrl}
                            options={{ workerSrc: "/pdf.worker.js" }}
                            onLoadError={(error) => showError('Error while loading document!')}
                            // onLoadProgress={onLoadProgress}
                            onLoadSuccess={onDocumentLoadSuccess} >
                            <div className="my-1">
                                {Array.from(new Array(numPages), (el, index) => (
                                    <Page
                                        scale={scale}
                                        loading={<div>Loading page...</div>}
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1} />
                                ))}
                            </div>
                        </Document>

                    }
                </div>
            </div>
            {popupData?.mediaType?.startsWith("application/pdf") &&
                <div className='position-absolute pdf-zoom_in_out'>
                    <button type="button" className="btn btn-info p-4_8 border-0 mr-1" onClick={() => setScale(prev => prev + .2)}>
                        <ZoomIn size={18} />
                    </button>
                    <button type="button" className="btn btn-info p-4_8 border-0" onClick={() => setScale(prev => prev - .2)}>
                        <ZoomOut size={18} />
                    </button>
                </div>}
        </div>
    </>
    )
}
