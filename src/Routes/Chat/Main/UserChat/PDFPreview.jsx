import { useState } from "react";
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';
import { showError } from 'utils/package_config/toast';
import { Document, Page } from 'react-pdf';
// const { Document, Page } = lazy(() => import('react-pdf'));

export default function PDFPreview({ data, scale }) {
    const [numPages, setNumPages] = useState(null);

    const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
    return (
        <Document
            loading={<Loader height={'80px'} />}
            file={data?.mediaUrl}
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
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        pageNumber={index + 1} />
                ))}
            </div>
        </Document>
    )
}
