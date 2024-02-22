import { Navigate } from "react-router-dom";
import ChatsContent from "./Main/ChatsContent";
import GroupInvite from "./Main/GroupInvite";
import WelcomeChat from "./Main/WelcomeChat";
import ChatDrafts from "./Main/ChatDrafts";
import ThreadsMessages from "./Main/ThreadsMessages";
import AnnouncementComponent from "./Main/Announcements";
const chatRoutes = () => {
    return [
        {
            id: "chat-welcome",
            dest: "chats/users",
            index: true,
            element: <WelcomeChat />,
        },
        {
            id: "chat-user",
            title: 'userChat',
            path: 'chat/:chatId',
            dest: 'chat/chatId',
            element: <ChatsContent />,
        },
        {
            id: "chat-announcement",
            title: 'announcementChat',
            path: 'announcement',
            dest: 'announcement',
            element: <AnnouncementComponent />,
        },
        {
            id: "chat-patient",
            title: 'patientChat',
            path: 'patient/:patientId',
            dest: 'patient/patientId',
            element: <ChatsContent />,
        },
        {
            id: "chat-category",
            title: 'categoryChat',
            path: 'category/:categoryId',
            dest: 'category/categoryId',
            element: <ChatsContent />,
        },
        {
            id: "chat-group-invite",
            title: 'groupInvite',
            path: 'groupInvite/:key',
            dest: 'groupInvite/key',
            element: <GroupInvite />,
        },
        {
            id: "chat-draft",
            title: 'Drafts',
            path: 'drafts',
            dest: 'drafts',
            element: <ChatDrafts />,
        },
        {
            id: "chat-threads",
            title: 'Threads',
            path: 'threads',
            dest: 'threads',
            element: <ThreadsMessages />,
        },
        {
            id: "chat-tab-*",
            path: "*",
            element: <Navigate to="/chats" />,
            dest: "chats",
        }
    ]
};

export default chatRoutes;