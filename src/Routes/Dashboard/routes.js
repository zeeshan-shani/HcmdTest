import { lazy } from "react";
import { Navigate } from "react-router-dom";
import BoardList from "Routes/Dashboard/components/Chat";
import UsersInfo from "Routes/Dashboard/components/Users";
import UsersAttendanceLogs from "Routes/SuperAdmin/components/AttendanceLogs";
const SchedulePatient = lazy(() => import('Routes/Dashboard/components/SchedulePatient'));
// const Calendar = lazy(() => import('Routes/Dashboard/components/Calendar'));

const dashboardRoutes = (user, isAdmin = false) => {
    return [
        {
            id: "dashboard-tab-index",
            element: <Navigate to="board" />,
            dest: "dashboard/board",
            index: true
        },
        {
            id: "dashboard-tab-board",
            title: 'Chats',
            path: "board",
            dest: "dashboard/board",
            element: <BoardList />,
        },
        {
            id: "dashboard-tab-rouding-sheet",
            title: 'Rounding Sheet',
            path: "rounding-sheet",
            element: <SchedulePatient key="rounding-sheet" />,
            dest: "dashboard/rounding-sheet",
            access: user?.isProvider || isAdmin
        },
        {
            id: "dashboard-tab-rouding-history",
            title: 'Rounding History',
            path: "rounding-history",
            element: <SchedulePatient key="rounding-history" isHistory />,
            dest: "dashboard/rounding-history",
            access: user?.isProvider || isAdmin
        },
        // {
        //     id: "dashboard-tab-calendar",
        //     title: 'Calendar',
        //     path: "calendar",
        //     element: <Calendar type="provider" />,
        //     dest: "dashboard/calendar",
        //     access: user?.isProvider
        // },
        {
            id: "dashboard-tab-attendance",
            title: 'Attendance Logs',
            path: "attendance",
            element: <UsersAttendanceLogs onlyMe={true} />,
            dest: "dashboard/attendance",
            access: !user?.isProvider
        },
        {
            id: "dashboard-tab-users",
            title: 'Users',
            path: "users",
            element: <UsersInfo />,
            dest: "dashboard/users",
            // access: !user?.isProvider || isAdmin
        },
        {
            id: "dashboard-tab-*",
            path: "*",
            element: <Navigate to="board" />,
            dest: "dashboard/board",
        },
    ]
};

export default dashboardRoutes;