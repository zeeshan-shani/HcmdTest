import { useMemo,useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LazyComponent } from 'redux/common';
import { getAdminAccess } from 'utils/permission';
import { useSelector } from 'react-redux/es/hooks/useSelector';

import ErrorBoundary from 'Components/ErrorBoundry';
import DashboardHeader from 'Routes/Dashboard/components/Header';
import dashboardRoutes from 'Routes/Dashboard/routes';
import ScrumboardWrapper from 'Routes/Dashboard/scrumboard.style';
import "driver.js/dist/driver.css";

export default function DashBoard() {
    const { user } = useSelector((state) => state.user);
    const { pathname } = useLocation();
    const routes = useMemo(() => dashboardRoutes(user, getAdminAccess(user)) || [], [user]);

    return (
        <ErrorBoundary>
            <ScrumboardWrapper layoutTheme={{ headingColor: 'white', themeName: 'theme2' }}>
                <div className='vh-100 limit-scroll overflow-auto prevent-overscroll-reload'>
                    <DashboardHeader />
                    <div className="col-12 my-2 dashboard_info d-inline-block">
                        <nav className='dashboard-nav mb-2'>
                            <div className="nav nav-tabs flex-nowrap hide-scrollbar" style={{ overflowX: 'auto' }}>
                                {routes.map((tabr) => {
                                    if (!tabr.path || tabr.path === "*" || (tabr.hasOwnProperty('access') && !tabr.access)) return null;
                                    return (
                                        <Link id="tour-step-1" key={tabr.id} to={tabr.path} className={`nav-link ${pathname.includes(tabr.dest) ? 'active' : ''}`} type="button" role="tab" >
                                            <nobr>{tabr.title}</nobr>
                                        </Link>
                                    )
                                })}
                            </div>
                        </nav>
                        <div className="tab-content" style={{ paddingBottom: '60px' }}>
                            <div className="tab-pane fade show active">
                                <ErrorBoundary>
                                    <LazyComponent>
                                        <Outlet />
                                    </LazyComponent>
                                </ErrorBoundary>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrumboardWrapper>
        </ErrorBoundary>
    );
}