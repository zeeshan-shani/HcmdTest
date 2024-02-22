import React, { lazy, useState } from 'react'
import { CONST } from 'utils/constants';
import { ZoomIn, ZoomOut } from 'react-bootstrap-icons';
import { isMobile } from 'react-device-detect';
import ErrorBoundary from 'Components/ErrorBoundry';
import { Rnd } from 'react-rnd'
import { LazyComponent } from 'redux/common';
// import { PDFPreview } from './PDFPreview';
const PDFPreview = lazy(() => import('Routes/Chat/Main/UserChat/PDFPreview'));

export default function PopupMedia({ showModal, data, onClose }) {
    const [scale, setScale] = useState(1);
    const [state, setState] = useState({
        bounds: { left: 0, top: 0, bottom: 0, right: 0 },
        disabled: false,
        height: 200, width: 200
    });
    if (!showModal) return;
    const { disabled } = state; // height, width
    return (
        <ErrorBoundary>
            <Rnd
                style={{
                    backgroundColor: disabled || !isMobile ? 'grey' : 'red',
                    zIndex: 1025,
                    maxHeight: '90vh', maxWidth: '100vw', minHeight: '20vh', minWidth: '20vw',
                    overflow: 'hidden'
                }}
                disableDragging={disabled}
            >
                <div className="modal-content h-100" style={{ maxHeight: '90vh', maxWidth: '100vw' }}>
                    <div className="modal-header d-inline-block position-relative"
                        style={{ width: "100%", cursor: "move" }}
                        onMouseOver={() => {
                            if (disabled) setState((prev) => ({ ...prev, disabled: false }));
                        }}
                        onMouseOut={() => setState((prev) => ({ ...prev, disabled: true, }))}
                        onTouchStart={() => setState((prev) => ({ ...prev, disabled: true, }))}
                        onTouchEnd={() => {
                            if (disabled) setState((prev) => ({ ...prev, disabled: false }));
                        }}
                        onFocus={() => { }}
                        onBlur={() => { }}
                    >
                        <div className="modal-title d-flex align-items-center" style={{ gap: '25px' }}>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                style={{ marginLeft: 0 }}
                                onClick={(e) => {
                                    if (disabled) setState((prev) => ({ ...prev, disabled: true }));
                                    onClose(e);
                                }}>
                                <span aria-hidden="true">×</span>
                            </button>
                            <h5 className='mb-0'>
                                {data?.mediaType?.startsWith(CONST.MEDIA_TYPE.IMAGE) && 'Image Preview'}
                                {data?.mediaType?.startsWith(CONST.MEDIA_TYPE.VIDEO) && 'Video Preview'}
                                {data?.mediaType?.startsWith("application/pdf") && 'PDF Preview'}
                            </h5>
                        </div>
                        {data?.mediaType?.startsWith("application/pdf") &&
                            <div className='position-absolute pdf-zoom_in_out'>
                                <button type="button" className="btn btn-info p-4_8 border-0 mr-1" onClick={() => setScale(prev => prev + .2)}>
                                    <ZoomIn size={18} />
                                </button>
                                <button type="button" className="btn btn-info p-4_8 border-0" onClick={() => setScale(prev => prev - .2)}>
                                    <ZoomOut size={18} />
                                </button>
                            </div>}
                    </div>
                    {/* hide-scrollbar */}
                    <div className="modal-body p-0" style={{ overflowX: 'hidden', overflowY: 'auto', maxWidth: '100%' }} onTouchStart={() => setState((prev) => ({ ...prev, disabled: true, }))}>
                        <div className="h-100" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                            {data?.mediaType?.startsWith(CONST.MEDIA_TYPE.IMAGE) && <img src={data?.mediaUrl} alt="" />}
                            {data?.mediaType?.startsWith(CONST.MEDIA_TYPE.VIDEO) &&
                                <video width="100%" controls>
                                    <source src={data?.mediaUrl} type="video/mp4" />
                                    <source src={data?.mediaUrl} type="video/ogg" />
                                    Your browser does not support the video tag.
                                </video>}
                            {data?.mediaType?.startsWith("application/pdf") &&
                                <ErrorBoundary>
                                    <LazyComponent>
                                        <PDFPreview data={data} scale={scale} setScale={setScale} />
                                    </LazyComponent>
                                </ErrorBoundary>}
                        </div>
                    </div>
                </div>
            </Rnd>
        </ErrorBoundary>

    )
}