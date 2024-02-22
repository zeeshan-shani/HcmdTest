import React, { useMemo } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom';
import PageHeader from "Routes/SuperAdmin/components/PageHeader";
import adminRoutes from 'Routes/SuperAdmin/routes';
import ErrorBoundary from 'Components/ErrorBoundry';

export default function AdminDashboard() {
    const { pathname } = useLocation();
    const routes = useMemo(() => adminRoutes() || [], []);

    return (
        <div className="super-admin super-admin-list p-2 col vh-100 overflow-auto prevent-overscroll-reload">
            <PageHeader title='Admin Dashboard' />
            <ErrorBoundary>
                <div className='pt-2'>
                    <nav className='dashboard-nav my-2'>
                        <div className="nav nav-tabs flex-nowrap hide-scrollbar" id="nav-tab" role="tablist" style={{ overflowX: 'auto' }}>
                            {routes.map((tabr) => {
                                if (!tabr.path || tabr.path === "*" || (tabr.hasOwnProperty('access') && !tabr.access)) return null;
                                return (
                                    <Link key={tabr.id} to={tabr.path} className={`nav-link ${pathname.includes(tabr.dest) ? 'active' : ''}`} id={tabr.id} type="button" role="tab">
                                        <nobr>{tabr.title}</nobr>
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>
                    <div className="tab-content" id="nav-tabContent">
                        <div className={"tab-pane fade show active"} role="tabpanel">
                            <ErrorBoundary>
                                <Outlet />
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        </div>
    )
}