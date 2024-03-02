import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getPresignedUrl, uploadToS3 } from 'utils/AWS_S3/s3Connection';
import { MicFill, PauseFill, StopFill, TrashFill } from 'react-bootstrap-icons';
import moment from 'moment-timezone';
import { useAudioRecorder } from '@sarafhbk/react-audio-recorder';
import { showError } from 'utils/package_config/toast';
import { MuiTooltip } from 'Components/components';
import { Button } from 'react-bootstrap';
import audioBufferToWav from 'audiobuffer-to-wav';
import { toast } from 'react-hot-toast';
let isPermissionGranted = false;

const defaultState = {
    isUploading: false,
    isRecording: false,
    isBlocked: true,
    file: null,
    fileName: null,
    blobData: null,
    fileBlob: null,
    isMerging: false,
    mergedFile: null,
    mergedUrl: null,
    fileSaved: false
}

const media = { audio: true, video: false }

export default function AudioFooter(props) {
    const { audioResult, timer, startRecording, stopRecording, pauseRecording, resumeRecording, status } = useAudioRecorder();
    const [state, setState] = useState(defaultState);
    const recordBtn = useRef();
    const { isUploading, isRecording, isBlocked, file, fileName } = state;

    useEffect(() => {
        setTimeout(() => {
            !isBlocked &&
                recordBtn?.current?.click();
        }, 500);
        // return () => {
        //     if (!isBlocked) {
        //         // console.log("disconnecting mic", state.stream);
        //     }
        // }
    }, [isBlocked]);

    useEffect(() => {
        navigator.getUserMedia = (
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia
        );
        if (navigator.mediaDevices) {
            isPermissionGranted = true;
            if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
                navigator.getUserMedia(media, (stream) => {
                    isPermissionGranted = true;
                    setState(prev => ({ ...prev, isBlocked: false, stream }))
                }, () => setState(prev => ({ ...prev, isBlocked: true })));
            } else {
                navigator.mediaDevices.getUserMedia(media).then((stream) => {
                    isPermissionGranted = true;
                    setState(prev => ({ ...prev, isBlocked: false, stream }))
                }).catch(() => setState(prev => ({ ...prev, isBlocked: true })));
            }
        }
    }, [isBlocked, isRecording]);

    const getAudioPresignedurl = useCallback(async () => {
        let fileData = file || state.mergedFile
        if (!fileData) return;
        const res = await getPresignedUrl({ fileName: fileData.name, fileType: fileData.type });
        return (res.data.url)
    }, [file, state.mergedFile]);

    const onSendAudioMessage = useCallback(async (e) => {
        e.preventDefault();
        if (!navigator.onLine) {
            toast.dismiss("offline-dictation-warn1");
            return showError("You're offline! Could not save the dictation.", { id: "offline-dictation-warn1", duration: 8 * 1000 });
            // await props.onSubmitAudio({ fileData });
        } else {
            let fileData = (props.parentFile || state.mergedFile) ? state.mergedFile : file;
            setState(prev => ({ ...prev, isUploading: true }));
            const presignedUrl = await getAudioPresignedurl(fileData);
            if (presignedUrl) {
                const uploadedAudioUrl = await uploadToS3(presignedUrl, fileData);
                await props.onSubmitAudio({ fileType: fileData.type, fileName, uploadedAudioUrl });
            }
        }
        setState(prev => ({ ...prev, ...defaultState }));
        props.setRecorder(false);
    }, [file, fileName, getAudioPresignedurl, props, state.mergedFile]);

    const onStart = useCallback(() => {
        if (isBlocked || !isPermissionGranted)
            showError("Permission Denied, Your Connection is not Secured!");
        else if (!navigator.onLine) {
            toast.dismiss("offline-dictation-warn2")
            showError("You're offline! You might be face issue while uploading the dictation.", { id: "offline-dictation-warn2", duration: 8 * 1000 });
        }
        else if (status === "paused") resumeRecording();
        else {
            setState(prev => ({ ...prev, isRecording: true }));
            startRecording();
        }
    }, [isBlocked, resumeRecording, startRecording, status]);

    const onPause = useCallback(() => pauseRecording(), [pauseRecording]);

    const onStop = useCallback(() => {
        setState(prev => ({
            ...prev, isRecording: false,
            fileName: `Audio-${(props.visitDate ? moment(props.visitDate) : moment()).format("MM/DD/YY")}`,
            fileSaved: true
        }));
        stopRecording();
    }, [stopRecording, props?.visitDate]);

    useEffect(() => {
        if (audioResult) {
            const createFile = async () => {
                const res = await fetch(audioResult);
                const blob = await res.blob();
                if (props.parentFile) {
                    setState(prev => ({ ...prev, isMerging: true }));
                    const audioBuffer = await getAudioBufferFromRecordedFile(blob)
                    const { file, url } = await mergeAudioFiles(props.parentFile.mediaUrl, audioBuffer);
                    setState(prev => ({ ...prev, "mergedFile": file, "mergedUrl": url, isMerging: false }));
                } else {
                    const audioBuffer = await getAudioBufferFromRecordedFile(blob);
                    const mergedBuffer = await mergeBuffers([audioBuffer]);
                    const wavBuffer = audioBufferToWav(mergedBuffer);
                    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
                    // const file = new File([wavBlob], 'output.wav', { type: 'audio/wav' });
                    // let audiofile = new File([blob], `Audio-${moment().format("MM/DD/YY")}`, { type: "audio/mp3", lastModified: Date.now() });
                    let audiofile = new File([wavBlob], `${state.fileName || Date.now()}.wav`, { type: "audio/wav", lastModified: Date.now() });
                    setState(prev => ({ ...prev, "file": audiofile, "fileBlob": blob, "blobData": URL.createObjectURL(blob) }));
                }
            }
            createFile();
        }
    }, [audioResult, props.parentFile, state.fileName]);

    const onTransh = useCallback(() => {
        if (isRecording) onStop();
        props.setRecorder(false);
    }, [isRecording, onStop, props]);

    return (<>
        <div className={`preaudio-footer chat-footer d-flex flex-wrap justify-content-between flex-row align-items-center ${props.type !== 'dictation' ? 'recording-footer' : ''}`}>
            <div className='gap-5'>
                {props.type !== "dictation" &&
                    <MuiTooltip title='Delete'>
                        <div className="btn p-4_8 audio_btn" role="button" onClick={onTransh}>
                            <TrashFill fill="#ff337c" size={20} />
                        </div>
                    </MuiTooltip>}
                {!state.fileSaved &&
                    <MuiTooltip title={status !== 'recording' ? (status === "paused" ? 'Resume' : 'Record New') : "Listening audio..."}>
                        <span>
                            <Button variant='primary' onClick={onStart} disabled={status === 'recording'} ref={recordBtn} size='sm'>
                                {status !== 'recording' ? <>
                                    <MicFill fill='#fff' size={16} /> {(status === "paused" ? 'Resume' : 'Record New')}
                                </> : 'Listening...'}
                            </Button>
                        </span>
                    </MuiTooltip>}
                {isRecording && <>
                    {status !== "paused" &&
                        <MuiTooltip title='Pause'>
                            <Button variant='primary' onClick={onPause} size='sm'>
                                <PauseFill fill='#fff' size={20} /> Pause
                            </Button>
                        </MuiTooltip>}
                    <MuiTooltip title='Stop Recording'>
                        <Button variant='secondary' onClick={onStop} size='sm'>
                            <StopFill fill="#ff337c" size={20} /> Stop
                            ({status !== "idle" && <span className='text-right'>{moment.utc(timer * 1000).format('mm:ss')}</span>})
                        </Button>
                    </MuiTooltip>
                </>}
            </div>
            <div>
                {!navigator.onLine && <span className='d-flex align-items-center text-danger'>You're Offline!</span>}
                {state.blobData && status === "idle" &&
                    <audio controls id={'audio-' + 999} className='audio-input' preload='metadata'>
                        <source src={state.blobData} type="audio/ogg" />
                        <source src={state.blobData} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>}
                {state.mergedUrl && status === "idle" &&
                    <audio controls id={'audio-' + 999} className='audio-input' preload='metadata' title='mergedFile'>
                        <source src={URL.createObjectURL(state.mergedUrl)} type="audio/ogg" />
                        <source src={URL.createObjectURL(state.mergedUrl)} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>}
            </div>
        </div >
        {
            audioResult && !isRecording &&
            <div className="chat-footer recording-footer d-flex flex-row align-items-center">
                <form className="d-flex w-100" onSubmit={onSendAudioMessage}>
                    <div className="input-group align-items-center">
                        <input
                            type="text"
                            className={`form-control search ${props?.type === 'dictation' ? '' : 'mx-2 h-75'}`}
                            value={fileName ? fileName : ''}
                            placeholder="Filename"
                            onChange={(e) =>
                                setState(prev => ({ ...prev, fileName: e.target.value }))
                            } />
                    </div>
                    {(file || state.mergedFile || state.isMerging) &&
                        <button
                            type="submit"
                            className="btn btn-primary m-1 align-items-center audio_btn border-none"
                            data-orientation="next"
                            disabled={isUploading || isBlocked || !fileName || state.isMerging}
                        >
                            {props.type !== "dictation" ?
                                (!state.isMerging) && (isUploading ? 'Sending...' : 'Send') :
                                (!state.isMerging) && (isUploading ? 'Saving...' : 'Save')
                            }
                            {(state.isMerging) && 'Loading...'}
                        </button>}
                </form>
            </div>
        }
    </>);
}

const mergeAudioFiles = async (fileURL = "", recordedAudioBuffer) => {
    const response1 = await fetch(fileURL);
    const arrayBuffer1 = await response1.arrayBuffer();
    const audioBuffer1 = await decodeAudioData(arrayBuffer1);
    const mergedBuffer = await mergeBuffers([audioBuffer1, recordedAudioBuffer]);
    const wavBuffer = audioBufferToWav(mergedBuffer);
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    const file = new File([wavBlob], 'output.wav', { type: 'audio/wav' });
    return { file, url: wavBlob };
};

export const decodeAudioData = (arrayBuffer) => {
    return new Promise((resolve, reject) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.decodeAudioData(arrayBuffer, resolve, reject);
    });
};

const mergeBuffers = async (audioBuffers) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const output = await audioContext.createBuffer(
        audioBuffers[0].numberOfChannels,
        audioBuffers.reduce((total, buffer) => total + buffer.length, 0),
        audioBuffers[0].sampleRate
    );
    let offset = 0;
    audioBuffers.forEach((buffer) => {
        for (let channel = 0; channel < buffer.numberOfChannels; channel++)
            output.copyToChannel(buffer.getChannelData(channel), channel, offset);
        offset += buffer.length;
    });
    return output;
};

// Function to convert Blob to ArrayBuffer
const blobToArrayBuffer = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
};

const getAudioBufferFromRecordedFile = async (recordedAudioBlob) => {
    try {
        const arrayBuffer = await blobToArrayBuffer(recordedAudioBlob);
        const audioBuffer = await decodeAudioData(arrayBuffer);

        // Use the audioBuffer for further processing or playback
        return audioBuffer;
    } catch (error) {
        console.error('Error decoding audio data:', error);
    }
};