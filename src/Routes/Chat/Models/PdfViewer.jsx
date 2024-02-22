import React, { useCallback, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { changeModel } from 'redux/actions/modelAction';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { handleDownload } from 'redux/common';
import { BoxArrowUpLeft, ChatLeftQuoteFill, Download, ZoomIn, ZoomOut } from 'react-bootstrap-icons';
import { showError } from 'utils/package_config/toast';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { MuiTooltip } from 'Components/components';
import { dispatch } from 'redux/store';
import { isMobile } from 'react-device-detect';
import ErrorBoundary from 'Components/ErrorBoundry';
import { Page, Document, pdfjs } from 'react-pdf';
import { MuiActionButton } from 'Components/MuiDataGrid';
import { Close } from '@mui/icons-material';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;
// const { Document, Page } = lazy(() => {
//     const { Document, Page, pdfjs } = import('react-pdf');
//     pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;
//     return { Document, Page, pdfjs }
// });

export default function PdfViewer() {
    const { pdfData } = useSelector((state) => state.chat);
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(!isMobile ? 0.5 : .9);

    const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

    const onCloseHanlder = useCallback(() => {
        changeModel("");
        dispatch({ type: CHAT_CONST.SET_PDF_URL, payload: null });
    }, []);

    const onQuote = useCallback(() => {
        dispatch({ type: CHAT_CONST.SET_QUOTE_MESSAGE, payload: pdfData.id });
        changeModel("");
    }, [pdfData?.id]);

    const onViewPopupAndQuote = useCallback(() => {
        dispatch({ type: CHAT_CONST.SET_POPUP_FILE, payload: pdfData.id });
        onQuote();
    }, [onQuote, pdfData?.id]);

    return (<>
        <div className="modal modal-lg-fullscreen fade show d-block" id="pdfViewer" tabIndex={-1} role="dialog" aria-labelledby="dropZoneLabel" aria-modal="true" style={{ overflow: 'hidden' }}>
            <div className="modal-dialog modal-dialog-centered modal-fullscreen m-0">
                <div className="modal-content position-relative">
                    <div className="modal-header justify-content-between">
                        <h5 className="modal-title" id="startConversationLabel">PDF File</h5>
                        <div className='d-flex gap-10'>
                            {pdfData?.id !== -1 &&
                                <MuiActionButton size='small' tooltip='View Popup and Quote' Icon={BoxArrowUpLeft} onClick={onViewPopupAndQuote} />}
                            {pdfData?.id !== -1 &&
                                <MuiActionButton size='small' tooltip='Quote File' Icon={ChatLeftQuoteFill} onClick={onQuote} />}
                            <MuiActionButton size='small' tooltip='Download' Icon={Download} onClick={() => handleDownload(pdfData.url, pdfData.filename)} />
                            <MuiActionButton className='text-muted' size='small' tooltip='Close' Icon={Close} onClick={onCloseHanlder} />
                        </div>
                    </div>
                    <div className="modal-body p-0 overflow-auto bg-light-color">
                        <div className="justify-content-center">
                            {/* <div className='overflow-auto'> */}
                            <ErrorBoundary>
                                <Document
                                    loading={<Loader height={'80px'} />}
                                    file={pdfData.url}
                                    options={{ workerSrc: "/pdf.worker.js" }}
                                    onLoadError={(error) => showError('Error while loading document!')}
                                    // onLoadProgress={onLoadProgress}
                                    onLoadSuccess={onDocumentLoadSuccess} >
                                    <div className="my-1">
                                        {Array.from(new Array(numPages), (el, index) => (
                                            <Page
                                                scale={scale}
                                                width={window.innerWidth}
                                                loading={<div>Loading page...</div>}
                                                key={`page_${index + 1}`}
                                                renderAnnotationLayer={false}
                                                renderTextLayer={false}
                                                pageNumber={index + 1} />
                                        ))}
                                    </div>
                                </Document>
                            </ErrorBoundary>
                        </div>
                    </div>
                    <div className='position-absolute pdf-zoom_in_out'>
                        <MuiTooltip title="Zoom-In">
                            <button type="button" className="btn btn-info p-4_8 border-0 mr-1" onClick={() => setScale(prev => prev + .2)}>
                                <ZoomIn size={18} />
                            </button>
                        </MuiTooltip>
                        <MuiTooltip title="Zoom-Out">
                            <button type="button" className="btn btn-info p-4_8 border-0" onClick={() => setScale(prev => prev - .2)}>
                                <ZoomOut size={18} />
                            </button>
                        </MuiTooltip>
                    </div>
                </div>
            </div>
        </div>
    </>);
}