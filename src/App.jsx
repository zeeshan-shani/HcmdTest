/**
 * This file contains the main App component for the application.
 * It handles the routing and authentication logic.
 * If the user is not authenticated, it renders the login/signup page.
 * If the user is authenticated, it renders the main layout and the routes based on the user's role.
 */

// patient modal change
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { isMobile } from "react-device-detect";

// Redux
import { CONST } from "utils/constants";
import { useSelector } from "react-redux/es/hooks/useSelector";
import { verifyToken } from "redux/actions/userAction";
import { defaultLight, registerFirebase, setLight, storedTheme } from "redux/common";

// Components
import getAppRoutes from "Routes";
import LoginLoading from "Routes/LoginSignup/LoginLoading";
import LoginSignup from "Routes/LoginSignup/LoginSignup";
import LoginPage from "Routes/LoginSignup/LoginPage";
import MainLayout from "Layout";

export default function App() {
  
  const { isAuthenticated, user, loading } = useSelector((state) => state.user);

  useEffect(() => {
    // Set light theme if no theme is stored
    if (!storedTheme && !defaultLight) setLight();

    if (window.location.pathname === CONST.APP_ROUTES.EMAIL_VERIFICATION) return null;

    // onLoad It will verify user with the token, if token available
    if (!isAuthenticated && localStorage.getItem("token")) verifyToken(localStorage.getItem("token"));

    // once the user is authenticated, the login device key will be registred on firebase to get notification
    if (isAuthenticated) registerFirebase();
  }, [isAuthenticated, user.id]);

  // getAppRoutes return an array of routes with access property as per the user role
  const routes = isAuthenticated && getAppRoutes({ isProvider: user?.isProvider, roleData: user?.roleData });

  // This function takes an array of routes and returns an array of Route components based on the routes provided
  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      // If the current route has sub-routes, recursively call the getRoutes function with the sub-routes and return a Route component with the sub-routes as its children
      if (route.routes)
        return <Route key={route.id} path={route.path} element={route.element} children={getRoutes(route.routes)} />;

      // If the current route has a path or index property, check if it has an access property and if it is false, return null. Otherwise, return a Route component with the path, element, and index properties
      if (route.path || route.index) {
        if (route.hasOwnProperty('access') && !route?.access) return null;
        return <Route key={route.id} path={route.path} element={route.element} index={route.index} />;
      }

      // If the current route does not have a path or index property, return null
      return null;
    });

  return (
    <React.Fragment>
      <Routes>
        {/* Render login/signup page if user is not authenticated */}
        {!isAuthenticated ? (
          <>
            <Route path="user" element={<LoginSignup isAuthenticated={isAuthenticated} />}>
              <Route path="login" element={<LoginPage />} />
            </Route>
            <Route path="*" element={<VerifyLogin loading={loading} />} />
          </>
        ) : (
          <Route element={<MainLayout />}>
            {getRoutes(routes)}
            <Route path="*" element={<Navigate to={isMobile ? CONST.APP_ROUTES.CHAT : CONST.APP_ROUTES.DASHBOARD} />} />
          </Route>
        )}
        {/* <Route path="user/verification/:token" element={<UserEmailVerification />} /> */}
      </Routes>
      <Toaster containerClassName="hot-toaster" />
    </React.Fragment>
  );
}

// Component to render login loading page or redirect to login page based on loading state
const VerifyLogin = ({ loading }) =>
  loading ? <LoginLoading /> : (!localStorage.getItem("token") && <Navigate to="/user/login" />);