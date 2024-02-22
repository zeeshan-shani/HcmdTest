import { Navigate } from "react-router-dom";
import { AssignedRequestDetail } from "./CategoryData/CategoryDetails/AssignedRequest/AssignedRequestDetail";
import CategoryData from "./CategoryData";
import CategoryDetails from "./CategoryData/CategoryDetails";
import GenerateRequest from "./CategoryData/GenerateRequest";
import KnowledgeBaseHome from "./Home";
import { RequestDetails } from "./CategoryData/CategoryDetails/MyRequests/RequestDetail/RequestDetails";

const knowledgebaseRoutes = () => {
    const navToMain = {
        id: "kb-tab-*",
        path: "*",
        element: <Navigate to="/knowledge/home" />,
        dest: "knowledge-home",
    }
    return [
        {
            id: "kb-tab-home",
            title: 'Knowledge Base Home',
            path: 'home',
            dest: 'knowledge/home',
            element: <KnowledgeBaseHome />
        },
        {
            id: "kb-tab-category",
            title: 'Knowledge Base',
            path: 'category',
            dest: 'knowledge/category/id',
            element: <CategoryData />,
            routes: [
                {
                    id: "kb-tab-new-request",
                    title: 'New Request',
                    path: ':id/new-request',
                    dest: 'knowledge/category/id/new-request',
                    element: <GenerateRequest />,
                },
                {
                    id: "kb-tab-request",
                    title: 'Request Detail',
                    path: ':id/request/:id',
                    dest: 'knowledge/category/id/request',
                    element: <RequestDetails />,
                },
                {
                    id: "kb-tab-assigned-request",
                    title: 'Assigned Request Detail',
                    path: ':id/assignedRequest/:id',
                    dest: 'knowledge/category/id/assignedRequest',
                    element: <AssignedRequestDetail />
                },
                {
                    id: "kb-tab-article",
                    title: 'Knowledge Base',
                    path: ':id',
                    dest: 'knowledge/category/id',
                    element: <CategoryDetails />,
                },
                navToMain
            ]
        },
        {
            id: "knowledge-tab-index",
            element: <Navigate to="/knowledge/home" />,
            dest: "knowledge/home",
            index: true
        },
        navToMain
    ]
};

export default knowledgebaseRoutes;