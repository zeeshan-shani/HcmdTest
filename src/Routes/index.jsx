import { CONST } from 'utils/constants';
import { getAdminAccess } from 'utils/permission';

// bootstrap icons
import CardChecklist from "react-bootstrap-icons/dist/icons/card-checklist";
import ChatRightDots from "react-bootstrap-icons/dist/icons/chat-right-dots";
import Collection from "react-bootstrap-icons/dist/icons/collection";
import DatabaseCheck from "react-bootstrap-icons/dist/icons/database-check";
import Laptop from "react-bootstrap-icons/dist/icons/laptop";
import PersonCircle from "react-bootstrap-icons/dist/icons/person-circle";
import FileEarmarkCode from 'react-bootstrap-icons/dist/icons/file-earmark-code';

// App Routes
import ChatsPage from "Routes/Chat";
import DashBoard from "Routes/Dashboard";
import AdminDashboard from "Routes/SuperAdmin";
import TaskPage from "Routes/TaskBoard/TaskPage";
import UserProfile from "Routes/UserProfile";
 import TourGuidePage from './UserProfile/TourGuidePage';

import KnowledgeBase from 'Routes/KnowledgeBase';
import HCMDFormBuilder from 'Routes/FormBuilder';

// Additional Routes
import dashboardRoutes from 'Routes/Dashboard/routes';
import adminRoutes from 'Routes/SuperAdmin/routes';
import chatRoutes from 'Routes/Chat/routes';
import knowledgebaseRoutes from 'Routes/KnowledgeBase/routes';
import { dispatch } from 'redux/store';
import { CHAT_CONST } from 'redux/constants/chatConstants';
import { Tour } from '@mui/icons-material';

const getAppRoutes = (user) => {
    const adminAccess = getAdminAccess(user);
    const dashboardRoute = dashboardRoutes(user, adminAccess);
    const knowledgeRoutes = knowledgebaseRoutes();
    const adminRoute = adminRoutes();
    const chatRoute = chatRoutes();
    const onChatHome = () => dispatch({ type: CHAT_CONST.DELETE_ACTIVE_CHAT, payload: null });

    return [
        {
            id: 'dashboard-tab',
            title: 'Dashboard',
            className: 'nav-item',
            linkClassName: `nav-link p-0 `,
            icon: <Laptop size={20} />,
            pathname: CONST.APP_ROUTES.DASHBOARD,
            path: 'dashboard',
            element: <DashBoard />,
            routes: dashboardRoute
        },
        {
            id: 'admin-tab',
            title: 'Admin',
            className: 'nav-item',
            linkClassName: `nav-link p-0 `,
            icon: <DatabaseCheck size={20} />,
            pathname: CONST.APP_ROUTES.SUPER_ADMIN,
            path: 'admin',
            element: <AdminDashboard />,
            routes: adminRoute,
            access: adminAccess,
        },
        {
            id: 'chats-tab',
            title: 'Chats',
            className: 'nav-item',
            linkClassName: `nav-link p-0 `,
            icon: <ChatRightDots size={20} />,
            pathname: CONST.APP_ROUTES.CHAT,
            path: 'chats',
            element: <ChatsPage />,
            routes: chatRoute,
            onClick: onChatHome
        },
        {
            id: 'tasks-tab',
            title: 'Tasks',
            className: 'nav-item',
            linkClassName: `nav-link p-0 `,
            icon: <CardChecklist size={20} />,
            pathname: CONST.APP_ROUTES.TASK,
            path: 'tasks',
            element: <TaskPage />,
            // access: !user?.isProvider || adminAccess,
            hasUpdates: false
        },
        {
            id: 'knowledge-base-tab',
            title: 'Knowledge base',
            className: 'nav-item',
            linkClassName: `nav-link p-0 `,
            icon: <Collection size={20} />,
            pathname: CONST.APP_ROUTES.ISSUES,
            path: 'knowledge',
            element: <KnowledgeBase />,
            routes: knowledgeRoutes,
        },
        {
            id: 'profile-tab',
            title: 'Profile',
            className: 'nav-item',
            linkClassName: `nav-link p-0 `,
            icon: <PersonCircle size={20} />,
            pathname: CONST.APP_ROUTES.PROFILE,
            path: 'profile',
            element: <UserProfile />,
        },
        // {
        //     id: 'tour-guide-tab',
        //     title: 'Tour Guide',
        //     className: 'nav-item',
        //     linkClassName: `nav-link p-0 `,
        //     icon: <Tour size={20} />,
        //     pathname: CONST.APP_ROUTES.TourController,
        //     path: 'tour-controller',
        //     element: <TourGuidePage />,
        //   },
        {
            id: 'form-builder-tab',
            title: 'FormBuilder',
            className: 'nav-item d-none',
            linkClassName: `nav-link p-0 `,
            icon: <FileEarmarkCode size={20} />,
            pathname: CONST.APP_ROUTES.FORM_BUILDER,
            path: 'form-builder',
            element: <HCMDFormBuilder />,
        },
    ];
}

export default getAppRoutes;