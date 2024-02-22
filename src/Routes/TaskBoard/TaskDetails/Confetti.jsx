
import React, { lazy, useEffect, useState } from 'react'
import { LazyComponent } from 'redux/common';
const ReactConfetti = lazy(() => import('react-confetti'));

const confettiMessages = [
    // "Well done on completing the task!",
    // "Impressive work, task completed.",
    // "Great job, task accomplished!",
    // "Excellent, task successfully finished.",
    // "Kudos for completing the task!",
    // "Superb work, task done!",
    // "Bravo! Task completed with excellence.",
    // "Outstanding, task successfully accomplished.",
    // "Fantastic job, task is finished.",
    // "Job well done on the task.",
    "👏 Well done on completing the task!",
    "🌟 Impressive work, task completed.",
    "👍 Great job, task accomplished!",
    "🎉 Excellent, task successfully finished.",
    "👊 Kudos for completing the task!",
    "💯 Superb work, task done!",
    "👌 Bravo! Task completed with excellence.",
    "🙌 Outstanding, task successfully accomplished.",
    "👏 Fantastic job, task is finished.",
    "🥳 Job well done on the task.",
]

export default function ConfettiComp({ cb }) {
    const [state, setState] = useState({
        height: window.innerHeight,
        width: window.innerWidth,
        message: confettiMessages[Math.round(Math.random(9) * 10)]
    });

    useEffect(() => {
        window.onresize = () => {
            setState(prev => ({
                ...prev,
                height: window.innerHeight,
                width: window.innerWidth,
            }))
        }
        setTimeout(cb, 8000);
    }, [cb]);

    return (<>
        <div className="backdrop backdrop-visible" onClick={cb} style={{ zIndex: '9999' }}>
            <div className='d-flex confetti-message'>
                <LazyComponent fallback={<></>}>
                    <ReactConfetti width={state.width} height={state.height} />
                    <h1 className='d-flex justify-content-center text-center mx-2'>
                        <i>{state.message}</i>
                    </h1>
                </LazyComponent>
            </div>
        </div>
    </>)
}
