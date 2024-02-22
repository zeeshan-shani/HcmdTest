import React, { useEffect, useMemo, useState } from 'react'
import { toastPromise } from 'redux/common';
import { updateUserAPI } from 'redux/actions/userAction';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import chatService from 'services/APIs/services/chatService';

export default function Notifications() {
    const { user } = useSelector(state => state.user);
    const [state, setState] = useState({
        patientNoti: false,
        keywordNoti: false,
        mentionedNoti: false,
    });
    const { patientNoti, keywordNoti, mentionedNoti } = state;

    useEffect(() => {
        (async () => {
            try {
                const payload = {
                    query: { userId: user.id },
                    options: {
                        attributes: ["isMentionMessageCountMute", "isPatientMentionCountMute", "atTheRateMentionMessageCountMute"],
                    },
                    findOne: true
                };
                const data = await chatService.chatuserList({ payload })
                if (data?.status) {
                    setState(prev => ({
                        ...prev,
                        silentMode: false,
                        patientNoti: data.data?.isPatientMentionCountMute || false,
                        mentionedNoti: data.data?.atTheRateMentionMessageCountMute || false,
                        keywordNoti: data.data?.isMentionMessageCountMute || false,
                    }))
                }
                // return data;
            } catch (error) {
                console.error(error);
            }
        })();
    }, [user.id]);

    const updateNotificationState = async ({
        isMentionMessageCountMute = state.keywordNoti,
        isPatientMentionCountMute = state.patientNoti,
        atTheRateMentionMessageCountMute = state.mentionedNoti,
    }) => {
        await toastPromise({
            func: async (resolve, reject) => {
                try {
                    const payload = { isMentionMessageCountMute, isPatientMentionCountMute, atTheRateMentionMessageCountMute }
                    const data = await chatService.muteNotification({ payload });
                    if (data?.status) {
                        let update = {};
                        if (data.data.hasOwnProperty('isPatientMentionCountMute')) update.patientNoti = data.data.isPatientMentionCountMute;
                        if (data.data.hasOwnProperty('atTheRateMentionMessageCountMute')) update.mentionedNoti = data.data.atTheRateMentionMessageCountMute;
                        if (data.data.hasOwnProperty('isMentionMessageCountMute')) update.keywordNoti = data.data.isMentionMessageCountMute;
                        setState(prev => ({ ...prev, ...update }));
                    }
                    resolve(data);
                } catch (error) {
                    console.error(error);
                    reject(error);
                }
            },
            loading: 'Updating data',
            success: 'Successfully updated data',
            error: 'Could not update data',
            options: { id: "notification" }
        })
    }

    const notificationTypes = useMemo(() => [
        {
            id: 'mentioned-notification',
            title: 'User Mentioned Notification',
            subTitle: 'Keep the option off to get notification.',
            disabled: false,
            checked: mentionedNoti,
            onUpdate: { atTheRateMentionMessageCountMute: !mentionedNoti },
            icon: <div className="d-flex align-items-center badge badge-rounded bg-at-the-rate text-white mr-1 position-relative badge-custom"><span>@</span></div>

        },
        {
            id: 'keyword-notification',
            title: 'Keyword Notification',
            subTitle: 'Keep the option off to get notification.',
            disabled: false,
            checked: keywordNoti,
            onUpdate: { isMentionMessageCountMute: !keywordNoti },
            icon: <div className="d-flex align-items-center badge badge-rounded bg-hashtag text-white mr-1 position-relative badge-custom"><span>#</span></div>
        },
        {
            id: 'patient-notification',
            title: 'Patient Mentioned Notification',
            subTitle: 'Keep the option off to get notification.',
            disabled: false,
            checked: patientNoti,
            onUpdate: { isPatientMentionCountMute: !patientNoti },
            icon: <div className="d-flex align-items-center badge badge-rounded bg-dr-patient text-white mr-1 position-relative badge-custom"><span>&#x002B;</span></div>
        }
    ], [patientNoti, keywordNoti, mentionedNoti]);

    const userNotificationTypes = useMemo(() => [
        {
            id: 'silent-notification',
            title: 'Silent Mode',
            subTitle: 'Silent mode will mute routine, emergency and urgent notifications.',
            disabled: false,
            checked: user.isSilentMode,
            onUpdate: { isSilentMode: !user.isSilentMode },
            icon: <></>
        },
        {
            id: 'emergency-notification',
            title: 'Emergency Notification',
            subTitle: 'Keep the option off to get notification.',
            disabled: false,
            checked: user.isEmergencyNotificationMute,
            onUpdate: { isEmergencyNotificationMute: !user.isEmergencyNotificationMute },
            icon: <div className="d-flex align-items-center badge badge-rounded bg-emergency text-white mr-1 position-relative badge-custom">1</div>
        },
        {
            id: 'urgent-notification',
            title: 'Urgent Notification',
            subTitle: 'Keep the option off to get notification.',
            disabled: false,
            checked: user.isUrgentNotificationMute,
            onUpdate: { isUrgentNotificationMute: !user.isUrgentNotificationMute },
            icon: <div className="d-flex align-items-center badge badge-rounded bg-urgent text-white mr-1 position-relative badge-custom">1</div>
        },
        {
            id: 'routine-notification',
            title: 'Routine Notification',
            subTitle: 'Keep the option off to get notification.',
            disabled: false,
            checked: user.isRoutineNotificationMute,
            onUpdate: { isRoutineNotificationMute: !user.isRoutineNotificationMute },
            icon: <div className="d-flex align-items-center badge badge-rounded bg-routine text-white mr-1 position-relative badge-custom">1</div>
        },

    ], [user.isSilentMode, user.isEmergencyNotificationMute, user.isUrgentNotificationMute, user.isRoutineNotificationMute,]);
    try {
        return (
            <div className="card mb-3">
                <div className="card-header">
                    <h6 className="mb-1">Mute Notification Configuration</h6>
                    <p className="mb-0 text-muted small">Update notifications</p>
                </div>
                <div className="card-body p-0">
                    <ul className="list-group list-group-flush list-group-sm-column">
                        {userNotificationTypes.map((item) => (
                            <li className="list-group-item py-2" key={item.id}>
                                <div className="media align-items-center">
                                    {item.icon}
                                    <div className="media-body">
                                        <p className="mb-0">{item.title}</p>
                                        <p className="small text-muted mb-0">{item.subTitle}</p>
                                    </div>
                                    <div className="custom-control custom-switch mr-2">
                                        <input type="checkbox" className="custom-control-input" id={item.id} checked={item.checked} onChange={() => updateUserAPI({ userId: user.id, ...item.onUpdate })} disabled={item.disabled} />
                                        <label className="custom-control-label" htmlFor={item.id}>&nbsp;</label>
                                    </div>
                                </div>
                            </li>))}
                        {notificationTypes.map((item) => (
                            <li className="list-group-item py-2" key={item.id}>
                                <div className="media align-items-center">
                                    {item.icon}
                                    <div className="media-body">
                                        <p className="mb-0">{item.title}</p>
                                        <p className="small text-muted mb-0">{item.subTitle}</p>
                                    </div>
                                    <div className="custom-control custom-switch mr-2">
                                        <input type="checkbox" className="custom-control-input" id={item.id} checked={item.checked} onChange={() => updateNotificationState(item.onUpdate)} disabled={item.disabled} />
                                        <label className="custom-control-label" htmlFor={item.id}>&nbsp;</label>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    } catch (error) {
        console.error(error);
    }
}

// import React, { useEffect, useMemo, useState } from 'react'
// import { updateUserAPI } from 'redux/actions/userAction';

// export default function Notifications({ user }) {
//     const [state, setState] = useState({
//         silentMode: user.isSilentMode,
//         patientNoti: user.isPatientMentionCountMute,
//         keywordNoti: user.isMentionMessageCountMute,
//         mentionedNoti: user.atTheRateMentionMessageCountMute,
//     });
//     const { silentMode, patientNoti, keywordNoti, mentionedNoti } = state;

//     useEffect(() => {
//         setState(prev => ({
//             ...prev,
//             silentMode: user.isSilentMode,
//             patientNoti: user.isPatientMentionCountMute,
//             keywordNoti: user.isMentionMessageCountMute,
//             mentionedNoti: user.atTheRateMentionMessageCountMute,
//         }));

//     }, [user.isSilentMode, user.isPatientMentionCountMute, user.isMentionMessageCountMute, user.atTheRateMentionMessageCountMute]);

//     const updateNotificationState = async ({
//         isMentionMessageCountMute = state.keywordNoti,
//         isPatientMentionCountMute = state.patientNoti,
//         atTheRateMentionMessageCountMute = state.mentionedNoti,
//         isSilentMode = state.silentMode
//     }) => {
//         await updateUserAPI({ userId: user.id, isMentionMessageCountMute, isPatientMentionCountMute, atTheRateMentionMessageCountMute, isSilentMode });
//     }

//     const notificationTypes = useMemo(() => [
//         {
//             id: 'mentioned-notification',
//             title: 'User Mentioned Notification',
//             subTitle: 'Keep the option on to get notification.',
//             checked: mentionedNoti,
//             onUpdate: { atTheRateMentionMessageCountMute: !mentionedNoti }
//         },
//         {
//             id: 'keyword-notification',
//             title: 'Keyword Notification',
//             subTitle: 'Keep the option on to get notification.',
//             checked: keywordNoti,
//             onUpdate: { isMentionMessageCountMute: !keywordNoti }
//         },
//         {
//             id: 'patient-notification',
//             title: 'Patient Mentioned Notification',
//             subTitle: 'Keep the option on to get notification.',
//             checked: patientNoti,
//             onUpdate: { isPatientMentionCountMute: !patientNoti }
//         },
//         {
//             id: 'silent-notification',
//             title: 'Silent Notification',
//             subTitle: 'Silent routine, emergency and urgent notification.',
//             checked: silentMode,
//             onUpdate: { isSilentMode: !silentMode }
//         },
//     ], [patientNoti, keywordNoti, mentionedNoti, silentMode]);

//     try {
//         return (
//             <div className="card mb-3">
//                 <div className="card-header">
//                     <h6 className="mb-1">Notification</h6>
//                     <p className="mb-0 text-muted small">Update notifications sound</p>
//                 </div>
//                 <div className="card-body p-0">
//                     <ul className="list-group list-group-flush list-group-sm-column">
//                         {notificationTypes.map((item) => (
//                             <li className="list-group-item py-2" key={item.id}>
//                                 <div className="media align-items-center">
//                                     <div className="media-body">
//                                         <p className="mb-0">{item.title}</p>
//                                         <p className="small text-muted mb-0">{item.subTitle}</p>
//                                     </div>
//                                     <div className="custom-control custom-switch mr-2">
//                                         <input type="checkbox" className="custom-control-input" id={item.id} checked={item.checked} onChange={() => updateNotificationState(item.onUpdate)} />
//                                         <label className="custom-control-label" htmlFor={item.id}>&nbsp;</label>
//                                     </div>
//                                 </div>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             </div>
//         );
//     } catch (error) {
//         console.error(error);
//     }
// }