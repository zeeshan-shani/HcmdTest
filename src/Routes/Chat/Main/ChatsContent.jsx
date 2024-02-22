import React, { lazy, useCallback, useEffect } from 'react';
import ErrorBoundary from 'Components/ErrorBoundry';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { generatePayload, LazyComponent } from 'redux/common';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { setUserHandler } from '../Sidebar/Chat';
import WelcomeChat from './WelcomeChat';
import { getChatDetails } from 'services/helper';
import patientService from 'services/APIs/services/patientService';
import { setCategoryChat, setPatientChat } from 'redux/actions/chatAction';
import taskCategoryService from 'services/APIs/services/taskCategoryService';
const UserChat = lazy(() => import('Routes/Chat/Main/UserChat'));

export default function ChatsContent() {
    const navigate = useNavigate();
    const params = useParams();
    const [chatState] = useOutletContext();
    const { user } = useSelector((state) => state.user);
    const { activeChat, activePatientChat, activeCategoryChat } = useSelector((state) => state.chat);

    const setChatDetails = useCallback(async () => {
        if (activeChat?.id && params.chatId && activeChat.id === params.chatId) return;
        if (activeChat.id === -1) {
            const chat = await getChatDetails(Number(params.chatId));
            if (chat) setUserHandler({ chat, activeChatId: activeChat?.id, userId: user.id, navigate });
        }
    }, [activeChat?.id, params?.chatId, user.id, navigate]);

    const getPatientDetails = useCallback(async () => {
        if (activePatientChat && activePatientChat?.id === params.patientId) return;
        if (!activePatientChat) {
            const payload = await generatePayload({
                rest: { id: Number(params.patientId) },
                options: { populate: ["patientAssign", "lastAllocatedSlot", "facilityInfo"] },
                findOne: true
            })
            const { data: patient } = await patientService.list({ payload });
            if (patient) {
                setPatientChat(patient);
                // navigate(`/chats/patient/${patient.id}`);
            }
        }
    }, [activePatientChat, params?.patientId]);

    const getCategoryDetails = useCallback(async () => {
        if (activeCategoryChat && activeCategoryChat?.id === params.categoryId) return;
        if (!activeCategoryChat) {
            let payload = await generatePayload({
                rest: { id: params.categoryId },
                findOne: true,
            });
            const { data: category } = await taskCategoryService.list({ payload });
            if (category) {
                setCategoryChat(category);
                // navigate(`/chats/category/${category.id}`);
            }
        }
    }, [activeCategoryChat, params?.categoryId]);

    useEffect(() => {
        if (params.chatId) setChatDetails()
        else if (params.patientId) getPatientDetails()
        else if (params.categoryId) getCategoryDetails()
        //eslint-disable-next-line
    }, [params.chatId, params.patientId, params.categoryId]);

    return (
        (activeChat && activeChat.id !== -1) ||
            (activePatientChat) ||
            (activeCategoryChat) ?
            <ErrorBoundary>
                <LazyComponent>
                    <UserChat
                        chatState={chatState}
                        key={activeChat.id || activePatientChat.id || activeCategoryChat.id}
                    />
                </LazyComponent>
            </ErrorBoundary>
            :
            <WelcomeChat />);
}