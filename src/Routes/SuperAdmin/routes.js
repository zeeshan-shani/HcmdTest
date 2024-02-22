import { Navigate } from "react-router-dom";
import UsersTable from "Routes/SuperAdmin/components/Users";
import UsersAttendanceLogs from "Routes/SuperAdmin/components/AttendanceLogs";
import UserTaskLogs from "Routes/SuperAdmin/components/TaskLogs";
import KBCategory from "Routes/SuperAdmin/components/Categories";
import UserDesignation from "Routes/SuperAdmin/components/UserDesignation";
import Patients from "Routes/SuperAdmin/components/Patients";
import PaymentCode from 'Routes/SuperAdmin/components/PaymentCode';
// import AppoinmentCalendar from 'Routes/SuperAdmin/components/AppoinmentCalendar';
import Facility from 'Routes/SuperAdmin/components/Facility';
import Organization from 'Routes/SuperAdmin/components/Organization';
import OutsideProvider from "Routes/SuperAdmin/components/OutsideProvider";
import TaskCategories from "./components/TaskCategories";

const adminRoutes = () => {
    return [
        {
            id: "admin-tab-index",
            element: <Navigate to="users" />,
            dest: "admin/users",
            index: true
        },
        {
            id: "admin-tab-users",
            title: 'Users',
            path: 'users',
            dest: 'admin/users',
            element: <UsersTable key={"users"} />,
        },
        {
            id: "admin-tab-provider",
            title: 'HCMD Providers',
            path: 'providers',
            dest: 'admin/providers',
            element: <UsersTable key={"HCMDProvider"} />,
        },
        {
            id: "admin-tab-attendance",
            title: 'Attendance Logs',
            path: 'attendance',
            dest: 'admin/attendance',
            element: <UsersAttendanceLogs />,
        },
        {
            id: "admin-tab-tasklog",
            title: 'Task Logs',
            path: 'tasklog',
            dest: 'admin/tasklog',
            element: <UserTaskLogs />,
        },
        {
            id: "admin-tab-kb-categories",
            title: 'Knowledge based category',
            path: 'kb-categories',
            dest: 'admin/kb-categories',
            element: <KBCategory />,
        },
        {
            id: "admin-tab-task-categories",
            title: 'Task category',
            path: 'task-categories',
            dest: 'admin/task-categories',
            element: <TaskCategories />,
        },
        {
            id: "admin-tab-designation",
            title: 'User Groups',
            path: 'designation',
            dest: 'admin/designation',
            element: <UserDesignation />,
        },
        {
            id: "admin-tab-patient",
            title: 'Patient',
            path: 'patient',
            dest: 'admin/patient',
            element: <Patients />,
        },
        {
            id: "admin-tab-paymentCode",
            title: 'Payment Code',
            path: 'paymentCode',
            dest: 'admin/paymentCode',
            element: <PaymentCode />,
        },
        // {
        //     id: "admin-tab-calendar",
        //     title: 'Appointment Calendar',
        //     path: 'calendar',
        //     dest: 'admin/calendar',
        //     element: <AppoinmentCalendar />,
        // },
        {
            id: "admin-tab-facility",
            title: 'Facility',
            path: 'facility',
            dest: 'admin/facility',
            element: <Facility />,
        },
        {
            id: "admin-tab-organization",
            title: 'Organization',
            path: 'organization',
            dest: 'admin/organization',
            element: <Organization />,
        },
        {
            id: "admin-tab-*",
            path: "*",
            element: <Navigate to="users" />,
            dest: "admin/users",
        },
        {
            id: "admin-tab-outside-provider",
            title: 'Outside Provider',
            path: 'outside-provider',
            dest: 'admin/outside-provider',
            element: <OutsideProvider />,
        },
    ]
};

export default adminRoutes;