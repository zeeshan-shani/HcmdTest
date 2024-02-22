import React from 'react'
import Editor from 'ckeditor-advance-plugins';
import { LazyComponent } from 'redux/common';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { onUploadImage, uploadToS3 } from 'utils/AWS_S3/s3Connection';
import ErrorBoundary from 'Components/ErrorBoundry';

const knowledgeBaseItems = [
    "heading",
    "|",
    "bold",
    "italic",
    "underline",
    "fontBackgroundColor",
    "fontColor",
    "fontSize",
    "fontFamily",
    "highlight",
    "link",
    "bulletedList",
    "numberedList",
    "|",
    "outdent",
    "indent",
    "|",
    "imageUpload",
    "blockQuote",
    "insertTable",
    "mediaEmbed",
    "undo",
    "redo",
    "alignment",
]
const formFieldItems = [
    "heading",
    "bold",
    "italic",
    "underline",
    "fontBackgroundColor",
    "fontColor",
    "fontSize",
    "fontFamily",
    "highlight",
    "alignment",
]

export default function MyCkEditor({ name, value, onChange, placeHolder, module }) {
    function uploadAdapter(loader) {
        return {
            upload: () => {
                return new Promise((resolve, reject) => {
                    try {
                        loader.file.then((file) => {
                            onUploadImage(file).then((presignedUrl) => {
                                uploadToS3(presignedUrl, file).then((url) => resolve({ default: url }))
                            })
                        });
                    } catch (error) {
                        console.error(error);
                        reject(0);
                    }
                });
            }
        };
    }
    function uploadPlugin(editor) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
            return uploadAdapter(loader);
        };
    }

    return (
        <ErrorBoundary>
            <div className='text-black'>
                <LazyComponent>
                    <CKEditor
                        editor={Editor}
                        name={name}
                        data={value}
                        config={{
                            toolbar: {
                                items: module === "form-builder" ? formFieldItems : knowledgeBaseItems
                            },
                            extraPlugins: [uploadPlugin],
                            placeholder: placeHolder
                        }}
                        onReady={() => {
                            // You can store the "editor" and use when it is needed.
                            // console.log('Editor is ready to use!', editor);
                        }}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            onChange(data);
                        }}
                        onBlur={(event, editor) => { }}
                        onFocus={(event, editor) => { }}
                    />
                </LazyComponent>
            </div>
        </ErrorBoundary>
    )
}
